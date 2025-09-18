// Comprehensive Notification Service for Phase 8: Email & Communication
import { emailService } from './emailService.js';

export interface NotificationMessage {
  to: string;
  message: string;
  subject?: string;
  data?: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
}

export type NotificationChannel = 'email' | 'whatsapp' | 'telegram' | 'all';

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<boolean>;
  isConfigured(): boolean;
}

// WhatsApp Business API Provider
export class WhatsAppProvider implements NotificationProvider {
  private accessToken?: string;
  private phoneNumberId?: string;
  private businessApiUrl = 'https://graph.facebook.com/v18.0';

  constructor(accessToken?: string, phoneNumberId?: string) {
    this.accessToken = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }

  async send(message: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('WhatsApp not configured, falling back to console logging');
      console.log('📱 WhatsApp Message (Fallback)');
      console.log('To:', message.to);
      console.log('Message:', message.message);
      console.log('---');
      return true;
    }

    try {
      const url = `${this.businessApiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: message.to,
        type: 'text',
        text: {
          body: message.message
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('✅ WhatsApp message sent:', result.messages?.[0]?.id);
      return true;
    } catch (error) {
      console.error('❌ WhatsApp sending failed:', error);
      return false;
    }
  }

  // Send template message (for business notifications)
  async sendTemplate(to: string, templateName: string, components: any[]): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('📱 WhatsApp Template (Fallback)');
      console.log('To:', to);
      console.log('Template:', templateName);
      console.log('Components:', components);
      return true;
    }

    try {
      const url = `${this.businessApiUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'id' }, // Indonesian
          components
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp template error:', error);
        return false;
      }

      const result = await response.json();
      console.log('✅ WhatsApp template sent:', result.messages?.[0]?.id);
      return true;
    } catch (error) {
      console.error('❌ WhatsApp template failed:', error);
      return false;
    }
  }
}

// Telegram Bot API Provider
export class TelegramProvider implements NotificationProvider {
  private botToken?: string;
  private apiUrl = 'https://api.telegram.org/bot';

  constructor(botToken?: string) {
    this.botToken = botToken || process.env.TELEGRAM_BOT_TOKEN;
  }

  isConfigured(): boolean {
    return !!this.botToken;
  }

  async send(message: NotificationMessage): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('Telegram not configured, falling back to console logging');
      console.log('🤖 Telegram Message (Fallback)');
      console.log('To:', message.to);
      console.log('Message:', message.message);
      console.log('---');
      return true;
    }

    try {
      const url = `${this.apiUrl}${this.botToken}/sendMessage`;
      
      const payload = {
        chat_id: message.to,
        text: message.message,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Telegram API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('✅ Telegram message sent:', result.result.message_id);
      return true;
    } catch (error) {
      console.error('❌ Telegram sending failed:', error);
      return false;
    }
  }

  // Send message with inline keyboard
  async sendWithKeyboard(to: string, text: string, keyboard: any[][]): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('🤖 Telegram Keyboard (Fallback)');
      console.log('To:', to);
      console.log('Message:', text);
      console.log('Keyboard:', keyboard);
      return true;
    }

    try {
      const url = `${this.apiUrl}${this.botToken}/sendMessage`;
      
      const payload = {
        chat_id: to,
        text: text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: keyboard
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Telegram keyboard error:', error);
        return false;
      }

      const result = await response.json();
      console.log('✅ Telegram keyboard sent:', result.result.message_id);
      return true;
    } catch (error) {
      console.error('❌ Telegram keyboard failed:', error);
      return false;
    }
  }
}

// Email Provider (wrapper for existing email service)
export class EmailProvider implements NotificationProvider {
  constructor(private emailSvc = emailService) {}

  isConfigured(): boolean {
    return true; // Email always available through fallbacks
  }

  async send(message: NotificationMessage): Promise<boolean> {
    return await this.emailSvc.sendEmail({
      to: message.to,
      subject: message.subject || 'Notification',
      text: message.message,
      html: message.data?.html
    });
  }
}

// Main Notification Service
export class NotificationService {
  private providers: Map<NotificationChannel, NotificationProvider> = new Map();

