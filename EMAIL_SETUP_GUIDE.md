# Complete Email Setup Guide - Mailtrap

## 📧 Overview

This guide covers setting up Mailtrap for both **testing** (development) and **production** email sending.

**Mailtrap has two products:**
1. **Email Testing** - Catches emails in a fake inbox (port 2525) - for development
2. **Email Sending** - Sends real emails to actual users (port 587) - for production

---

## 🚀 Quick Start (If You Already Have Mailtrap Account & Domain)

### 5 Steps to Production Email:

1. **Get Email Sending Credentials**
   - Mailtrap → **Email Sending** → **SMTP**
   - Copy: Host, Port (587), Username, Password

2. **Verify Domain Status**
   - Email Sending → **Sending Domains**
   - Should show ✅ **Verified** (if not, add DNS records it shows)

3. **Update Production `.env`**
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=587
   SMTP_USER=your-sending-username
   SMTP_PASS=your-sending-password
   SMTP_SECURE=false
   EMAIL_FROM=noreply@royaldansityinvestments.com.gh
   FRONTEND_URL=https://royaldansityinvestments.com.gh
   ```

4. **Restart Backend**
   - `pm2 restart royaldansity-api` (or restart your server)

5. **Test**
   - Trigger password reset from production site
   - Check real email inbox ✅

**Done!** Jump to [Testing Checklist](#testing-checklist) to verify everything works.

---

## 📖 Detailed Setup

### Part 1: Email Testing (Development/Local)

**Purpose:** Test emails without sending to real users.

#### Step 1: Access Email Testing

1. Log in to [Mailtrap.io](https://mailtrap.io)
2. Click **"Email Testing"** in left sidebar
3. Go to **"Inboxes"** → **"My Inbox"**

#### Step 2: Get SMTP Credentials

1. Click **"SMTP Settings"** tab
2. Select **"Nodemailer"** (or see credentials directly)
3. Copy credentials:
   ```
   Host: smtp.mailtrap.io
   Port: 2525
   Username: [your-username]
   Password: [your-password]
   ```

#### Step 3: Configure Local Development

Update `backend/.env` (for local development):

```env
# Mailtrap Email Testing (Development)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-testing-username-here
SMTP_PASS=your-testing-password-here
SMTP_SECURE=false

# Email Settings
EMAIL_FROM=noreply@royaldansity.com
EMAIL_FROM_NAME=Royal Dansity

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Step 4: Test Locally

1. Start backend: `cd backend && npm run dev`
2. Trigger password reset from frontend
3. Check **Mailtrap → Email Testing → My Inbox**
4. Email appears there (not in real inbox)! ✅

---

### Part 2: Email Sending (Production)

**Purpose:** Send real emails to actual users.

#### Step 1: Access Email Sending

1. Mailtrap dashboard → **"Email Sending"** in left sidebar
2. You should see your sending domain

#### Step 2: Verify Your Domain

1. Go to **"Email Sending"** → **"Sending Domains"**
2. Find your domain (e.g., `royaldansityinvestments.com.gh`)
3. Check status:
   - ✅ **Verified** = Ready! Skip to Step 3
   - ⚠️ **Pending/Not Verified** = Continue below

**If Not Verified:**

1. Click on your domain
2. You'll see DNS records to add:
   - **SPF Record** - Add to your domain's DNS
   - **DKIM Record** - Add to your domain's DNS
   - **DMARC Record** (optional but recommended)

3. Add records in your domain's DNS settings:
   - Go to your domain registrar/hosting
   - Find "DNS Management" or "DNS Records"
   - Add each record Mailtrap shows you

4. Wait 10-15 minutes for DNS propagation

5. Go back to Mailtrap and click **"Verify"** or **"Check DNS"**

6. Status should change to ✅ **"Verified"**

#### Step 3: Get Email Sending Credentials

**Option A: Using Your Domain**

1. Go to **"Email Sending"** → **"SMTP"** (or **"Sending Domains"** → Your domain)
2. Look for **"SMTP Settings"** or **"Integration Settings"**
3. Copy credentials:
   ```
   Host: smtp.mailtrap.io
   Port: 587 (or 465 for SSL)
   Username: [your-sending-username]
   Password: [your-sending-password]
   ```

