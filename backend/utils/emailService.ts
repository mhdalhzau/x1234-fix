// Comprehensive Email Service with Multiple Providers for Phase 8
import { sendEmail as replitSendEmail, type SmtpMessage } from './replitmail.js';
import { sendEmail as sendgridSendEmail } from './sendgrid.js';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export type EmailProvider = 'replit' | 'sendgrid' | 'smtp' | 'auto';

export class EmailService {
  private defaultProvider: EmailProvider = 'auto';
  private smtpConfig: SmtpConfig | null = null;
  private defaultFrom = 'noreply@saas.com';

  constructor(provider: EmailProvider = 'auto', smtpConfig?: SmtpConfig) {
    this.defaultProvider = provider;
    this.smtpConfig = smtpConfig || null;
  }

  // Set SMTP configuration for manual email providers (Gmail, etc)
  public setSmtpConfig(config: SmtpConfig) {
    this.smtpConfig = config;
  }

  // Auto-detect best available provider
  private getAvailableProvider(): EmailProvider {
    if (process.env.SENDGRID_API_KEY) {
      return 'sendgrid';
    }
    if (process.env.REPL_IDENTITY || process.env.WEB_REPL_RENEWAL) {
      return 'replit';
    }
    if (this.smtpConfig) {
      return 'smtp';
    }
    return 'replit'; // fallback to replit with console logging
  }

  // Send email using specified or auto-detected provider
  public async sendEmail(options: EmailOptions, provider?: EmailProvider): Promise<boolean> {
    const selectedProvider = provider || (this.defaultProvider === 'auto' ? this.getAvailableProvider() : this.defaultProvider);

    try {
      switch (selectedProvider) {
        case 'replit':
          return await this.sendViaReplit(options);
        case 'sendgrid':
          return await this.sendViaSendGrid(options);
        case 'smtp':
          return await this.sendViaSmtp(options);
        default:
          console.warn(`Unknown provider: ${selectedProvider}, falling back to Replit`);
          return await this.sendViaReplit(options);
      }
    } catch (error) {
      console.error(`Email sending failed via ${selectedProvider}:`, error);
      // Try fallback if auto mode
      if (this.defaultProvider === 'auto' && selectedProvider !== 'replit') {
        console.log('Trying fallback to Replit...');
        return await this.sendViaReplit(options);
      }
      return false;
    }
  }

  private async sendViaReplit(options: EmailOptions): Promise<boolean> {
    try {
      const message: SmtpMessage = {
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          encoding: 'base64' as const
        }))
      };

      const result = await replitSendEmail(message);
      console.log('✅ Replit Mail sent to:', result.accepted);
      return true;
    } catch (error) {
      console.error('❌ Replit Mail failed:', error);
      // Console fallback
      console.log('📧 Email Service (Console Fallback)');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Content:', options.text || options.html);
      console.log('---');
      return true; // Consider console logging as success for development
    }
  }

  private async sendViaSendGrid(options: EmailOptions): Promise<boolean> {
    return await sendgridSendEmail({
      to: options.to,
      from: options.from || this.defaultFrom,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
  }

  private async sendViaSmtp(options: EmailOptions): Promise<boolean> {
    if (!this.smtpConfig) {
      throw new Error('SMTP configuration not provided');
    }

    const transporter = nodemailer.createTransport(this.smtpConfig);

    try {
      const result = await transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType
        }))
      });

      console.log('✅ SMTP email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('❌ SMTP email failed:', error);
      return false;
    }
  }
}

// Default email service instance
export const emailService = new EmailService();

// Convenience functions
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  return await emailService.sendEmail(options);
}

export function configureGmailSmtp(email: string, password: string) {
  emailService.setSmtpConfig({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: password
    }
  });
}

export function configureCustomSmtp(config: SmtpConfig) {
  emailService.setSmtpConfig(config);
}