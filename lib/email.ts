import nodemailer from 'nodemailer';

// Create transporter using SMTP from environment variables
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} verificationCode - 6-digit verification code
 */
export async function sendVerificationCodeEmail(email: string, verificationCode: string) {
  try {
    await transporter.sendMail({
      from: `"AEBR CMS Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Verification Code - AEBR CMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a3a2a;">Password Reset Verification Code</h2>
          <p>You have requested to reset your password for your AEBR CMS account.</p>
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #f0f0f0; color: #1a3a2a; font-size: 24px; font-weight: bold; letter-spacing: 5px; padding: 10px 20px; border-radius: 6px;">
              ${verificationCode}
            </span>
          </div>
          <p>Enter this code on the password reset page to proceed with changing your password.</p>
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            This is an automated message, please do not reply to this email.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}