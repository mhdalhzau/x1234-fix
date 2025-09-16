// Email service - using console.log for simulation as requested

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log('📧 Email Service (Simulated)');
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('Content:', options.text || options.html);
  console.log('---');
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
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