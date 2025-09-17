import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../models/database.js';
import { outlets, tenants } from '../models/schema.js';
import { requireAuth, requireRole, requireTenantBound, canAccessTenant, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Get all outlets for tenant (tenant_owner and admin only)
router.get('/', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // If user is superadmin (no tenant), return all outlets
    if (authReq.user!.role === 'superadmin') {
      const allOutlets = await db.select().from(outlets);
      return res.json(allOutlets);
    }
    
    // Regular tenant users get their tenant outlets only
    if (!authReq.user!.tenantId) {
      return res.json([]);
    }
    
    const tenantId = authReq.user!.tenantId!;
    const tenantOutlets = await db.select()
      .from(outlets)
      .where(eq(outlets.tenantId, tenantId));

    res.json(tenantOutlets);
  } catch (error) {
    console.error('Get outlets error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single outlet (tenant_owner and admin only)
router.get('/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;

    // Superadmin can access any outlet
    if (authReq.user!.role === 'superadmin') {
      const [outlet] = await db.select()
        .from(outlets)
        .where(eq(outlets.id, id));

      if (!outlet) {
        return res.status(404).json({ message: 'Outlet not found' });
      }
      return res.json(outlet);
    }

    // Regular tenant users - enforce tenant boundary
    const tenantId = authReq.user!.tenantId;
    if (!tenantId) {
      return res.status(403).json({ message: 'Access denied: tenant required' });
    }

    const [outlet] = await db.select()
      .from(outlets)
      .where(and(
        eq(outlets.id, id),
        eq(outlets.tenantId, tenantId)
      ));

    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found' });
    }

    res.json(outlet);
  } catch (error) {
    console.error('Get outlet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new outlet (owner/manager only)
const createOutletSchema = z.object({
  name: z.string().min(2).max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  tenantId: z.string().optional(), // Required for superadmin
});

router.post('/', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = createOutletSchema.parse(req.body);

    let tenantId: string;

    // Handle superadmin - can create for any tenant
    if (authReq.user!.role === 'superadmin') {
      if (!data.tenantId) {
        return res.status(400).json({ 
          message: 'Superadmin must specify target tenant_id in request body for outlet creation' 
        });
      }
      tenantId = data.tenantId;
    } else {
      // Regular tenant users use their own tenant
      tenantId = authReq.user!.tenantId!;
    }

    // Check tenant outlet limits
    const [tenant] = await db.select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Check current outlet count (enforce limits even for superadmin)
    const currentOutlets = await db.select()
      .from(outlets)
      .where(eq(outlets.tenantId, tenantId));

    if (currentOutlets.length >= tenant.maxOutlets) {
      return res.status(400).json({ 
        message: `Outlet limit reached. Maximum ${tenant.maxOutlets} outlets allowed for tenant ${tenant.businessName}.` 
      });
    }

    // Create outlet
    const [newOutlet] = await db.insert(outlets).values({
      tenantId: tenantId,
      name: data.name,
      address: data.address,
      phone: data.phone,
      createdBy: authReq.user!.userId,
    }).returning();

    res.status(201).json(newOutlet);
  } catch (error) {
    console.error('Create outlet error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update outlet (owner/manager only)
const updateOutletSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.put('/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;
    const data = updateOutletSchema.parse(req.body);

    // Superadmin can update any outlet
    if (authReq.user!.role === 'superadmin') {
      const [updatedOutlet] = await db.update(outlets)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(outlets.id, id))
        .returning();

      if (!updatedOutlet) {
        return res.status(404).json({ message: 'Outlet not found' });
      }
      return res.json(updatedOutlet);
    }

    const tenantId = authReq.user!.tenantId!;

    const [updatedOutlet] = await db.update(outlets)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(
        eq(outlets.id, id),
        eq(outlets.tenantId, tenantId)
      ))
      .returning();

    if (!updatedOutlet) {
      return res.status(404).json({ message: 'Outlet not found' });
    }

    res.json(updatedOutlet);
  } catch (error) {
    console.error('Update outlet error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete outlet (owner only)
router.delete('/:id', requireAuth, requireRole(['superadmin', 'tenant_owner']), async (req, res) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthenticatedRequest;

    // Superadmin can delete any outlet
    if (authReq.user!.role === 'superadmin') {
      const [deletedOutlet] = await db.delete(outlets)
        .where(eq(outlets.id, id))
        .returning();

      if (!deletedOutlet) {
        return res.status(404).json({ message: 'Outlet not found' });
      }
      return res.json({ message: 'Outlet deleted successfully' });
    }

    const tenantId = authReq.user!.tenantId!;

    const deletedOutlet = await db.delete(outlets)
      .where(and(
        eq(outlets.id, id),
        eq(outlets.tenantId, tenantId)
      ))
      .returning();

    if (deletedOutlet.length === 0) {
      return res.status(404).json({ message: 'Outlet not found' });
    }

    res.json({ message: 'Outlet deleted successfully' });
  } catch (error) {
    console.error('Delete outlet error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;