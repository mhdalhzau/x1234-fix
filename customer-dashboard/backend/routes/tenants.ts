import { Router } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../models/database.js';
import { tenants, users, outlets, subscriptions, modules, tenantModules } from '../models/schema.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get current tenant info
router.get('/me', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const [tenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.id, authReq.user!.tenantId));

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Get tenant stats
    const userCount = await db.select({ count: users.id }).from(users).where(eq(users.tenantId, tenant.id));
    const outletCount = await db.select({ count: outlets.id }).from(outlets).where(eq(outlets.tenantId, tenant.id));

    res.json({
      ...tenant,
      stats: {
        totalUsers: userCount.length,
        totalOutlets: outletCount.length,
      },
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tenant info (owner only)
const updateTenantSchema = z.object({
  businessName: z.string().min(2).max(255).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

router.put('/me', requireAuth, requireRole(['owner']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = updateTenantSchema.parse(req.body);

    const [updatedTenant] = await db.update(tenants)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, authReq.user!.tenantId))
      .returning();

    res.json(updatedTenant);
  } catch (error) {
    console.error('Update tenant error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tenant modules
router.get('/modules', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const tenantModulesList = await db.select({
      module: modules,
      tenantModule: tenantModules,
    })
    .from(modules)
    .leftJoin(tenantModules, eq(modules.id, tenantModules.moduleId))
    .where(eq(tenantModules.tenantId, authReq.user!.tenantId));

    res.json(tenantModulesList);
  } catch (error) {
    console.error('Get tenant modules error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle module (owner only)
const toggleModuleSchema = z.object({
  moduleId: z.string().uuid(),
  isEnabled: z.boolean(),
});

router.post('/modules/toggle', requireAuth, requireRole(['owner']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = toggleModuleSchema.parse(req.body);

    // Check if module exists
    const [module] = await db.select().from(modules).where(eq(modules.id, data.moduleId));
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Update or insert tenant module
    const existingTenantModule = await db.select()
      .from(tenantModules)
      .where(and(
        eq(tenantModules.tenantId, authReq.user!.tenantId),
        eq(tenantModules.moduleId, data.moduleId)
      ));

    if (existingTenantModule.length > 0) {
      await db.update(tenantModules)
        .set({
          isEnabled: data.isEnabled,
          enabledAt: new Date(),
          enabledBy: authReq.user!.userId,
        })
        .where(and(
          eq(tenantModules.tenantId, authReq.user!.tenantId),
          eq(tenantModules.moduleId, data.moduleId)
        ));
    } else {
      await db.insert(tenantModules).values({
        tenantId: authReq.user!.tenantId,
        moduleId: data.moduleId,
        isEnabled: data.isEnabled,
        enabledBy: authReq.user!.userId,
      });
    }

    res.json({ message: 'Module updated successfully' });
  } catch (error) {
    console.error('Toggle module error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin routes - get all tenants (superadmin only)
router.get('/admin/all', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    // For now, only allow if user email is admin@example.com (superadmin)
    if (authReq.user!.email !== 'admin@example.com') {
      return res.status(403).json({ message: 'Superadmin access required' });
    }

    const allTenants = await db.select()
      .from(tenants)
      .orderBy(desc(tenants.createdAt));

    res.json(allTenants);
  } catch (error) {
    console.error('Get all tenants error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin suspend/activate tenant
const updateTenantStatusSchema = z.object({
  status: z.enum(['trial', 'active', 'suspended', 'expired']),
});

router.put('/admin/:tenantId/status', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    // For now, only allow if user email is admin@example.com (superadmin)
    if (authReq.user!.email !== 'admin@example.com') {
      return res.status(403).json({ message: 'Superadmin access required' });
    }

    const { tenantId } = req.params;
    const data = updateTenantStatusSchema.parse(req.body);

    const [updatedTenant] = await db.update(tenants)
      .set({
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    if (!updatedTenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json(updatedTenant);
  } catch (error) {
    console.error('Update tenant status error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;