**Option B: Create SMTP User**

1. Go to **"Email Sending"** → **"SMTP"**
2. Click **"Add Integration"** or **"Create SMTP User"**
3. Select **"SMTP"** and follow prompts
4. Copy the credentials provided

#### Step 4: Check Email Address

Check what email addresses you can send from:
- Mailtrap should show allowed addresses (e.g., `noreply@royaldansityinvestments.com.gh`)
- Use one of these in `EMAIL_FROM` setting

#### Step 5: Configure Production

Update **production** `backend/.env` on your server:

```env
# Mailtrap Email Sending (Production)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-sending-username-here
SMTP_PASS=your-sending-password-here
SMTP_SECURE=false

# Email Settings
EMAIL_FROM=noreply@royaldansityinvestments.com.gh
EMAIL_FROM_NAME=Royal Dansity

# Frontend URL
FRONTEND_URL=https://royaldansityinvestments.com.gh

# Environment
NODE_ENV=production
```

**⚠️ Important:**
- Use **different credentials** than Email Testing!
- Port `587` = STARTTLS (`SMTP_SECURE=false`)
- Port `465` = SSL (`SMTP_SECURE=true`)
- `EMAIL_FROM` must match your verified domain

#### Step 6: Test Production

1. Restart backend: `pm2 restart royaldansity-api`
2. Test password reset from production site
3. Check **real email inbox** - email received! ✅
4. Check **Mailtrap → Email Sending → Activity** for delivery status

---

## 📊 Configuration Reference

### Quick Comparison

| Setting | Email Testing (Dev) | Email Sending (Prod) |
|---------|-------------------|---------------------|
| **Where emails go** | Mailtrap inbox | Real user inboxes |
| **Host** | `smtp.mailtrap.io` | `smtp.mailtrap.io` |
| **Port** | `2525` | `587` or `465` |
| **Credentials** | From "Email Testing" | From "Email Sending" |
| **Domain verification** | Not required | ✅ Required |
| **Use case** | Local development | Production server |

### Example .env Files

**Development (Local Testing):**
```env
NODE_ENV=development
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=abc123def456  # From Email Testing
SMTP_PASS=xyz789uvw012  # From Email Testing
SMTP_SECURE=false
EMAIL_FROM=noreply@royaldansity.com
EMAIL_FROM_NAME=Royal Dansity
FRONTEND_URL=http://localhost:5173
```

**Production (Server):**
```env
NODE_ENV=production
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=production_user_123  # From Email Sending
SMTP_PASS=production_pass_456  # From Email Sending
SMTP_SECURE=false
EMAIL_FROM=noreply@royaldansityinvestments.com.gh
EMAIL_FROM_NAME=Royal Dansity
FRONTEND_URL=https://royaldansityinvestments.com.gh
```

---

## ✅ Testing Checklist

### Email Testing (Development):
- [ ] Added Email Testing credentials to `backend/.env`
- [ ] Set `SMTP_PORT=2525`
- [ ] Started backend: `npm run dev`
- [ ] Triggered password reset from frontend
- [ ] Email appears in Mailtrap inbox ✅
- [ ] Can preview email HTML
- [ ] Reset link works correctly

### Email Sending (Production):
- [ ] Verified sending domain in Mailtrap ✅
- [ ] Added DNS records (SPF, DKIM) if needed
- [ ] Domain shows as "Verified"
- [ ] Got Email Sending SMTP credentials
- [ ] Added to production `backend/.env`
- [ ] Set `SMTP_PORT=587` (or `465` for SSL)
- [ ] Set `EMAIL_FROM` to match verified domain
- [ ] Restarted backend
- [ ] Tested from production site
- [ ] Real email received ✅
- [ ] Checked Mailtrap Activity for delivery status

### Complete Password Reset Flow:
- [ ] Email received within 30 seconds
- [ ] Email contains proper branding (Royal Dansity)
- [ ] Reset link works and redirects to frontend
- [ ] Token expires after 1 hour
- [ ] Can reset password using the link
- [ ] Confirmation email sent after password reset
- [ ] Invalid/expired tokens show proper error messages

---

## 🚨 Troubleshooting

### Issue: "Can't find SMTP credentials"

