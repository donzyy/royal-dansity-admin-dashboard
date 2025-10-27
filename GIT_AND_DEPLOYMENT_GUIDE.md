# Git Setup & Deployment Guide

> **Step-by-step guide for beginners** - I'll walk you through everything!

---

## 📋 Table of Contents

1. [Git Setup & First Push](#git-setup--first-push)
2. [Email Testing](#email-testing)
3. [Cron Jobs](#cron-jobs)
4. [Testing Strategy](#testing-strategy)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Production Deployment](#production-deployment)

---

## 🎯 Git Setup & First Push

### Step 1: Initialize Git Repository

Open your terminal in the project root and run:

```bash
# Initialize git repository
git init

# Check git status (see what files will be committed)
git status
```

### Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Fill in:
   - **Repository name**: `royal-dansity-admin-dashboard` (or your preferred name)
   - **Description**: "Full-stack admin dashboard for Royal Dansity Investments"
   - **Visibility**: Choose **Private** (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license (we already have them)
4. Click **"Create repository"**

### Step 3: Connect Local Repository to GitHub

GitHub will show you commands. Use these:

```bash
# Add all files to staging
git add .

# Create first commit
git commit -m "Initial commit: Royal Dansity Admin Dashboard

- Complete frontend (Website + Dashboard)
- Complete backend API with Express + MongoDB
- Authentication & Authorization (JWT + RBAC)
- Role & Permission management
- User management
- Content management (Articles, Categories, Carousel)
- Message inbox system
- Analytics dashboard
- Real-time updates with Socket.IO
- File upload system
- Email system (Nodemailer)
- Swagger API documentation"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/royal-dansity-admin-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify on GitHub

1. Refresh your GitHub repository page
2. You should see all your files! 🎉

---

## 📧 Email Testing

### Option 1: Mailtrap (Development - FREE)

**Best for testing emails without sending real emails**

1. **Sign up**: Go to [Mailtrap.io](https://mailtrap.io)
2. **Get credentials**: 
   - Go to "Email Testing" → "Inboxes" → "My Inbox"
   - Copy SMTP credentials
3. **Update `backend/.env`**:
   ```env
   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_mailtrap_username
   EMAIL_PASS=your_mailtrap_password
   EMAIL_FROM=noreply@royaldansity.com
   ```
4. **Test**:
   - Go to Forgot Password page
   - Enter email
   - Check Mailtrap inbox for email!

### Option 2: SendGrid (Production - FREE tier available)

**For sending real emails in production**

1. **Sign up**: Go to [SendGrid.com](https://sendgrid.com)
2. **Create API Key**:
   - Go to Settings → API Keys → Create API Key
   - Copy the key (you'll only see it once!)
3. **Update `backend/.env`**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=your_sendgrid_api_key
   EMAIL_FROM=noreply@royaldansity.com
   ```
4. **Verify sender**: SendGrid requires you to verify your email/domain

### Testing Checklist:

```bash
# Start backend
cd backend
pnpm run dev

# Test password reset:
1. Go to http://localhost:5173/forgot-password
2. Enter email
3. Check Mailtrap/SendGrid inbox
4. Click reset link
5. Set new password
6. Login with new password ✅
```

---

## ⏰ Cron Jobs

**What are Cron Jobs?**
Scheduled tasks that run automatically (e.g., cleanup old logs, send reports, backup database)

### Step 1: Install `node-cron`

```bash
cd backend
npm install node-cron
npm install -D @types/node-cron
```

### Step 2: Create Cron Jobs File

Create `backend/src/jobs/scheduler.ts`:

```typescript
import cron from 'node-cron';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

/**
 * Scheduled Jobs
 */

// Clean up old logs (runs daily at 2 AM)
cron.schedule('0 2 * * *', () => {
  logger.info('Running scheduled job: Clean old logs');
  
  const logsDir = path.join(__dirname, '../../logs');
  const files = fs.readdirSync(logsDir);
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.mtimeMs < thirtyDaysAgo) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted old log file: ${file}`);
    }
  });
});

// Generate daily analytics report (runs daily at 1 AM)
cron.schedule('0 1 * * *', async () => {
  logger.info('Running scheduled job: Generate analytics report');
  
  // Your analytics logic here
  // Example: Aggregate yesterday's data, send email report, etc.
});

// Backup database (runs weekly on Sunday at 3 AM)
cron.schedule('0 3 * * 0', () => {
  logger.info('Running scheduled job: Database backup');
  
  // Your backup logic here
});

logger.info('Cron jobs initialized');
```

### Step 3: Import in `backend/src/index.ts`

Add this line after database connection:

```typescript
// Import cron jobs
import './jobs/scheduler';
```

### Cron Schedule Syntax:

```
 ┌────────────── second (optional, 0-59)
 │ ┌──────────── minute (0-59)
 │ │ ┌────────── hour (0-23)
 │ │ │ ┌──────── day of month (1-31)
 │ │ │ │ ┌────── month (1-12)
 │ │ │ │ │ ┌──── day of week (0-7, 0 and 7 are Sunday)
 │ │ │ │ │ │
 * * * * * *
