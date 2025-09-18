// Email Marketing Integration System for Phase 8: Email & Communication
import { emailService } from './emailService.js';
import { emailTemplateService } from './emailTemplates.js';
import { db } from '../models/database.js';

// Email Campaign Types
export interface EmailCampaign {
  id?: string;
  tenantId: string;
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  recipients: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt?: Date;
  createdBy: string;
  stats?: CampaignStats;
}

export interface CampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
}

export interface EmailList {
  id?: string;
  tenantId: string;
  name: string;
  description?: string;
  subscribers: EmailSubscriber[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailSubscriber {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, any>;
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  tags?: string[];
}

// Email Marketing Service
export class EmailMarketingService {
  constructor(private emailSvc = emailService) {}

  // Campaign Management
  async createCampaign(campaign: Omit<EmailCampaign, 'id' | 'createdAt'>): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: `campaign_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complained: 0,
        unsubscribed: 0
      }
    };

    // In production, save to database
    console.log('📧 Campaign created:', newCampaign.name);
    return newCampaign;
  }

  async sendCampaign(campaignId: string, campaign: EmailCampaign): Promise<boolean> {
    console.log(`🚀 Starting email campaign: ${campaign.name}`);
    
    let successCount = 0;
    let failureCount = 0;

    try {
      // Update campaign status
      campaign.status = 'sending';
      campaign.sentAt = new Date();

      // Send emails in batches to avoid overwhelming the service
      const batchSize = 50;
      const batches = this.chunkArray(campaign.recipients, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📧 Sending batch ${i + 1}/${batches.length} (${batch.length} emails)`);

        // Send batch with delay to respect rate limits
        const batchPromises = batch.map(async (email) => {
          try {
            const success = await this.emailSvc.sendEmail({
              to: email,
              subject: campaign.subject,
              text: campaign.content,
              html: campaign.htmlContent
            });

            if (success) {
              successCount++;
            } else {
              failureCount++;
            }

            // Add tracking parameters for analytics
            console.log(`📨 Email sent to ${email}: ${success ? '✅' : '❌'}`);
            return success;
          } catch (error) {
            console.error(`❌ Failed to send email to ${email}:`, error);
            failureCount++;
            return false;
          }
        });

        await Promise.all(batchPromises);

        // Rate limiting - wait between batches
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      // Update campaign stats
      if (campaign.stats) {
        campaign.stats.sent = successCount;
      }

      campaign.status = 'sent';
      console.log(`✅ Campaign completed: ${successCount} sent, ${failureCount} failed`);

      return successCount > 0;
    } catch (error) {
      console.error('❌ Campaign sending failed:', error);
      campaign.status = 'paused';
      return false;
    }
  }

  // List Management
  async createList(list: Omit<EmailList, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailList> {
    const newList: EmailList = {
      ...list,
      id: `list_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📝 Email list created:', newList.name);
    return newList;
  }

  async addSubscriber(listId: string, subscriber: Omit<EmailSubscriber, 'id' | 'subscribedAt'>): Promise<EmailSubscriber> {
    const newSubscriber: EmailSubscriber = {
      ...subscriber,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      subscribedAt: new Date()
    };

    console.log('👤 Subscriber added:', subscriber.email);
    
    // Send welcome email for new subscribers
    await this.sendWelcomeEmail(subscriber.email, subscriber.firstName);

    return newSubscriber;
  }

  async unsubscribeEmail(email: string, reason?: string): Promise<boolean> {
    console.log('📭 Unsubscribing email:', email, 'Reason:', reason);
    
    // In production, update database
    // await db.update(subscribers).set({ 
    //   status: 'unsubscribed', 
    //   unsubscribedAt: new Date() 
    // }).where(eq(subscribers.email, email));

    return true;
  }

  // Email Templates for Marketing
  async sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
    const template = {
      subject: 'Welcome to our newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome${firstName ? ` ${firstName}` : ''}!</h2>
          <p>Thank you for subscribing to our newsletter. You'll receive updates about:</p>
          <ul>
            <li>Product updates and new features</li>
            <li>Industry insights and tips</li>
            <li>Exclusive offers and promotions</li>
            <li>Company news and announcements</li>
          </ul>
          <p>You can <a href="{{unsubscribeUrl}}">unsubscribe</a> at any time.</p>
          <p>Best regards,<br>The Customer Dashboard SaaS Team</p>
        </div>
      `,
      text: `Welcome${firstName ? ` ${firstName}` : ''}!

Thank you for subscribing to our newsletter. You'll receive updates about:
• Product updates and new features
• Industry insights and tips
• Exclusive offers and promotions
• Company news and announcements

You can unsubscribe at any time by visiting our website.

Best regards,
The Customer Dashboard SaaS Team`
    };

    return await this.emailSvc.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  async sendNewsletterTemplate(email: string, data: any): Promise<boolean> {
    const template = {
      subject: `${data.title} - Customer Dashboard SaaS Newsletter`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1>${data.title}</h1>
            <p>${data.subtitle || 'Your monthly update'}</p>
          </div>
          
          <div style="padding: 30px; background: white;">
            ${data.content}
            
            ${data.features ? `
              <h3>🚀 What's New This Month</h3>
              <ul>
                ${data.features.map((feature: string) => `<li>${feature}</li>`).join('')}
              </ul>
            ` : ''}
            
            ${data.cta ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.cta.url}" style="background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  ${data.cta.text}
                </a>
              </div>
            ` : ''}
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>You're receiving this because you subscribed to our newsletter.</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{preferencesUrl}}">Update Preferences</a></p>
          </div>
        </div>
      `,
      text: `${data.title}

${data.subtitle || 'Your monthly update'}

${data.content}

${data.features ? `What's New This Month:
${data.features.map((feature: string) => `• ${feature}`).join('\n')}` : ''}

${data.cta ? `${data.cta.text}: ${data.cta.url}` : ''}

---
You're receiving this because you subscribed to our newsletter.
Unsubscribe or update preferences at our website.`
    };

    return await this.emailSvc.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Analytics and Reporting
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    // In production, fetch from database
    return {
      sent: 150,
      delivered: 145,
      opened: 82,
      clicked: 23,
      bounced: 5,
      complained: 1,
      unsubscribed: 2
    };
  }

  async getListStats(listId: string): Promise<{ totalSubscribers: number; activeSubscribers: number; unsubscribed: number; bounced: number }> {
    // In production, fetch from database
    return {
      totalSubscribers: 250,
      activeSubscribers: 230,
      unsubscribed: 15,
      bounced: 5
    };
  }

  // Automation and Drip Campaigns
  async setupDripCampaign(campaign: {
    name: string;
    listId: string;
    emails: Array<{
      delayDays: number;
      subject: string;
      content: string;
      htmlContent?: string;
    }>;
  }): Promise<string> {
    const campaignId = `drip_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`🔄 Setting up drip campaign: ${campaign.name}`);
    console.log(`📧 ${campaign.emails.length} emails scheduled over ${Math.max(...campaign.emails.map(e => e.delayDays))} days`);

    // In production, save to database and set up scheduled jobs
    return campaignId;
  }

  async sendDripEmail(subscriberEmail: string, emailData: any, dayNumber: number): Promise<boolean> {
    console.log(`📧 Sending drip email day ${dayNumber} to: ${subscriberEmail}`);
    
    return await this.emailSvc.sendEmail({
      to: subscriberEmail,
      subject: emailData.subject,
      text: emailData.content,
      html: emailData.htmlContent
    });
  }

  // Segmentation
  async segmentSubscribers(listId: string, criteria: {
    tags?: string[];
    metadata?: Record<string, any>;
    subscriptionDate?: { after?: Date; before?: Date };
    engagement?: 'high' | 'medium' | 'low';
  }): Promise<EmailSubscriber[]> {
    console.log('🎯 Segmenting subscribers with criteria:', criteria);
    
    // In production, query database with filters
    return [];
  }

  // A/B Testing
  async createABTest(test: {
    campaignName: string;
    subjectA: string;
    subjectB: string;
    content: string;
    recipients: string[];
    testPercentage: number; // 10-50%
  }): Promise<{ testId: string; groupA: string[]; groupB: string[]; control: string[] }> {
    const testId = `ab_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Split recipients into groups
    const shuffled = [...test.recipients].sort(() => 0.5 - Math.random());
    const testSize = Math.floor((test.recipients.length * test.testPercentage) / 100);
    const groupSize = Math.floor(testSize / 2);
    
    const groupA = shuffled.slice(0, groupSize);
    const groupB = shuffled.slice(groupSize, groupSize * 2);
    const control = shuffled.slice(groupSize * 2);

    console.log(`🧪 A/B test created: ${test.campaignName}`);
    console.log(`Group A: ${groupA.length}, Group B: ${groupB.length}, Control: ${control.length}`);

    return { testId, groupA, groupB, control };
  }

  // Utility functions
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // Email validation
  async validateEmailList(emails: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    const valid: string[] = [];
    const invalid: string[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emails.forEach(email => {
      if (emailRegex.test(email.trim().toLowerCase())) {
        valid.push(email.trim().toLowerCase());
      } else {
        invalid.push(email);
      }
    });

    console.log(`📧 Email validation: ${valid.length} valid, ${invalid.length} invalid`);
    return { valid, invalid };
  }

  // Import from CSV
  async importFromCSV(csvData: string, listId: string): Promise<{ imported: number; errors: string[] }> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const errors: string[] = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const subscriber: any = {};
        
        headers.forEach((header, index) => {
          subscriber[header.toLowerCase()] = values[index];
        });

        if (subscriber.email) {
          // Add to list
          await this.addSubscriber(listId, {
            email: subscriber.email,
            firstName: subscriber.firstname || subscriber.first_name,
            lastName: subscriber.lastname || subscriber.last_name,
            status: 'subscribed',
            metadata: subscriber
          });
          imported++;
        } else {
          errors.push(`Line ${i + 1}: Missing email`);
        }
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error}`);
      }
    }

    console.log(`📊 CSV import complete: ${imported} imported, ${errors.length} errors`);
    return { imported, errors };
  }
}

// Export default instance
export const emailMarketingService = new EmailMarketingService();

// Pre-built campaign templates
export const campaignTemplates = {
  welcome: {
    subject: 'Welcome to {{companyName}}!',
    content: 'Thank you for joining us. Here\'s what you can expect...',
    htmlContent: '<h2>Welcome!</h2><p>Thank you for joining us...</p>'
  },
  
  productUpdate: {
    subject: '🚀 New Features in {{productName}}',
    content: 'We\'ve added exciting new features...',
    htmlContent: '<h2>🚀 New Features!</h2><p>We\'ve added exciting new features...</p>'
  },
  
  billing: {
    subject: '📋 Your {{planName}} subscription is due',
    content: 'Your subscription is due for renewal...',
    htmlContent: '<h2>📋 Subscription Renewal</h2><p>Your subscription is due...</p>'
  },

  reEngagement: {
    subject: 'We miss you! Come back to {{productName}}',
    content: 'It\'s been a while since your last visit...',
    htmlContent: '<h2>We miss you!</h2><p>It\'s been a while since your last visit...</p>'
  }
};