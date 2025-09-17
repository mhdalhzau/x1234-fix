export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
export declare function sendEmail(options: EmailOptions): Promise<void>;
export declare function sendWelcomeEmail(email: string, businessName: string): Promise<void>;
export declare function sendActivationEmail(email: string, activationCode: string): Promise<void>;
export declare function generateOTP(): string;
