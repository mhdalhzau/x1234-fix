import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../models/database.js';
import { users, tenants, refreshTokens } from '../models/schema.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateRandomToken } from '../utils/jwt.js';
import { sendWelcomeEmail, sendActivationEmail, generateOTP } from '../utils/email.js';

const router = Router();

// Register new tenant schema
const registerTenantSchema = z.object({
  businessName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  ownerName: z.string().min(2).max(100),
  ownerEmail: z.string().email(),
  password: z.string().min(6),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Refresh token schema
const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

// Register new tenant with owner account
router.post('/register', async (req, res) => {
  try {
    const data = registerTenantSchema.parse(req.body);
    
    // Check if tenant email already exists
    const existingTenant = await db.select().from(tenants).where(eq(tenants.email, data.email));
    if (existingTenant.length > 0) {
      return res.status(400).json({ message: 'Business email already registered' });
    }

    // Check if owner email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, data.ownerEmail));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Owner email already registered' });
    }

    // Create tenant
    const [newTenant] = await db.insert(tenants).values({
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
    }).returning();

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create owner user
    const [newUser] = await db.insert(users).values({
      username: data.ownerName,
      email: data.ownerEmail,
      password: passwordHash,
      role: 'tenant_owner',
    }).returning();

    // Send welcome email
    await sendWelcomeEmail(data.email, data.businessName);

    // Generate tokens
    const payload = {
      userId: newUser.id,
      tenantId: newTenant.id,
      role: newUser.role,
      email: newUser.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await db.insert(refreshTokens).values({
      userId: newUser.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(201).json({
      message: 'Tenant registered successfully',
      tenant: {
        id: newTenant.id,
        businessName: newTenant.businessName,
        email: newTenant.email,
        status: newTenant.status,
      },
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user by email
    const [foundUser] = await db.select().from(users).where(eq(users.email, data.email));

    if (!foundUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password (using the password field from existing database)
    const isValidPassword = await verifyPassword(data.password, foundUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!foundUser.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Generate tokens 
    const payload = {
      userId: foundUser.id,
      tenantId: foundUser.role === 'superadmin' ? null : foundUser.tenantId,
      role: foundUser.role,
      email: foundUser.email,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await db.insert(refreshTokens).values({
      userId: foundUser.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
      },
      tenant: foundUser.role === 'superadmin' ? null : foundUser.tenantId,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const data = refreshTokenSchema.parse(req.body);

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(data.refreshToken);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Check if refresh token exists in database
    const [storedToken] = await db.select()
      .from(refreshTokens)
      .where(and(
        eq(refreshTokens.token, data.refreshToken),
        eq(refreshTokens.userId, payload.userId)
      ));

    if (!storedToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    // Generate new access token with clean payload (remove exp property)
    const cleanPayload = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      email: payload.email,
    };
    const newAccessToken = generateAccessToken(cleanPayload);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const data = refreshTokenSchema.parse(req.body);

    // Delete refresh token
    await db.delete(refreshTokens).where(eq(refreshTokens.token, data.refreshToken));

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;