import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../models/database.js';
import { billingHistory, subscriptions, tenants } from '../models/schema.js';
import { eq } from 'drizzle-orm';
import { notificationService } from '../utils/notificationService.js';

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

// WhatsApp Webhook for receiving messages and status updates
router.get('/whatsapp', (req: Request, res: Response) => {
  // Webhook verification for WhatsApp Business API
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log('WhatsApp webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

router.post('/whatsapp', (req: Request, res: Response) => {
  // Handle incoming WhatsApp messages
  try {
    const body = req.body;

    // Check if this is a WhatsApp webhook event
    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: any) => {
        const changes = entry.changes;
        
        changes?.forEach((change: any) => {
          if (change.field === 'messages') {
            const messages = change.value.messages;
            const metadata = change.value.metadata;

            messages?.forEach(async (message: any) => {
              console.log('📱 WhatsApp message received:', {
                from: message.from,
                type: message.type,
                text: message.text?.body,
                timestamp: message.timestamp
              });

              // Process the message here
              await handleWhatsAppMessage(message, metadata);
            });
          }
        });
      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

// Telegram Webhook for receiving bot messages
router.post('/telegram', async (req: Request, res: Response) => {
  try {
    const update = req.body;

    console.log('🤖 Telegram update received:', {
      updateId: update.update_id,
      message: update.message,
      callbackQuery: update.callback_query
    });

    // Handle regular messages
    if (update.message) {
      await handleTelegramMessage(update.message);
    }

    // Handle callback queries (inline keyboard button presses)
    if (update.callback_query) {
      await handleTelegramCallback(update.callback_query);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.sendStatus(500);
  }
});

// Email webhook for handling bounce/complaint notifications (SendGrid, etc.)
router.post('/email/sendgrid', (req: Request, res: Response) => {
  try {
    const events = req.body;

    events.forEach((event: any) => {
      console.log('📧 SendGrid event:', {
        event: event.event,
        email: event.email,
        timestamp: event.timestamp,
        reason: event.reason
      });

      handleEmailEvent(event);
    });

    res.status(200).send('OK');
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.sendStatus(500);
  }
});

// Generic notification status webhook
router.post('/notification/status', (req: Request, res: Response) => {
  try {
    const { provider, status, messageId, recipient, error } = req.body;

    console.log('📨 Notification status update:', {
      provider,
      status,
      messageId,
      recipient,
      error
    });

    // Update notification status in database
    // updateNotificationStatus(messageId, status, error);

    res.status(200).send('OK');
  } catch (error) {
    console.error('Notification status webhook error:', error);
    res.sendStatus(500);
  }
});

// Helper functions for handling different types of messages
async function handleWhatsAppMessage(message: any, metadata: any) {
  try {
    const from = message.from;
    const messageText = message.text?.body;
    const messageType = message.type;

    // Basic auto-reply logic
    if (messageType === 'text' && messageText) {
      const lowerText = messageText.toLowerCase();

      // Handle common queries
      if (lowerText.includes('help') || lowerText.includes('bantuan')) {
        // Send help message
        const helpMessage = `🤖 Customer Dashboard SaaS Support

Available commands:
• "help" - Show this help message
• "status" - Check your account status  
• "billing" - Billing information
• "support" - Contact human support

For immediate assistance, please contact our support team via email.`;

        console.log('Sending help message to:', from);
        // Would send via WhatsApp API in production
      } else if (lowerText.includes('status')) {
        console.log('Checking status for:', from);
      } else if (lowerText.includes('billing')) {
        console.log('Showing billing info for:', from);
      } else {
        const defaultMessage = `Thank you for your message! Our support team will get back to you soon. 

For immediate assistance, you can:
• Visit our dashboard
• Email support@customerdashboard.com
• Type "help" for available commands`;

        console.log('Sending default response to:', from);
      }
    }
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
  }
}

async function handleTelegramMessage(message: any) {
  try {
    const chatId = message.chat.id;
    const text = message.text;
    const from = message.from;

    console.log('Telegram message from:', from.username || from.first_name);

    // Handle bot commands
    if (text?.startsWith('/')) {
      const command = text.split(' ')[0];

      switch (command) {
        case '/start':
          console.log('Sending welcome message to Telegram user:', chatId);
          break;
        case '/help':
          console.log('Sending help message to Telegram user:', chatId);
          break;
        case '/status':
          console.log('Checking status for Telegram user:', chatId);
          break;
        case '/billing':
          console.log('Showing billing info for Telegram user:', chatId);
          break;
        default:
          console.log('Unknown command:', command);
      }
    } else {
      console.log('Processing regular message from:', chatId);
    }
  } catch (error) {
    console.error('Error handling Telegram message:', error);
  }
}

async function handleTelegramCallback(callbackQuery: any) {
  try {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    
    console.log('Telegram callback from:', chatId, 'data:', data);

    switch (data) {
      case 'view_dashboard':
        console.log('User wants to view dashboard');
        break;
      case 'check_billing':
        console.log('User wants to check billing');
        break;
      case 'contact_support':
        console.log('User wants to contact support');
        break;
      default:
        console.log('Unknown callback data:', data);
    }
  } catch (error) {
    console.error('Error handling Telegram callback:', error);
  }
}

function handleEmailEvent(event: any) {
  try {
    const eventType = event.event;
    const email = event.email;

    switch (eventType) {
      case 'delivered':
        console.log('✅ Email delivered to:', email);
        break;
      case 'bounce':
        console.log('🚫 Email bounced:', email, 'Reason:', event.reason);
        break;
      case 'complaint':
        console.log('⚠️ Email complaint:', email);
        break;
      case 'unsubscribe':
        console.log('📭 User unsubscribed:', email);
        break;
      case 'click':
        console.log('🖱️ Email link clicked:', email, 'URL:', event.url);
        break;
      case 'open':
        console.log('👁️ Email opened by:', email);
        break;
      default:
        console.log('Unknown email event:', eventType);
    }
  } catch (error) {
    console.error('Error handling email event:', error);
  }
}

export default router;