**Solution:**
- **For Testing:** Email Testing → Inboxes → My Inbox → SMTP Settings
- **For Sending:** Email Sending → SMTP (or Sending Domains → Your domain)
- If still can't find, Mailtrap might use API keys - check their docs

### Issue: "Domain not verified"

**Solution:**
1. Go to Email Sending → Sending Domains
2. Click on your domain
3. Add the DNS records it shows you (SPF, DKIM)
4. Wait 10-15 minutes for DNS propagation
5. Click "Verify" again in Mailtrap

### Issue: "Emails not sending in production"

**Solution:**
1. ✅ Check credentials are correct (different from testing!)
2. ✅ Verify domain is verified
3. ✅ Check `EMAIL_FROM` matches verified domain exactly
4. Check Mailtrap Activity for error messages
5. Check backend logs for SMTP errors
6. Verify SMTP port (`587` or `465`)

### Issue: "Authentication failed"

**Solution:**
1. Double-check username and password (no extra spaces!)
2. Make sure you're using correct credentials:
   - Testing credentials for development
   - Sending credentials for production
3. Verify `SMTP_SECURE` matches port:
   - Port `587` → `SMTP_SECURE=false`
   - Port `465` → `SMTP_SECURE=true`

### Issue: "Reset link doesn't work"

**Solution:**
1. Verify `FRONTEND_URL` is correct in `.env`
2. Check frontend route exists: `/reset-password?token=...`
3. Ensure token is passed in URL correctly
4. Check browser console for errors

### Issue: "Emails going to spam"

**Solution:**
1. Verify domain has SPF, DKIM records (Mailtrap shows these)
2. Add DMARC record (optional but helps)
3. Use proper `EMAIL_FROM` address (not free email)
4. Warm up your sending domain (start with small volumes)

### Issue: "Token expires too quickly"

**Solution:**
- Default expiry is 1 hour (3600 seconds)
- Check `backend/src/utils/crypto.ts` for token generation
- Adjust expiry time if needed

---

## 🧪 Manual Testing

You can test email sending directly from command line:

```bash
cd backend
node -e "
  import('./src/utils/email.js').then(async (email) => {
    const result = await email.sendPasswordResetEmail(
      'test@example.com',
      'test-token-123',
      'Test User'
    );
    console.log('Email sent:', result);
  });
"
```

---

## 🔍 Finding Credentials in Mailtrap

### For Email Testing:
1. **Email Testing** → **Inboxes** → **My Inbox**
2. Click **"SMTP Settings"** tab
3. Select **"Nodemailer"** or see credentials directly
4. Copy Host, Port, Username, Password

### For Email Sending:
1. **Email Sending** → **SMTP** (or **Sending Domains** → Your domain)
2. Look for **"SMTP Settings"** or **"Integration Settings"**
3. Copy Host, Port, Username, Password

---

## 💡 Pro Tips

1. **Keep credentials separate:**
   - Use Email Testing for local development
   - Use Email Sending for production
   - Never mix them up!

2. **Monitor your usage:**
   - Check Mailtrap dashboard for email counts
   - Free plan usually has 500-1000 emails/month

3. **Check delivery status:**
   - Mailtrap Email Sending → Activity shows delivery status
   - Helps debug why emails aren't received

4. **Test email design:**
   - Use Email Testing to preview HTML emails
   - Make sure links work, styling looks good

5. **Warm up your domain:**
   - Start with small email volumes
   - Gradually increase to avoid spam filters

---

## 📝 Complete Password Reset Flow Test

After configuring email, test the complete flow:

1. ✅ Request password reset from frontend
2. ✅ Receive email (in Mailtrap inbox for testing, real inbox for production)
3. ✅ Click reset link
4. ✅ Verify link redirects to frontend with token
5. ✅ Set new password using the link
6. ✅ Login with new password
7. ✅ Verify confirmation email received

---

## 📚 Additional Resources

- **Mailtrap Documentation:** [mailtrap.io/docs](https://mailtrap.io/docs)
- **Mailtrap Support:** Contact their support team for help
- **Backend Email Code:** `backend/src/utils/email.ts`

---

**Need help?** Check the troubleshooting section above or contact Mailtrap support!

