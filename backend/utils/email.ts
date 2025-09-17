// Email service using Replit Mail integration
import { sendEmail as replitSendEmail, type SmtpMessage } from './replitmail.js';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const message: SmtpMessage = {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await replitSendEmail(message);
    console.log('✅ Email sent successfully to:', result.accepted);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Fallback to console logging for development
    console.log('📧 Email Service (Fallback)');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.text || options.html);
    console.log('---');
  }
}

export async function sendWelcomeEmail(email: string, businessName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Welcome to Customer Dashboard SaaS',
    text: `Welcome ${businessName}! Your account has been created successfully. You can now log in and start managing your business.`
  });
}

export async function sendActivationEmail(email: string, activationCode: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Activate Your Account',
    text: `Your activation code is: ${activationCode}. Please use this code to activate your account.`
  });
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Customer Dashboard SaaS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
      </div>
    `,
    text: `You have requested to reset your password. Please visit the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request this password reset, please ignore this email.`
  });
}

// 2FA code email
export async function send2FACodeEmail(email: string, code: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Your 2FA Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Two-Factor Authentication</h2>
        <p>Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</div>
        </div>
        <p>Enter this code in your application to complete the login process.</p>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">This code will expire in 5 minutes.</p>
      </div>
    `,
    text: `Your 2FA verification code is: ${code}\n\nEnter this code in your application to complete the login process. This code will expire in 5 minutes.`
  });
}