  constructor() {
    // Initialize providers
    this.providers.set('email', new EmailProvider());
    this.providers.set('whatsapp', new WhatsAppProvider());
    this.providers.set('telegram', new TelegramProvider());
  }

  // Configure WhatsApp
  configureWhatsApp(accessToken: string, phoneNumberId: string) {
    this.providers.set('whatsapp', new WhatsAppProvider(accessToken, phoneNumberId));
  }

  // Configure Telegram
  configureTelegram(botToken: string) {
    this.providers.set('telegram', new TelegramProvider(botToken));
  }

  // Send notification via specific channel
  async sendNotification(
    channel: NotificationChannel,
    message: NotificationMessage
  ): Promise<boolean> {
    if (channel === 'all') {
      return await this.sendToAllChannels(message);
    }

    const provider = this.providers.get(channel);
    if (!provider) {
      console.error(`Unknown notification channel: ${channel}`);
      return false;
    }

    try {
      return await provider.send(message);
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
      return false;
    }
  }

  // Send to all configured channels
  async sendToAllChannels(message: NotificationMessage): Promise<boolean> {
    const results = await Promise.all([
      this.sendNotification('email', message),
      this.sendNotification('whatsapp', message),
      this.sendNotification('telegram', message)
    ]);

    // Return true if at least one channel succeeded
    return results.some(result => result);
  }

  // Get status of all providers
  getProviderStatus(): Record<NotificationChannel, boolean> {
    return {
      email: this.providers.get('email')?.isConfigured() || false,
      whatsapp: this.providers.get('whatsapp')?.isConfigured() || false,
      telegram: this.providers.get('telegram')?.isConfigured() || false,
      all: false // 'all' is not a real provider
    };
  }

  // Convenience methods for common notifications
  async sendWelcomeNotification(userContact: { email: string; phone?: string; telegramId?: string }, userData: any): Promise<void> {
    const message = {
      message: `🎉 Welcome to Customer Dashboard SaaS, ${userData.username}! Your account has been created successfully. You can now log in and start managing your business.`,
      subject: 'Welcome to Customer Dashboard SaaS',
      data: userData
    };

    // Send via email
    await this.sendNotification('email', { ...message, to: userContact.email });

    // Send via WhatsApp if phone provided
    if (userContact.phone) {
      await this.sendNotification('whatsapp', { ...message, to: userContact.phone });
    }

    // Send via Telegram if ID provided
    if (userContact.telegramId) {
      await this.sendNotification('telegram', { ...message, to: userContact.telegramId });
    }
  }

  async sendPaymentReminderNotification(userContact: { email: string; phone?: string; telegramId?: string }, paymentData: any): Promise<void> {
    const message = {
      message: `💳 Payment Reminder: Your ${paymentData.planName} subscription payment of ${paymentData.amount} ${paymentData.currency} is due. Please update your payment method to avoid service interruption.`,
      subject: 'Payment Reminder - Action Required',
      priority: 'high' as const,
      data: paymentData
    };

    // Send to all available channels for payment reminders
    await Promise.all([
      this.sendNotification('email', { ...message, to: userContact.email }),
      userContact.phone ? this.sendNotification('whatsapp', { ...message, to: userContact.phone }) : Promise.resolve(true),
      userContact.telegramId ? this.sendNotification('telegram', { ...message, to: userContact.telegramId }) : Promise.resolve(true)
    ]);
  }

  async sendSystemAlertNotification(adminContacts: { email: string; phone?: string; telegramId?: string }[], alert: any): Promise<void> {
    const message = {
      message: `🚨 System Alert: ${alert.title}\n\n${alert.description}\n\nSeverity: ${alert.severity}\nTime: ${alert.timestamp}`,
      subject: `System Alert: ${alert.title}`,
      priority: 'high' as const,
      data: alert
    };

    // Send to all admin contacts
    for (const contact of adminContacts) {
      await Promise.all([
        this.sendNotification('email', { ...message, to: contact.email }),
        contact.phone ? this.sendNotification('whatsapp', { ...message, to: contact.phone }) : Promise.resolve(true),
        contact.telegramId ? this.sendNotification('telegram', { ...message, to: contact.telegramId }) : Promise.resolve(true)
      ]);
    }
  }
}

// Export default instance
export const notificationService = new NotificationService();

// Providers are already exported above when declared