import { Router } from 'express';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import Stripe from 'stripe';
import { db } from '../models/database.js';
import { subscriptions, subscriptionPlans, billingHistory, tenants, users } from '../models/schema.js';
import { requireAuth, requireRole, requireTenantBound, AuthenticatedRequest } from '../middleware/auth.js';

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = Router();

// Get current subscription
router.get('/current', requireAuth, requireTenantBound, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const tenantId = authReq.user!.tenantId!;
    const [currentSubscription] = await db.select({
      subscription: subscriptions,
      plan: subscriptionPlans,
    })
    .from(subscriptions)
    .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
    .where(eq(subscriptions.tenantId, tenantId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

    if (!currentSubscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json(currentSubscription);
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get available subscription plans
router.get('/plans', requireAuth, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const plans = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));

    res.json(plans);
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Stripe subscription intent (for frontend payment)
router.post('/create-payment-intent', requireAuth, requireTenantBound, async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const { planId } = req.body;
    const userId = authReq.user!.userId;
    const tenantId = authReq.user!.tenantId!;

    // Get plan details
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: {
          userId: user.id,
          tenantId: tenantId,
        },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId));
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(plan.price) * 100), // Convert to cents
      currency: plan.currency.toLowerCase(),
      customer: customerId,
      metadata: {
        planId: plan.id,
        tenantId: tenantId,
        userId: userId,
      },
      setup_future_usage: 'off_session',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Subscribe to a plan (owner only)
const subscribeSchema = z.object({
  planId: z.string().uuid(),
  paymentIntentId: z.string().optional(),
});

router.post('/subscribe', requireAuth, requireTenantBound, requireRole(['tenant_owner']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = subscribeSchema.parse(req.body);
    const tenantId = authReq.user!.tenantId!;

    // Check if plan exists
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, data.planId));

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    // REQUIRE payment verification - no free subscriptions
    if (!data.paymentIntentId) {
      return res.status(400).json({ message: 'Payment verification required' });
    }

    // Verify payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed or verified' });
    }

    // Verify payment amount matches plan price
    const expectedAmount = Math.round(parseFloat(plan.price) * 100);
    if (paymentIntent.amount !== expectedAmount) {
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    // Cancel any existing active subscription
    await db.update(subscriptions)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(subscriptions.tenantId, tenantId));

    // Create new subscription
    const [newSubscription] = await db.insert(subscriptions).values({
      tenantId: tenantId,
      planId: data.planId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      autoRenew: true,
    }).returning();

    // Update tenant subscription reference and limits
    await db.update(tenants)
      .set({
        subscriptionId: newSubscription.id,
        maxOutlets: plan.maxOutlets,
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));

    // Create billing entry
    await db.insert(billingHistory).values({
      tenantId: tenantId,
      subscriptionId: newSubscription.id,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod: data.paymentIntentId ? 'stripe' : 'manual',
      status: data.paymentIntentId ? 'paid' : 'pending',
      paidAt: data.paymentIntentId ? new Date() : null,
      description: `Subscription to ${plan.name} plan`,
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: newSubscription,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get billing history
router.get('/billing', requireAuth, requireTenantBound, requireRole(['tenant_owner']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const tenantId = authReq.user!.tenantId!;
    const billing = await db.select()
      .from(billingHistory)
      .where(eq(billingHistory.tenantId, tenantId))
      .orderBy(desc(billingHistory.createdAt));

    res.json(billing);
  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update payment status (simulate payment processing)
const updatePaymentSchema = z.object({
  billingId: z.string().uuid(),
  status: z.enum(['paid', 'failed']),
  paymentMethod: z.string().optional(),
});

router.post('/billing/update-payment', requireAuth, requireTenantBound, requireRole(['tenant_owner']), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const data = updatePaymentSchema.parse(req.body);

    const [updatedBilling] = await db.update(billingHistory)
      .set({
        status: data.status,
        paymentMethod: data.paymentMethod,
        paidAt: data.status === 'paid' ? new Date() : null,
      })
      .where(eq(billingHistory.id, data.billingId))
      .returning();

    if (!updatedBilling) {
      return res.status(404).json({ message: 'Billing record not found' });
    }

    res.json(updatedBilling);
  } catch (error) {
    console.error('Update payment error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;