import express from 'express';
import { db } from '../models/database';
import { themeSettings, insertThemeSettingsSchema } from '../models/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get theme settings for current tenant
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user?.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant required.' });
    }

    const settings = await db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.tenantId, user.tenantId))
      .limit(1);

    if (settings.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        primaryColor: '#3B82F6',
        secondaryColor: '#6B7280',
        accentColor: '#10B981',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        borderRadius: '8',
        fontSize: '14',
        fontFamily: 'Inter',
        darkMode: false,
        customCSS: '',
        logoUrl: null,
        faviconUrl: null,
        brandName: null,
        companyName: null,
        customDomain: null,
        whiteLabel: false
      };
      
      return res.json(defaultSettings);
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update or create theme settings for current tenant
router.put('/', requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user?.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant required.' });
    }

    // Validate input
    const validatedData = insertThemeSettingsSchema.parse({
      ...req.body,
      tenantId: user.tenantId
    });

    // Check if settings already exist
    const existing = await db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.tenantId, user.tenantId))
      .limit(1);

    let result;
    
    if (existing.length === 0) {
      // Create new settings
      result = await db
        .insert(themeSettings)
        .values(validatedData)
        .returning();
    } else {
      // Update existing settings
      result = await db
        .update(themeSettings)
        .set({ 
          ...validatedData,
          updatedAt: new Date()
        })
        .where(eq(themeSettings.tenantId, user.tenantId))
        .returning();
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error saving theme settings:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({ error: 'Invalid input data', details: (error as any).errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload logo for current tenant
router.post('/logo', requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    if (!user?.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant required.' });
    }

    const { logoUrl } = req.body;

    if (!logoUrl) {
      return res.status(400).json({ error: 'Logo URL is required' });
    }

    // Update logo URL in theme settings
    const result = await db
      .update(themeSettings)
      .set({ 
        logoUrl,
        updatedAt: new Date()
      })
      .where(eq(themeSettings.tenantId, user.tenantId))
      .returning();

    if (result.length === 0) {
      // Create new settings with logo if none exist
      const newSettings = await db
        .insert(themeSettings)
        .values({
          tenantId: user.tenantId,
          logoUrl,
          primaryColor: '#3B82F6',
          secondaryColor: '#6B7280',
          accentColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderRadius: '8',
          fontSize: '14',
          fontFamily: 'Inter',
          darkMode: false
        })
        .returning();
      
      return res.json(newSettings[0]);
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Set custom domain for current tenant
router.put('/custom-domain', requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    // Only tenant owners can set custom domains
    if (user?.role !== 'tenant_owner') {
      return res.status(403).json({ error: 'Access denied. Only tenant owners can set custom domains.' });
    }

    if (!user?.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant required.' });
    }

    const { customDomain } = req.body;

    // Basic domain validation
    if (customDomain && !customDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)) {
      return res.status(400).json({ error: 'Invalid domain format' });
    }

    // Check if domain is already used by another tenant
    if (customDomain) {
      const existingDomain = await db
        .select()
        .from(themeSettings)
        .where(
          and(
            eq(themeSettings.customDomain, customDomain),
            eq(themeSettings.tenantId, user.tenantId)
          )
        )
        .limit(1);

      if (existingDomain.length > 0) {
        return res.status(400).json({ error: 'Domain already in use by another tenant' });
      }
    }

    // Update custom domain
    const result = await db
      .update(themeSettings)
      .set({ 
        customDomain,
        updatedAt: new Date()
      })
      .where(eq(themeSettings.tenantId, user.tenantId))
      .returning();

    if (result.length === 0) {
      // Create new settings with domain if none exist
      const newSettings = await db
        .insert(themeSettings)
        .values({
          tenantId: user.tenantId,
          customDomain,
          primaryColor: '#3B82F6',
          secondaryColor: '#6B7280',
          accentColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderRadius: '8',
          fontSize: '14',
          fontFamily: 'Inter',
          darkMode: false
        })
        .returning();
      
      return res.json(newSettings[0]);
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error setting custom domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle white label mode for current tenant
router.put('/white-label', requireAuth, async (req, res) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    
    // Only tenant owners can toggle white label
    if (user?.role !== 'tenant_owner') {
      return res.status(403).json({ error: 'Access denied. Only tenant owners can toggle white label mode.' });
    }

    if (!user?.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant required.' });
    }

    const { whiteLabel } = req.body;

    if (typeof whiteLabel !== 'boolean') {
      return res.status(400).json({ error: 'whiteLabel must be a boolean' });
    }

    // Update white label setting
    const result = await db
      .update(themeSettings)
      .set({ 
        whiteLabel,
        updatedAt: new Date()
      })
      .where(eq(themeSettings.tenantId, user.tenantId))
      .returning();

    if (result.length === 0) {
      // Create new settings with white label if none exist
      const newSettings = await db
        .insert(themeSettings)
        .values({
          tenantId: user.tenantId,
          whiteLabel,
          primaryColor: '#3B82F6',
          secondaryColor: '#6B7280',
          accentColor: '#10B981',
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderRadius: '8',
          fontSize: '14',
          fontFamily: 'Inter',
          darkMode: false
        })
        .returning();
      
      return res.json(newSettings[0]);
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error setting white label mode:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;