import nodemailer from 'nodemailer';
import { logger } from './logger';

/**
 * Email Service
 * Handles sending emails for password reset, notifications, etc.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create reusable transporter
const createTransporter = () => {
  // Mailtrap supports both Email Testing and Email Sending
  // Email Testing: Uses port 2525 (catches emails in fake inbox)
  // Email Sending: Uses port 587 or 465 (sends real emails with verified domain)
  
  if (process.env.SMTP_HOST === 'smtp.mailtrap.io') {
    // Mailtrap (works for both testing and production)
    const port = Number(process.env.SMTP_PORT) || 2525;
    const isSecure = port === 465;
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: isSecure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.SMTP_HOST) {
    // Other SMTP services (Gmail, AWS SES, etc.)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback: Log to console (development only)
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('No SMTP configuration found. Emails will be logged to console.');
      return nodemailer.createTransporter({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else {
      throw new Error('SMTP configuration is required in production. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in your .env file.');
    }
  }
};

/**
 * Send an email
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Royal Dansity'} <${
        process.env.EMAIL_FROM || 'noreply@royaldansity.com'
      }>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);

    // If using streamTransport (console logging)
    if (info.message) {
      logger.info('=== EMAIL SENT (Console Mode) ===');
      logger.info(`To: ${options.to}`);
      logger.info(`Subject: ${options.subject}`);
      logger.info(`Body:\n${info.message.toString()}`);
      logger.info('=================================');
    } else {
      logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    }

    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
  // Logo URL - must be absolute for email clients
  const logoUrl = `${frontendUrl}/Royal%20Dansity%20Inv%20Intl_LOGO_NO%20BACKGROUND.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            display: inline-block;
            max-width: 200px;
            height: auto;
          }
          h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37 0%, #C8963E 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .button:hover {
            opacity: 0.9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .expiry {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${frontendUrl}" style="text-decoration: none; display: inline-block;">
              <img src="${logoUrl}" alt="Royal Dansity Investments International" class="logo" style="max-width: 200px; height: auto;" />
            </a>
          </div>
          
          <h1>Reset Your Password</h1>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your Royal Dansity account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p class="expiry">This link will expire in <strong>1 hour</strong>.</p>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please contact our support team immediately.
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0066cc;">${resetUrl}</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by Royal Dansity<br>
            If you have any questions, please contact our support team.</p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} Royal Dansity. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Royal Dansity',
    html,
  });
};

/**
 * Send password change confirmation email
 */
export const sendPasswordChangeConfirmation = async (
  email: string,
  userName: string
): Promise<boolean> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  // Logo URL - must be absolute for email clients
  const logoUrl = `${frontendUrl}/Royal%20Dansity%20Inv%20Intl_LOGO_NO%20BACKGROUND.png`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            display: inline-block;
            max-width: 200px;
            height: auto;
          }
          .success-icon {
            font-size: 48px;
            text-align: center;
            margin: 20px 0;
          }
          h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          .content {
            margin-bottom: 30px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${frontendUrl}" style="text-decoration: none; display: inline-block;">
              <img src="${logoUrl}" alt="Royal Dansity Investments International" class="logo" style="max-width: 200px; height: auto;" />
            </a>
          </div>
          
          <div class="success-icon">✅</div>
          
          <h1>Password Changed Successfully</h1>
          
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>This email confirms that your password was successfully changed on ${new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}.</p>
            
            <p>Your account is now secured with your new password.</p>
            
            <div class="warning">
              <strong>⚠️ Didn't change your password?</strong><br>
              If you did not authorize this change, please contact our support team immediately and secure your account.
            </div>
          </div>
          
          <div class="footer">
            <p>This email was sent by Royal Dansity<br>
            If you have any questions, please contact our support team.</p>
            <p style="margin-top: 10px; font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} Royal Dansity. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Changed Successfully - Royal Dansity',
    html,
  });
};

