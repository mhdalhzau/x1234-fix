// Comprehensive Email Templates for Phase 8: Email & Communication
import { emailService } from './emailService.js';

export interface TemplateData {
  [key: string]: any;
}

export class EmailTemplate {
  constructor(
    public name: string,
    public subject: string,
    public htmlTemplate: string,
    public textTemplate: string
  ) {}

  render(data: TemplateData): { subject: string; html: string; text: string } {
    let subject = this.subject;
    let html = this.htmlTemplate;
    let text = this.textTemplate;

    // Simple template variable replacement
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, data[key]);
      html = html.replace(regex, data[key]);
      text = text.replace(regex, data[key]);
    });

    return { subject, html, text };
  }
}

// Authentication Flow Templates
export const authTemplates = {
  welcome: new EmailTemplate(
    'welcome',
    'Welcome to {{businessName}} - Your Account is Ready!',
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to {{businessName}}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .button:hover { background: #2563EB; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to {{businessName}}!</h1>
                <p>Your SaaS journey starts here</p>
            </div>
            <div class="content">
                <h2>Hello {{username}}!</h2>
                <p>Welcome to your new SaaS platform! We're excited to have you on board.</p>
                
                <h3>✅ Your Account Details:</h3>
                <ul>
                    <li><strong>Email:</strong> {{email}}</li>
                    <li><strong>Username:</strong> {{username}}</li>
                    <li><strong>Role:</strong> {{role}}</li>
                    <li><strong>Tenant:</strong> {{tenantName}}</li>
                </ul>

                <h3>🚀 What's Next?</h3>
                <ol>
                    <li>Complete your business profile setup</li>
                    <li>Explore your dashboard and features</li>
                    <li>Configure your subscription settings</li>
                    <li>Invite team members to collaborate</li>
                </ol>

                <div style="text-align: center;">
                    <a href="{{dashboardUrl}}" class="button">Access Your Dashboard</a>
                </div>

                <p>If you have any questions, our support team is here to help!</p>
                <p>Best regards,<br>The {{businessName}} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
                <p>This email was sent to {{email}}. If you didn't create this account, please contact support.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    `Welcome to {{businessName}}!

Hello {{username}},

Welcome to your new SaaS platform! We're excited to have you on board.

Your Account Details:
- Email: {{email}}
- Username: {{username}}
- Role: {{role}}
- Tenant: {{tenantName}}

What's Next?
1. Complete your business profile setup
2. Explore your dashboard and features
3. Configure your subscription settings  
4. Invite team members to collaborate

Access your dashboard: {{dashboardUrl}}

If you have any questions, our support team is here to help!

Best regards,
The {{businessName}} Team

---
© 2025 {{businessName}}. All rights reserved.
This email was sent to {{email}}. If you didn't create this account, please contact support.`
  ),

  passwordReset: new EmailTemplate(
    'passwordReset', 
    'Reset Your Password - {{businessName}}',
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FEF3C7; color: #92400E; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; border-left: 5px solid #F59E0B; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .button:hover { background: #DC2626; }
            .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset Request</h1>
                <p>We received a request to reset your password</p>
            </div>
            <div class="content">
                <h2>Hello {{username}},</h2>
                <p>Someone (hopefully you) requested a password reset for your {{businessName}} account.</p>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and contact our support team immediately.
                </div>

                <h3>Reset Your Password:</h3>
                <p>Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for security reasons.</p>

                <div style="text-align: center;">
                    <a href="{{resetUrl}}" class="button">Reset My Password</a>
                </div>

                <p>Or copy and paste this link in your browser:</p>
                <p style="color: #666; word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">{{resetUrl}}</p>

                <h3>🛡️ Security Tips:</h3>
                <ul>
                    <li>Choose a strong, unique password</li>
                    <li>Use a mix of letters, numbers, and symbols</li>
                    <li>Don't reuse passwords from other accounts</li>
                    <li>Consider using a password manager</li>
                </ul>

                <p>If you continue to have problems, please contact our support team.</p>
                <p>Best regards,<br>The {{businessName}} Security Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
                <p>This password reset was requested for {{email}}.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    `Password Reset Request - {{businessName}}

Hello {{username}},

Someone (hopefully you) requested a password reset for your {{businessName}} account.

⚠️ SECURITY NOTICE: If you didn't request this password reset, please ignore this email and contact our support team immediately.

To reset your password, visit this link (expires in 1 hour):
{{resetUrl}}

Security Tips:
- Choose a strong, unique password
- Use a mix of letters, numbers, and symbols
- Don't reuse passwords from other accounts
- Consider using a password manager

If you continue to have problems, please contact our support team.

Best regards,
The {{businessName}} Security Team

---
© 2025 {{businessName}}. All rights reserved.
This password reset was requested for {{email}}.`
  ),

  twoFactorCode: new EmailTemplate(
    'twoFactorCode',
    'Your 2FA Verification Code - {{businessName}}',
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>2FA Verification Code</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EFF6FF; color: #1E40AF; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; border-left: 5px solid #3B82F6; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .code { background: #F3F4F6; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; margin: 20px 0; color: #1F2937; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Two-Factor Authentication</h1>
                <p>Secure login verification required</p>
            </div>
            <div class="content">
                <h2>Hello {{username}},</h2>
                <p>To complete your login to {{businessName}}, please enter the verification code below:</p>
                
                <div class="code">{{code}}</div>

                <p><strong>This code will expire in 5 minutes.</strong></p>

                <h3>🛡️ Security Information:</h3>
                <ul>
                    <li>This code was generated for your login attempt</li>
                    <li>Never share this code with anyone</li>
                    <li>If you didn't try to log in, change your password immediately</li>
                    <li>Contact support if you suspect unauthorized access</li>
                </ul>

                <p>Having trouble? Contact our support team for assistance.</p>
                <p>Best regards,<br>The {{businessName}} Security Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
                <p>This verification code was sent to {{email}}.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    `Two-Factor Authentication - {{businessName}}

Hello {{username}},

To complete your login to {{businessName}}, please enter this verification code:

CODE: {{code}}

This code will expire in 5 minutes.

🛡️ Security Information:
- This code was generated for your login attempt
- Never share this code with anyone
- If you didn't try to log in, change your password immediately
- Contact support if you suspect unauthorized access

Having trouble? Contact our support team for assistance.

Best regards,
The {{businessName}} Security Team

---
© 2025 {{businessName}}. All rights reserved.
This verification code was sent to {{email}}.`
  )
};

// SaaS Business Flow Templates
export const businessTemplates = {
  subscriptionWelcome: new EmailTemplate(
    'subscriptionWelcome',
    'Welcome to {{planName}} Plan - {{businessName}}',
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Activated</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .plan-details { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 {{planName}} Plan Activated!</h1>
                <p>Your subscription is now active</p>
            </div>
            <div class="content">
                <h2>Hello {{username}},</h2>
                <p>Congratulations! Your {{planName}} plan subscription has been successfully activated.</p>
                
                <div class="plan-details">
                    <h3>📋 Subscription Details:</h3>
                    <ul>
                        <li><strong>Plan:</strong> {{planName}}</li>
                        <li><strong>Price:</strong> {{price}} {{currency}}/{{interval}}</li>
                        <li><strong>Max Outlets:</strong> {{maxOutlets}}</li>
                        <li><strong>Max Users:</strong> {{maxUsers}}</li>
                        <li><strong>Next Billing:</strong> {{nextBilling}}</li>
                    </ul>
                </div>

                <h3>🚀 What's Included:</h3>
                <ul>
                    {{#each features}}
                    <li>✅ {{this}}</li>
                    {{/each}}
                </ul>

                <div style="text-align: center;">
                    <a href="{{dashboardUrl}}" class="button">Access Your Dashboard</a>
                    <a href="{{billingUrl}}" class="button" style="background: #6B7280;">Manage Billing</a>
                </div>

                <p>Need help getting started? Check out our <a href="{{onboardingUrl}}">onboarding guide</a> or contact support.</p>
                <p>Best regards,<br>The {{businessName}} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
                <p>This subscription confirmation was sent to {{email}}.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    `{{planName}} Plan Activated - {{businessName}}

Hello {{username}},

Congratulations! Your {{planName}} plan subscription has been successfully activated.

📋 Subscription Details:
- Plan: {{planName}}
- Price: {{price}} {{currency}}/{{interval}}
- Max Outlets: {{maxOutlets}}
- Max Users: {{maxUsers}}
- Next Billing: {{nextBilling}}

🚀 What's Included:
{{#each features}}
✅ {{this}}
{{/each}}

Access your dashboard: {{dashboardUrl}}
Manage billing: {{billingUrl}}

Need help getting started? Check out our onboarding guide: {{onboardingUrl}}

Best regards,
The {{businessName}} Team

---
© 2025 {{businessName}}. All rights reserved.
This subscription confirmation was sent to {{email}}.`
  ),

  paymentFailed: new EmailTemplate(
    'paymentFailed',
    'Payment Failed - Action Required - {{businessName}}',
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FEF2F2; color: #B91C1C; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; border-left: 5px solid #EF4444; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .warning { background: #FEF2F2; border: 1px solid #FECACA; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>⚠️ Payment Failed</h1>
                <p>Action required to maintain your subscription</p>
            </div>
            <div class="content">
                <h2>Hello {{username}},</h2>
                <p>We were unable to process your payment for your {{planName}} subscription.</p>
                
                <div class="warning">
                    <strong>⚠️ Urgent:</strong> Your subscription will be suspended if payment is not updated within {{graceDays}} days.
                </div>

                <h3>💳 Payment Details:</h3>
                <ul>
                    <li><strong>Plan:</strong> {{planName}}</li>
                    <li><strong>Amount:</strong> {{amount}} {{currency}}</li>
                    <li><strong>Failed Date:</strong> {{failedDate}}</li>
                    <li><strong>Reason:</strong> {{failureReason}}</li>
                </ul>

                <h3>🔧 How to Fix This:</h3>
                <ol>
                    <li>Update your payment method</li>
                    <li>Ensure your card has sufficient funds</li>
                    <li>Check if your card has expired</li>
                    <li>Contact your bank if issues persist</li>
                </ol>

                <div style="text-align: center;">
                    <a href="{{updatePaymentUrl}}" class="button">Update Payment Method</a>
                </div>

                <p>Need assistance? Our billing support team is here to help.</p>
                <p>Best regards,<br>The {{businessName}} Billing Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
                <p>This billing notice was sent to {{email}}.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    `Payment Failed - Action Required - {{businessName}}

Hello {{username}},

We were unable to process your payment for your {{planName}} subscription.

⚠️ URGENT: Your subscription will be suspended if payment is not updated within {{graceDays}} days.

💳 Payment Details:
- Plan: {{planName}}
- Amount: {{amount}} {{currency}}
- Failed Date: {{failedDate}}
- Reason: {{failureReason}}

🔧 How to Fix This:
1. Update your payment method
2. Ensure your card has sufficient funds
3. Check if your card has expired
4. Contact your bank if issues persist

Update your payment method: {{updatePaymentUrl}}

Need assistance? Our billing support team is here to help.

Best regards,
The {{businessName}} Billing Team

---
© 2025 {{businessName}}. All rights reserved.
This billing notice was sent to {{email}}.`
  ),

  teamInvitation: new EmailTemplate(
    'teamInvitation',
    'You\'re Invited to Join {{tenantName}} - {{businessName}}',
    `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .invitation { background: #F5F3FF; border: 1px solid #DDD6FE; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤝 Team Invitation</h1>
                <p>You've been invited to collaborate</p>
            </div>
            <div class="content">
                <h2>Hello!</h2>
                <p><strong>{{inviterName}}</strong> has invited you to join their team on {{businessName}}.</p>
                
                <div class="invitation">
                    <h3>🏢 Invitation Details:</h3>
                    <ul>
                        <li><strong>Organization:</strong> {{tenantName}}</li>
                        <li><strong>Role:</strong> {{role}}</li>
                        <li><strong>Invited by:</strong> {{inviterName}} ({{inviterEmail}})</li>
                        <li><strong>Message:</strong> "{{invitationMessage}}"</li>
                    </ul>
                </div>

                <h3>🎯 What You'll Get Access To:</h3>
                <ul>
                    <li>{{tenantName}} dashboard and data</li>
                    <li>Collaboration tools and features</li>
                    <li>Role-based permissions and access</li>
                    <li>Team communication and updates</li>
                </ul>

                <div style="text-align: center;">
                    <a href="{{acceptUrl}}" class="button">Accept Invitation</a>
                </div>

                <p><small>This invitation will expire in 7 days. If you don't want to join, simply ignore this email.</small></p>
                
                <p>Questions about this invitation? Contact {{inviterName}} directly or reach out to our support team.</p>
                <p>Best regards,<br>The {{businessName}} Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 {{businessName}}. All rights reserved.</p>
                <p>This invitation was sent to {{email}}.</p>
            </div>
        </div>
    </body>
    </html>
    `,
    `Team Invitation - {{businessName}}

Hello!

{{inviterName}} has invited you to join their team on {{businessName}}.

🏢 Invitation Details:
- Organization: {{tenantName}}
- Role: {{role}}
- Invited by: {{inviterName}} ({{inviterEmail}})
- Message: "{{invitationMessage}}"

🎯 What You'll Get Access To:
- {{tenantName}} dashboard and data
- Collaboration tools and features  
- Role-based permissions and access
- Team communication and updates

Accept invitation: {{acceptUrl}}

This invitation will expire in 7 days. If you don't want to join, simply ignore this email.

Questions about this invitation? Contact {{inviterName}} directly or reach out to our support team.

Best regards,
The {{businessName}} Team

---
© 2025 {{businessName}}. All rights reserved.
This invitation was sent to {{email}}.`
  )
};

// Template rendering and sending functions
export class EmailTemplateService {
  private emailService: typeof emailService;
  
  constructor(emailServiceInstance?: typeof emailService) {
    this.emailService = emailServiceInstance || emailService;
  }

  async sendAuthEmail(templateName: keyof typeof authTemplates, to: string, data: TemplateData): Promise<boolean> {
    const template = authTemplates[templateName];
    const rendered = template.render(data);
    
    return await this.emailService.sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    });
  }

  async sendBusinessEmail(templateName: keyof typeof businessTemplates, to: string, data: TemplateData): Promise<boolean> {
    const template = businessTemplates[templateName];
    const rendered = template.render(data);
    
    return await this.emailService.sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text
    });
  }

  // Convenience methods for common emails
  async sendWelcomeEmail(to: string, userData: any): Promise<boolean> {
    return await this.sendAuthEmail('welcome', to, {
      businessName: 'Customer Dashboard SaaS',
      username: userData.username,
      email: userData.email,
      role: userData.role,
      tenantName: userData.tenantName || 'Your Business',
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard`
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    return await this.sendAuthEmail('passwordReset', to, {
      businessName: 'Customer Dashboard SaaS',
      username: to.split('@')[0],
      email: to,
      resetUrl
    });
  }

  async send2FAEmail(to: string, code: string): Promise<boolean> {
    return await this.sendAuthEmail('twoFactorCode', to, {
      businessName: 'Customer Dashboard SaaS',
      username: to.split('@')[0],
      email: to,
      code
    });
  }

  async sendSubscriptionWelcomeEmail(to: string, subscriptionData: any): Promise<boolean> {
    return await this.sendBusinessEmail('subscriptionWelcome', to, {
      businessName: 'Customer Dashboard SaaS',
      username: subscriptionData.username,
      email: to,
      planName: subscriptionData.planName,
      price: subscriptionData.price,
      currency: subscriptionData.currency,
      interval: subscriptionData.interval,
      maxOutlets: subscriptionData.maxOutlets,
      maxUsers: subscriptionData.maxUsers,
      nextBilling: subscriptionData.nextBilling,
      features: subscriptionData.features,
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard`,
      billingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/billing`,
      onboardingUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/onboarding`
    });
  }

  async sendPaymentFailedEmail(to: string, paymentData: any): Promise<boolean> {
    return await this.sendBusinessEmail('paymentFailed', to, {
      businessName: 'Customer Dashboard SaaS',
      username: paymentData.username,
      email: to,
      planName: paymentData.planName,
      amount: paymentData.amount,
      currency: paymentData.currency,
      failedDate: paymentData.failedDate,
      failureReason: paymentData.failureReason,
      graceDays: paymentData.graceDays || 3,
      updatePaymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/billing/update-payment`
    });
  }

  async sendTeamInvitationEmail(to: string, invitationData: any): Promise<boolean> {
    return await this.sendBusinessEmail('teamInvitation', to, {
      businessName: 'Customer Dashboard SaaS',
      email: to,
      tenantName: invitationData.tenantName,
      role: invitationData.role,
      inviterName: invitationData.inviterName,
      inviterEmail: invitationData.inviterEmail,
      invitationMessage: invitationData.message || 'Join our team and start collaborating!',
      acceptUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/accept-invitation?token=${invitationData.token}`
    });
  }
}

// Export default instance
export const emailTemplateService = new EmailTemplateService();