// Email service - using console.log for simulation as requested
export async function sendEmail(options) {
    console.log('📧 Email Service (Simulated)');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.text || options.html);
    console.log('---');
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
}
export async function sendWelcomeEmail(email, businessName) {
    await sendEmail({
        to: email,
        subject: 'Welcome to Customer Dashboard SaaS',
        text: `Welcome ${businessName}! Your account has been created successfully. You can now log in and start managing your business.`
    });
}
export async function sendActivationEmail(email, activationCode) {
    await sendEmail({
        to: email,
        subject: 'Activate Your Account',
        text: `Your activation code is: ${activationCode}. Please use this code to activate your account.`
    });
}
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
