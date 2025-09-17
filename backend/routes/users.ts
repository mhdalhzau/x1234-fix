import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../models/database.js';
import { users } from '../models/schema.js';
import { requireAuth, requireSuperadmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Update user schema
const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['superadmin', 'tenant_owner', 'admin', 'staff']).optional(),
});

// Get all users (superadmin only)
router.get('/', requireAuth, requireSuperadmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users);

    res.json(allUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', requireAuth, requireSuperadmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const data = updateUserSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning();

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid data', 
        errors: error.errors 
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', requireAuth, requireSuperadmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const authReq = req as AuthenticatedRequest;
    
    // Prevent self-deletion
    if (authReq.user.userId === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user
    await db.delete(users).where(eq(users.id, userId));

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;