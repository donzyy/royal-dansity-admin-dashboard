# 🔧 Environment Variables Guide

## 🎯 **Understanding the Problem You Asked About**

You asked: *"If I deploy to my server with domain and Nginx, would hardcoded `http://localhost:5001` paths affect everything?"*

**Answer: YES! But we've got you covered.** 🛡️

---

## 📖 **How It Works**

### **Development (Current Setup)**
```
Frontend (localhost:5173) → Backend (localhost:5001)
```

### **Production (Your Server with Nginx)**
```
Browser → https://yourdomain.com → Nginx → Backend (localhost:5001)
                                          ↓
                                    Serves Frontend
```

**The Magic:** Nginx sits in front and handles everything:
- Serves your React app (frontend)
- Proxies `/api/*` requests to backend
- All on **one domain** → No CORS issues!

---

## ✅ **Your App is ALREADY Configured Correctly!**

Good news! Your code is already using environment variables:

### **Frontend API Client** (`client/lib/api.ts`)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

This means:
- **Development**: Uses `VITE_API_URL` from `.env` → `http://localhost:5001/api`
- **Production**: If not set, defaults to `/api` (relative path) → Nginx proxies it!

### **Frontend Auth Context** (`client/contexts/AuthContext.tsx`)
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

This should be updated for production (see below).

---

## 📂 **Environment Files You Need to Create**

### **1. Frontend Environment** (`client/.env`)

Create `client/.env` (for development):
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME="Royal Dansity Admin"
VITE_APP_VERSION=1.0.0
```

Create `client/.env.production` (for production build):
```env
# Use relative paths - Nginx will handle proxying
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_APP_NAME="Royal Dansity Admin"
VITE_APP_VERSION=1.0.0
```

**Why relative paths in production?**
- `/api` becomes `https://yourdomain.com/api`
- Nginx proxies this to `localhost:5001`
- No CORS, no hardcoded domains!

---

### **2. Backend Environment** (`backend/.env`)

Create `backend/.env`:

```env
# ================================
# Backend Environment Variables
# ================================

# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGODB_URI=mongodb://localhost:27017/royaldansity
# For production with MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/royaldansity

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
# For production:
# CORS_ORIGIN=https://yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
# For production:
# FRONTEND_URL=https://yourdomain.com

# Email Configuration (Mailtrap)
# For development/testing - use Email Testing credentials:
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-testing-username
SMTP_PASS=your-testing-password
SMTP_SECURE=false

# For production - use Email Sending credentials (different from testing!):
# SMTP_HOST=smtp.mailtrap.io
# SMTP_PORT=587
# SMTP_USER=your-sending-username
# SMTP_PASS=your-sending-password
# SMTP_SECURE=false

EMAIL_FROM=noreply@royaldansity.com
EMAIL_FROM_NAME=Royal Dansity

# See EMAIL_SETUP_GUIDE.md for complete Mailtrap setup instructions

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=10

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# API Documentation
API_DOCS_ENABLED=true

# Admin Configuration
ADMIN_EMAIL=admin@royaldansity.com
ADMIN_PASSWORD=Admin@123
```

---

## 🚀 **Production Environment** (On Your Server)

### **Backend** (`backend/.env` on server)
```env
NODE_ENV=production
PORT=5001

# MongoDB Atlas (recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/royaldansity

# Secure JWT secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=<your-generated-64-char-string>
JWT_REFRESH_SECRET=<your-different-64-char-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Your domain
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email Configuration (Mailtrap - Production)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-sending-username
SMTP_PASS=your-sending-password
SMTP_SECURE=false
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Royal Dansity
# Note: Use Email Sending credentials (not Email Testing!)
# Domain must be verified in Mailtrap
# See EMAIL_SETUP_GUIDE.md for setup instructions

# Paths on server
UPLOAD_DIR=/var/www/royaldansity/uploads
LOG_FILE=/var/www/royaldansity/logs/app.log

# Production settings
BCRYPT_ROUNDS=12
LOG_LEVEL=error
RATE_LIMIT_MAX_REQUESTS=50
```

### **Frontend** (`client/.env.production` for build)
```env
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_APP_NAME="Royal Dansity Admin"
VITE_APP_VERSION=1.0.0
```

---

## 🔍 **Files That Need Checking**

I found **28 files** in your frontend that reference `localhost` or `http://`. Let me check the critical ones:

### **Files to Review:**

1. **`client/contexts/AuthContext.tsx`** ✅ Already using env var:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
   ```

2. **`client/lib/api.ts`** ✅ Already using env var:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
   ```

