import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../models/database.js';
import { outlets, tenants } from '../models/schema.js';
import { requireAuth, requireRole, requireTenantBound } from '../middleware/auth.js';
const router = Router();
// Get all outlets for tenant
router.get('/', requireAuth, async (req, res) => {
    try {
        const authReq = req;
        // If user is admin (no tenant), return empty array
        if (!authReq.user.tenantId || authReq.user.role === 'admin') {
            return res.json([]);
        }
        const tenantId = authReq.user.tenantId;
        const tenantOutlets = await db.select()
            .from(outlets)
            .where(eq(outlets.tenantId, tenantId));
        res.json(tenantOutlets);
    }
    catch (error) {
        console.error('Get outlets error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Get single outlet
router.get('/:id', requireAuth, requireTenantBound, async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const tenantId = authReq.user.tenantId;
        const [outlet] = await db.select()
            .from(outlets)
            .where(and(eq(outlets.id, id), eq(outlets.tenantId, tenantId)));
        if (!outlet) {
            return res.status(404).json({ message: 'Outlet not found' });
        }
        res.json(outlet);
    }
    catch (error) {
        console.error('Get outlet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Create new outlet (owner/manager only)
const createOutletSchema = z.object({
    name: z.string().min(2).max(255),
    address: z.string().optional(),
    phone: z.string().optional(),
});
router.post('/', requireAuth, requireTenantBound, requireRole(['owner', 'manager']), async (req, res) => {
    try {
        const authReq = req;
        const data = createOutletSchema.parse(req.body);
        // Check tenant outlet limits
        const tenantId = authReq.user.tenantId;
        const [tenant] = await db.select()
            .from(tenants)
            .where(eq(tenants.id, tenantId));
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        // Check current outlet count
        const currentOutlets = await db.select()
            .from(outlets)
            .where(eq(outlets.tenantId, tenantId));
        if (currentOutlets.length >= tenant.maxOutlets) {
            return res.status(400).json({
                message: `Outlet limit reached. Maximum ${tenant.maxOutlets} outlets allowed for your plan.`
            });
        }
        // Create outlet
        const [newOutlet] = await db.insert(outlets).values({
            tenantId: tenantId,
            name: data.name,
            address: data.address,
            phone: data.phone,
            createdBy: authReq.user.userId,
        }).returning();
        res.status(201).json(newOutlet);
    }
    catch (error) {
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
router.put('/:id', requireAuth, requireTenantBound, requireRole(['owner', 'manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const data = updateOutletSchema.parse(req.body);
        const tenantId = authReq.user.tenantId;
        const [updatedOutlet] = await db.update(outlets)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where(and(eq(outlets.id, id), eq(outlets.tenantId, tenantId)))
            .returning();
        if (!updatedOutlet) {
            return res.status(404).json({ message: 'Outlet not found' });
        }
        res.json(updatedOutlet);
    }
    catch (error) {
        console.error('Update outlet error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Delete outlet (owner only)
router.delete('/:id', requireAuth, requireTenantBound, requireRole(['owner']), async (req, res) => {
    try {
        const { id } = req.params;
        const authReq = req;
        const tenantId = authReq.user.tenantId;
        const deletedOutlet = await db.delete(outlets)
            .where(and(eq(outlets.id, id), eq(outlets.tenantId, tenantId)))
            .returning();
        if (deletedOutlet.length === 0) {
            return res.status(404).json({ message: 'Outlet not found' });
        }
        res.json({ message: 'Outlet deleted successfully' });
    }
    catch (error) {
        console.error('Delete outlet error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
export default router;