```

**Examples:**
- `'0 0 * * *'` - Every day at midnight
- `'*/15 * * * *'` - Every 15 minutes
- `'0 9 * * 1-5'` - 9 AM on weekdays
- `'0 0 1 * *'` - First day of every month

---

## 🧪 Testing Strategy

### Why Test?
- Catch bugs before users do
- Confidence when making changes
- Documentation of how code works

### Step 1: Install Testing Tools

```bash
cd backend
pnpm install -D jest @types/jest ts-jest supertest @types/supertest
```

### Step 2: Configure Jest

Create `backend/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
};
```

### Step 3: Write Your First Test

Create `backend/src/__tests__/auth.test.ts`:

```typescript
import request from 'supertest';
import app from '../index'; // Export your Express app

describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@royaldansity.com',
        password: 'Admin@123',
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@royaldansity.com',
        password: 'WrongPassword',
      });
    
    expect(response.status).toBe(401);
  });
});
```

### Step 4: Add Test Scripts

Update `backend/package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 5: Run Tests

```bash
pnpm test
```

---

## 🔄 CI/CD Pipeline

**What is CI/CD?**
- **CI (Continuous Integration)**: Automatically test code when you push to GitHub
- **CD (Continuous Deployment)**: Automatically deploy if tests pass

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install npm
      run: npm install -g npm
    
    - name: Install dependencies
      run: |
        pnpm install
        cd backend && npm install
    
    - name: Run tests
      run: cd backend && npm test
    
    - name: Build
      run: |
        pnpm run build
        cd backend && npm run build
```

**What this does:**
1. Runs on every push to `main` or `develop`
2. Installs dependencies
3. Runs tests
4. Builds the project
5. ✅ or ❌ Shows status on GitHub

---

## 🚀 Production Deployment

### Backend Deployment Options

#### Option 1: Railway.app (Easiest - FREE tier)

1. **Sign up**: Go to [Railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. **Select your repository**
4. **Add MongoDB**:
   - Click "New" → "Database" → "MongoDB"
   - Railway will provide connection string
5. **Add Environment Variables**:
   - Click your service → "Variables"
   - Add all variables from `backend/.env`
   - Use Railway's MongoDB URL for `MONGODB_URI`
6. **Configure Build**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
7. **Deploy**: Railway auto-deploys on push!

#### Option 2: Render.com (FREE tier)

1. **Sign up**: Go to [Render.com](https://render.com)
2. **New** → **Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - Name: `royal-dansity-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. **Add Environment Variables**
6. **Create Web Service**

### Frontend Deployment Options

#### Option 1: Netlify (Easiest)

1. **Sign up**: Go to [Netlify.com](https://netlify.com)
2. **Add new site** → **Import from Git**
3. **Select repository**
4. **Configure**:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Add Environment Variables**:
   - `VITE_API_URL`: Your backend URL (from Railway/Render)
6. **Deploy**: Netlify auto-deploys on push!

#### Option 2: Vercel

1. **Sign up**: Go to [Vercel.com](https://vercel.com)
2. **Import Project** → **GitHub**
3. **Select repository**
4. **Configure**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variables**
6. **Deploy**

### Database: MongoDB Atlas (FREE tier)

1. **Sign up**: Go to [MongoDB.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster** (FREE M0)
3. **Database Access**:
   - Create database user
   - Save username/password
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
6. **Use in Backend**:
   - Update `MONGODB_URI` in Railway/Render

---

## 📝 Deployment Checklist

### Before Deploying:

- [ ] All environment variables documented in `backend/env.example`
- [ ] `.gitignore` configured (no `.env` files in Git)
- [ ] Database seeded with initial data
- [ ] All tests passing
- [ ] README.md updated with deployment info
- [ ] Remove any hardcoded URLs (use environment variables)

### After Deploying:

- [ ] Test all API endpoints on production
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test email sending
- [ ] Check logs for errors
- [ ] Set up monitoring (optional: Sentry, LogRocket)

---

## 🆘 Need Help?

**Common Issues:**

1. **Build fails**: Check Node.js version (should be 18+)
2. **Database connection fails**: Check MongoDB Atlas IP whitelist
3. **Environment variables not working**: Restart service after adding variables
4. **CORS errors**: Update `FRONTEND_URL` in backend `.env`

**Resources:**
- [Railway Docs](https://docs.railway.app)
- [Netlify Docs](https://docs.netlify.com)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas)

---

## 🎯 Recommended Learning Path

1. **Week 1**: Git basics + Push to GitHub ✅
2. **Week 2**: Email testing (Mailtrap) ✅
3. **Week 3**: Deploy to Railway + Netlify ✅
4. **Week 4**: Add basic tests ✅
5. **Week 5**: Set up GitHub Actions CI/CD ✅
6. **Week 6**: Add cron jobs ✅

---

**Take it one step at a time! I'll guide you through each step.** 🚀


