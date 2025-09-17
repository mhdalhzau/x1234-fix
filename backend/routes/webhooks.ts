import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../models/database.js';
import { billingHistory, subscriptions, tenants } from '../models/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Initialize Stripe with stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Webhook endpoint secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe webhook handler
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  let event: Stripe.Event;

  try {
    // Always require signature verification except in development mode
    if (!endpointSecret && process.env.NODE_ENV !== 'development') {
      console.error('Webhook signature verification required but no secret configured');
      return res.status(400).send('Webhook signature verification required');
    }
    
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
      // Only allow unverified events in development
      console.warn('Processing unverified webhook in development mode');
      event = req.body;
    }
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment succeeded for invoice:', invoice.id);
        
        // Find the subscription and tenant using Stripe subscription ID
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const stripeSubscriptionId = invoice.subscription;
          const subscriptionResult = await db
            .select({
              tenantId: subscriptions.tenantId,
              subscriptionId: subscriptions.id
            })
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

          if (subscriptionResult.length > 0) {
            const { tenantId, subscriptionId } = subscriptionResult[0];
            
            // Record successful payment with idempotency protection
            try {
              await db.insert(billingHistory).values({
                tenantId,
                subscriptionId,
                stripeInvoiceId: invoice.id,
                amount: (invoice.amount_paid / 100).toString(),
                currency: invoice.currency.toUpperCase(),
                paymentMethod: 'stripe',
                status: 'paid',
                paidAt: invoice.status_transitions.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
                description: `Payment for subscription ${stripeSubscriptionId}`,
              }).onConflictDoNothing({ target: billingHistory.stripeInvoiceId });

              console.log('Billing history updated for successful payment');
            } catch (error) {
              console.error('Failed to insert billing history:', error);
            }
          } else {
            console.warn('Subscription not found for Stripe subscription:', stripeSubscriptionId);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Payment failed for invoice:', invoice.id);
        
        // Find the subscription and tenant using Stripe subscription ID
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const stripeSubscriptionId = invoice.subscription;
          const subscriptionResult = await db
            .select({
              tenantId: subscriptions.tenantId,
              subscriptionId: subscriptions.id
            })
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

          if (subscriptionResult.length > 0) {
            const { tenantId, subscriptionId } = subscriptionResult[0];
            
            // Record failed payment with idempotency protection
            try {
              await db.insert(billingHistory).values({
                tenantId,
                subscriptionId,
                stripeInvoiceId: invoice.id,
                amount: (invoice.amount_due / 100).toString(),
                currency: invoice.currency.toUpperCase(),
                paymentMethod: 'stripe',
                status: 'failed',
                description: `Failed payment for subscription ${stripeSubscriptionId}`,
              }).onConflictDoNothing({ target: billingHistory.stripeInvoiceId });

              console.log('Billing history updated for failed payment');
            } catch (error) {
              console.error('Failed to insert billing history:', error);
            }
          } else {
            console.warn('Subscription not found for Stripe subscription:', stripeSubscriptionId);
          }
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription created:', subscription.id);
        
        // Update subscription status using Stripe subscription ID
        try {
          const result = await db
            .update(subscriptions)
            .set({ 
              status: subscription.status === 'active' ? 'active' : 'pending',
              updatedAt: new Date()
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

          console.log('Subscription status updated for:', subscription.id);
        } catch (error) {
          console.error('Failed to update subscription status:', error);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        
        // Map Stripe subscription status to our status
        let ourStatus: 'active' | 'expired' | 'cancelled' | 'pending' = 'pending';
        
        switch (subscription.status) {
          case 'active':
            ourStatus = 'active';
            break;
          case 'canceled':
          case 'incomplete_expired':
            ourStatus = 'cancelled';
            break;
          case 'past_due':
          case 'unpaid':
            ourStatus = 'expired';
            break;
          default:
            ourStatus = 'pending';
        }
        
        // Update subscription status using Stripe subscription ID
        try {
          await db
            .update(subscriptions)
            .set({ 
              status: ourStatus,
              updatedAt: new Date()
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

          console.log('Subscription status updated to:', ourStatus);
        } catch (error) {
          console.error('Failed to update subscription status:', error);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', subscription.id);
        
        // Mark subscription as cancelled using Stripe subscription ID
        try {
          await db
            .update(subscriptions)
            .set({ 
              status: 'cancelled',
              updatedAt: new Date()
            })
            .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

          console.log('Subscription marked as cancelled');
        } catch (error) {
          console.error('Failed to mark subscription as cancelled:', error);
        }
        break;
      }

      case 'invoice.created': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('Invoice created:', invoice.id);
        
        // Find the subscription and tenant using Stripe subscription ID
        if (invoice.subscription && typeof invoice.subscription === 'string') {
          const stripeSubscriptionId = invoice.subscription;
          const subscriptionResult = await db
            .select({
              tenantId: subscriptions.tenantId,
              subscriptionId: subscriptions.id
            })
            .from(subscriptions)
            .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

          if (subscriptionResult.length > 0) {
            const { tenantId, subscriptionId } = subscriptionResult[0];
            
            // Record pending invoice with idempotency protection
            try {
              await db.insert(billingHistory).values({
                tenantId,
                subscriptionId,
                stripeInvoiceId: invoice.id,
                amount: (invoice.amount_due / 100).toString(),
                currency: invoice.currency.toUpperCase(),
                paymentMethod: 'stripe',
                status: 'pending',
                description: `Invoice ${invoice.id} for subscription ${stripeSubscriptionId}`,
              }).onConflictDoNothing({ target: billingHistory.stripeInvoiceId });

              console.log('Pending invoice recorded in billing history');
            } catch (error) {
              console.error('Failed to insert pending invoice:', error);
            }
          } else {
            console.warn('Subscription not found for Stripe subscription:', stripeSubscriptionId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;