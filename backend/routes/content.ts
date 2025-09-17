import { Router } from 'express';
import { eq, desc, and, count, asc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../models/database.js';
import { 
  blogPosts, 
  faqs, 
  testimonials, 
  roadmapFeatures, 
  featureVotes,
  insertBlogPostSchema,
  insertFaqSchema,
  insertTestimonialSchema,
  insertRoadmapFeatureSchema
} from '../models/schema.js';
import { requireAuth, requireRole, requireSuperadmin, AuthenticatedRequest } from '../middleware/auth.js';
import { verifyAccessToken } from '../utils/jwt.js';

const router = Router();

// =============================================================================
// BLOG POSTS ROUTES
// =============================================================================

// Get all blog posts (public for published, admin access for all)
router.get('/blog', async (req, res) => {
  try {
    const { status, category, search, limit = '10', offset = '0' } = req.query;
    
    let query = db.select().from(blogPosts);
    let conditions = [];
    
    // Check if user is authenticated with admin role
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        isAdmin = ['superadmin', 'tenant_owner', 'admin'].includes(payload.role);
      } catch (error) {
        // Invalid token, continue as public access
      }
    }
    
    if (!isAdmin) {
      conditions.push(eq(blogPosts.status, 'published'));
    }
    
    if (status && typeof status === 'string') {
      conditions.push(eq(blogPosts.status, status as any));
    }
    
    if (category && typeof category === 'string') {
      conditions.push(eq(blogPosts.category, category));
    }
    
    if (search && typeof search === 'string') {
      conditions.push(
        sql`${blogPosts.title} ILIKE ${`%${search}%`} OR ${blogPosts.excerpt} ILIKE ${`%${search}%`}`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const posts = await query
      .orderBy(desc(blogPosts.publishDate), desc(blogPosts.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    const [totalCount] = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    res.json({
      posts,
      total: totalCount?.count || 0,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single blog post
router.get('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id));
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Check if user is authenticated with admin role
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        isAdmin = ['superadmin', 'tenant_owner', 'admin'].includes(payload.role);
      } catch (error) {
        // Invalid token, continue as public access
      }
    }
    
    // If not admin and post is not published, return 404
    if (!isAdmin && post.status !== 'published') {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment view count
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
    
    res.json({ ...post, views: post.views + 1 });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create blog post (admin only)
router.post('/blog', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = insertBlogPostSchema.parse({
      ...req.body,
      createdBy: authReq.user!.userId
    });
    
    const [newPost] = await db
      .insert(blogPosts)
      .values(data)
      .returning();
    
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create blog post error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update blog post (admin only)
router.put('/blog/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertBlogPostSchema.partial().parse(req.body);
    
    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!updatedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json(updatedPost);
  } catch (error) {
    console.error('Update blog post error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete blog post (admin only)
router.delete('/blog/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!deletedPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =============================================================================
// FAQ ROUTES
// =============================================================================

// Get all FAQs (published for public, all for admin)
router.get('/faq', async (req, res) => {
  try {
    const { category, search, published } = req.query;
    
    let query = db.select().from(faqs);
    let conditions = [];
    
    // Check if user is authenticated with admin role
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        isAdmin = ['superadmin', 'tenant_owner', 'admin'].includes(payload.role);
      } catch (error) {
        // Invalid token, continue as public access
      }
    }
    
    if (!isAdmin || published === 'true') {
      conditions.push(eq(faqs.isPublished, true));
    }
    
    if (category && typeof category === 'string') {
      conditions.push(eq(faqs.category, category));
    }
    
    if (search && typeof search === 'string') {
      conditions.push(
        sql`${faqs.question} ILIKE ${`%${search}%`} OR ${faqs.answer} ILIKE ${`%${search}%`}`
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const faqList = await query.orderBy(asc(faqs.order), desc(faqs.createdAt));
    
    res.json(faqList);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single FAQ
router.get('/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [faq] = await db
      .select()
      .from(faqs)
      .where(eq(faqs.id, id));
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Check if user is authenticated with admin role
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        isAdmin = ['superadmin', 'tenant_owner', 'admin'].includes(payload.role);
      } catch (error) {
        // Invalid token, continue as public access
      }
    }
    
    // If not admin and FAQ is not published, return 404
    if (!isAdmin && !faq.isPublished) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    // Increment view count
    await db
      .update(faqs)
      .set({ views: sql`${faqs.views} + 1` })
      .where(eq(faqs.id, id));
    
    res.json({ ...faq, views: faq.views + 1 });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create FAQ (admin only)
router.post('/faq', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = insertFaqSchema.parse({
      ...req.body,
      createdBy: authReq.user!.userId
    });
    
    const [newFaq] = await db
      .insert(faqs)
      .values(data)
      .returning();
    
    res.status(201).json(newFaq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update FAQ (admin only)
router.put('/faq/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertFaqSchema.partial().parse(req.body);
    
    const [updatedFaq] = await db
      .update(faqs)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(faqs.id, id))
      .returning();
    
    if (!updatedFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json(updatedFaq);
  } catch (error) {
    console.error('Update FAQ error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete FAQ (admin only)
router.delete('/faq/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedFaq] = await db
      .delete(faqs)
      .where(eq(faqs.id, id))
      .returning();
    
    if (!deletedFaq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }
    
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =============================================================================
// TESTIMONIALS ROUTES
// =============================================================================

// Get all testimonials (published for public, all for admin)
router.get('/testimonials', async (req, res) => {
  try {
    const { featured, published, limit = '10', offset = '0' } = req.query;
    
    let query = db.select().from(testimonials);
    let conditions = [];
    
    // Check if user is authenticated with admin role
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const payload = verifyAccessToken(token);
        isAdmin = ['superadmin', 'tenant_owner', 'admin'].includes(payload.role);
      } catch (error) {
        // Invalid token, continue as public access
      }
    }
    
    if (!isAdmin || published === 'true') {
      conditions.push(eq(testimonials.isPublished, true));
    }
    
    if (featured === 'true') {
      conditions.push(eq(testimonials.isFeatured, true));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const testimonialList = await query
      .orderBy(desc(testimonials.rating), desc(testimonials.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json(testimonialList);
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single testimonial
router.get('/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [testimonial] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id));
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    // Check if user has admin access for unpublished testimonials
    if (!testimonial.isPublished) {
      let isAdmin = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const payload = verifyAccessToken(token);
          isAdmin = ['superadmin', 'tenant_owner', 'admin'].includes(payload.role);
        } catch (error) {
          // Invalid token, no admin access
        }
      }
      
      if (!isAdmin) {
        return res.status(404).json({ message: 'Testimonial not found' });
      }
    }
    
    res.json(testimonial);
  } catch (error) {
    console.error('Get testimonial error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create testimonial (admin only)
router.post('/testimonials', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = insertTestimonialSchema.parse({
      ...req.body,
      createdBy: authReq.user!.userId
    });
    
    const [newTestimonial] = await db
      .insert(testimonials)
      .values(data)
      .returning();
    
    res.status(201).json(newTestimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update testimonial (admin only)
router.put('/testimonials/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertTestimonialSchema.partial().parse(req.body);
    
    const [updatedTestimonial] = await db
      .update(testimonials)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(testimonials.id, id))
      .returning();
    
    if (!updatedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json(updatedTestimonial);
  } catch (error) {
    console.error('Update testimonial error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete testimonial (admin only)
router.delete('/testimonials/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const [deletedTestimonial] = await db
      .delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning();
    
    if (!deletedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }
    
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// =============================================================================
// PRODUCT ROADMAP ROUTES
// =============================================================================

// Get all roadmap features with vote counts
router.get('/roadmap', async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    
    let conditions = [];
    
    if (status && typeof status === 'string') {
      conditions.push(eq(roadmapFeatures.status, status as any));
    }
    
    if (category && typeof category === 'string') {
      conditions.push(eq(roadmapFeatures.category, category));
    }
    
    if (priority && typeof priority === 'string') {
      conditions.push(eq(roadmapFeatures.priority, priority as any));
    }
    
    // Get features with vote counts
    const features = await db
      .select({
        id: roadmapFeatures.id,
        title: roadmapFeatures.title,
        description: roadmapFeatures.description,
        category: roadmapFeatures.category,
        status: roadmapFeatures.status,
        priority: roadmapFeatures.priority,
        estimatedQuarter: roadmapFeatures.estimatedQuarter,
        completedAt: roadmapFeatures.completedAt,
        createdAt: roadmapFeatures.createdAt,
        updatedAt: roadmapFeatures.updatedAt,
        votes: count(featureVotes.id)
      })
      .from(roadmapFeatures)
      .leftJoin(featureVotes, eq(roadmapFeatures.id, featureVotes.featureId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(roadmapFeatures.id)
      .orderBy(desc(count(featureVotes.id)), desc(roadmapFeatures.createdAt));
    
    res.json(features);
  } catch (error) {
    console.error('Get roadmap features error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single roadmap feature with vote count
router.get('/roadmap/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [feature] = await db
      .select({
        id: roadmapFeatures.id,
        title: roadmapFeatures.title,
        description: roadmapFeatures.description,
        category: roadmapFeatures.category,
        status: roadmapFeatures.status,
        priority: roadmapFeatures.priority,
        estimatedQuarter: roadmapFeatures.estimatedQuarter,
        completedAt: roadmapFeatures.completedAt,
        createdAt: roadmapFeatures.createdAt,
        updatedAt: roadmapFeatures.updatedAt,
        votes: count(featureVotes.id)
      })
      .from(roadmapFeatures)
      .leftJoin(featureVotes, eq(roadmapFeatures.id, featureVotes.featureId))
      .where(eq(roadmapFeatures.id, id))
      .groupBy(roadmapFeatures.id);
    
    if (!feature) {
      return res.status(404).json({ message: 'Roadmap feature not found' });
    }
    
    res.json(feature);
  } catch (error) {
    console.error('Get roadmap feature error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create roadmap feature (admin only)
router.post('/roadmap', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = insertRoadmapFeatureSchema.parse({
      ...req.body,
      createdBy: authReq.user!.userId
    });
    
    const [newFeature] = await db
      .insert(roadmapFeatures)
      .values(data)
      .returning();
    
    res.status(201).json({ ...newFeature, votes: 0 });
  } catch (error) {
    console.error('Create roadmap feature error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Vote for roadmap feature
router.post('/roadmap/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ipAddress, userAgent } = req.body;
    
    // Check if feature exists
    const [feature] = await db
      .select()
      .from(roadmapFeatures)
      .where(eq(roadmapFeatures.id, id));
    
    if (!feature) {
      return res.status(404).json({ message: 'Roadmap feature not found' });
    }
    
    // Check if user already voted
    if (userId) {
      const [existingVote] = await db
        .select()
        .from(featureVotes)
        .where(and(
          eq(featureVotes.featureId, id),
          eq(featureVotes.userId, userId)
        ));
      
      if (existingVote) {
        return res.status(400).json({ message: 'You have already voted for this feature' });
      }
    }
    
    // Create vote
    await db.insert(featureVotes).values({
      featureId: id,
      userId: userId || null,
      ipAddress,
      userAgent
    });
    
    // Get updated vote count
    const [voteCount] = await db
      .select({ count: count() })
      .from(featureVotes)
      .where(eq(featureVotes.featureId, id));
    
    res.json({ 
      message: 'Vote recorded successfully',
      votes: voteCount?.count || 0
    });
  } catch (error) {
    console.error('Vote for feature error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Remove vote for roadmap feature
router.delete('/roadmap/:id/vote', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { id } = req.params;
    const userId = authReq.user!.userId; // Get userId from authenticated token, not request body
    
    const [deletedVote] = await db
      .delete(featureVotes)
      .where(and(
        eq(featureVotes.featureId, id),
        eq(featureVotes.userId, userId)
      ))
      .returning();
    
    if (!deletedVote) {
      return res.status(404).json({ message: 'Vote not found' });
    }
    
    // Get updated vote count
    const [voteCount] = await db
      .select({ count: count() })
      .from(featureVotes)
      .where(eq(featureVotes.featureId, id));
    
    res.json({ 
      message: 'Vote removed successfully',
      votes: voteCount?.count || 0
    });
  } catch (error) {
    console.error('Remove vote error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update roadmap feature (admin only)
router.put('/roadmap/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const data = insertRoadmapFeatureSchema.partial().parse(req.body);
    
    // If status is being changed to completed, set completedAt
    if (data.status === 'completed' && !data.completedAt) {
      data.completedAt = new Date();
    }
    
    const [updatedFeature] = await db
      .update(roadmapFeatures)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(roadmapFeatures.id, id))
      .returning();
    
    if (!updatedFeature) {
      return res.status(404).json({ message: 'Roadmap feature not found' });
    }
    
    res.json(updatedFeature);
  } catch (error) {
    console.error('Update roadmap feature error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete roadmap feature (admin only)
router.delete('/roadmap/:id', requireAuth, requireRole(['superadmin', 'tenant_owner', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete votes first
    await db.delete(featureVotes).where(eq(featureVotes.featureId, id));
    
    // Delete feature
    const [deletedFeature] = await db
      .delete(roadmapFeatures)
      .where(eq(roadmapFeatures.id, id))
      .returning();
    
    if (!deletedFeature) {
      return res.status(404).json({ message: 'Roadmap feature not found' });
    }
    
    res.json({ message: 'Roadmap feature deleted successfully' });
  } catch (error) {
    console.error('Delete roadmap feature error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;