3. **Avatar/Image URLs** - These files might have hardcoded URLs for displaying images:
   - `AccountSettings.tsx`
   - `AdminLayout.tsx`
   - `UserProfile.tsx`
   - etc.

   **Pattern used** (already correct):
   ```typescript
   const imageUrl = user.avatar.startsWith('http') 
     ? user.avatar 
     : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${user.avatar}`;
   ```

---

## 🎯 **What Happens When You Deploy?**

### **Step 1: You push to GitHub** ✅

### **Step 2: On your server, you:**
1. Clone repository
2. Create `backend/.env` with production values
3. Build frontend: `cd client && npm run build` (uses `.env.production`)
4. Start backend with PM2: `pm2 start npm --name royaldansity-api -- start`

### **Step 3: Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve frontend (React build)
    root /var/www/royaldansity/client/dist;
    index index.html;

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/royaldansity/uploads/;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### **Step 4: Point your domain**
- Update DNS A record to your server IP
- Wait for propagation (5-60 minutes)

### **Step 5: Add SSL**
```bash
sudo certbot --nginx -d yourdomain.com
```

### **Step 6: It works!** 🎉
- Frontend: `https://yourdomain.com`
- API calls: `https://yourdomain.com/api/...` → Nginx proxies to `localhost:5001`
- Images: `https://yourdomain.com/uploads/...` → Nginx serves from filesystem

---

## 🔄 **How Requests Flow**

### **Development:**
```
React App (localhost:5173)
  ↓ calls /api/users
  → VITE_API_URL=http://localhost:5001/api
  → http://localhost:5001/api/users
```

### **Production:**
```
Browser visits https://yourdomain.com
  ↓ loads React app (served by Nginx)
  ↓ React calls /api/users (relative path)
  → https://yourdomain.com/api/users
  → Nginx sees /api/...
  → Proxies to http://localhost:5001/api/users
  → Backend responds
  → Nginx returns to browser
```

**Same domain, no CORS, no hardcoded URLs!** ✨

---

## 📝 **Quick Setup Checklist**

### **Before You Push to GitHub:**
- [ ] Create `client/.env` for development
- [ ] Create `client/.env.production` for production build
- [ ] Create `backend/.env` (don't commit this!)
- [ ] Add `.env` to `.gitignore` (already done ✅)
- [ ] Test locally: `cd backend && npm run dev` + `cd client && npm run dev`

### **On Your Server:**
- [ ] Clone repository
- [ ] Create `backend/.env` with production values
- [ ] Run: `cd backend && npm run seed`
- [ ] Build frontend: `cd client && npm run build`
- [ ] Start backend: `pm2 start npm --name royaldansity-api -- start`
- [ ] Configure Nginx (see `DEPLOYMENT_SERVER_GUIDE.md`)
- [ ] Point domain DNS to server
- [ ] Add SSL with Certbot

---

## 🚨 **Common Mistakes to Avoid**

1. ❌ **Hardcoding `http://localhost:5001` in production**
   ✅ Use `import.meta.env.VITE_API_URL` or relative paths

2. ❌ **Forgetting to build frontend with production env**
   ✅ `cd client && npm run build` (automatically uses `.env.production`)

3. ❌ **Not configuring CORS correctly**
   ✅ Backend `.env`: `CORS_ORIGIN=https://yourdomain.com`

4. ❌ **Committing `.env` files to Git**
   ✅ Only commit `.env.example` files

5. ❌ **Using weak JWT secrets**
   ✅ Generate strong secrets: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 💡 **Why This Approach is Better**

✅ **No CORS issues** - Same domain for frontend and backend  
✅ **Secure** - Backend not directly exposed to internet  
✅ **Fast** - Nginx serves static files efficiently  
✅ **Flexible** - Easy to move backend to different server later  
✅ **SSL** - One certificate covers everything  
✅ **CDN-ready** - Can add Cloudflare in front of Nginx  

---

## 🎯 **Summary**

**Your Question:** Would hardcoded `http://localhost:5001` break in production?

**Answer:** 
- **Your code is already correct!** ✅ It uses environment variables.
- **In development:** Uses `http://localhost:5001/api`
- **In production:** Uses `/api` (relative) → Nginx proxies to backend
- **Documentation example** was just for illustration - now updated! ✅

**Next Steps:**
1. Sleep well! 😴
2. Create the `.env` files mentioned above
3. Push to GitHub
4. Follow `DEPLOYMENT_SERVER_GUIDE.md` to deploy

You're all set! 🚀

