/**
 * Email Configuration Test Script
 * 
 * This script tests your email configuration by attempting to send a test email.
 * 
 * Usage: npm run test:email
 * Or: tsx src/scripts/test-email.ts
 */

import 'dotenv/config';
import { sendPasswordResetEmail } from '../utils/email';
import { logger } from '../utils/logger';

async function testEmail() {
  console.log('\n📧 Testing Email Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables Check:');
  console.log('─────────────────────────────');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || '❌ NOT SET'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || '❌ NOT SET'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER ? '✅ SET (hidden)' : '❌ NOT SET'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ SET (hidden)' : '❌ NOT SET'}`);
  console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE || 'false'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM || '❌ NOT SET'}`);
  console.log(`EMAIL_FROM_NAME: ${process.env.EMAIL_FROM_NAME || '❌ NOT SET'}`);
  console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || '❌ NOT SET'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('─────────────────────────────\n');

  // Check if required variables are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: Missing required SMTP configuration!');
    console.error('\nPlease ensure your backend/.env file has:');
    console.error('  - SMTP_HOST (e.g., smtp.mailtrap.io)');
    console.error('  - SMTP_PORT (2525 for testing, 587 for production)');
    console.error('  - SMTP_USER (your Mailtrap username)');
    console.error('  - SMTP_PASS (your Mailtrap password)');
    console.error('\nSee EMAIL_SETUP_GUIDE.md for setup instructions.\n');
    process.exit(1);
  }

  // Determine if using Mailtrap Testing or Production
  const isTesting = process.env.SMTP_PORT === '2525';
  const isProduction = process.env.SMTP_PORT === '587' || process.env.SMTP_PORT === '465';
  
  if (isTesting) {
    console.log('📬 Mode: Email Testing (Mailtrap)');
    console.log('   Emails will appear in Mailtrap inbox, NOT in real email inbox!\n');
    console.log('   👉 Check: https://mailtrap.io → Email Testing → Inboxes → My Inbox\n');
  } else if (isProduction) {
    console.log('📮 Mode: Email Sending (Production)');
    console.log('   Emails will be sent to REAL email addresses!\n');
  }

  // Ask for test email
  const testEmail = process.argv[2] || 'test@example.com';
  const testToken = 'test-token-12345';
  const testUserName = 'Test User';

  console.log(`\n🚀 Sending test email to: ${testEmail}\n`);

  try {
    const result = await sendPasswordResetEmail(testEmail, testToken, testUserName);
    
    if (result) {
      console.log('✅ Email sent successfully!\n');
      
      if (isTesting) {
        console.log('📬 IMPORTANT: This email went to Mailtrap inbox, NOT your real email!');
        console.log('   Go to: https://mailtrap.io → Email Testing → Inboxes → My Inbox\n');
      } else {
        console.log('📧 Check the inbox for:', testEmail);
        console.log('   Also check spam/junk folder if not found.\n');
      }
    } else {
      console.error('❌ Email sending failed (returned false)\n');
      console.error('   Check backend logs for error details.\n');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ ERROR sending email:\n');
    console.error(error.message || error);
    console.error('\n');
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication Failed!');
      console.error('   Check your SMTP_USER and SMTP_PASS credentials.\n');
    } else if (error.code === 'ECONNECTION') {
      console.error('🔌 Connection Failed!');
      console.error('   Check your SMTP_HOST and SMTP_PORT settings.\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Connection Timeout!');
      console.error('   Check your network connection and SMTP settings.\n');
    }
    
    process.exit(1);
  }
}

// Run the test
testEmail().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

