# 🪟 Windows Server Deployment Guide - Royal Dansity Investments

Complete guide for deploying to Windows Server with Nginx and subdomain architecture.

---

## 🎯 **Your Architecture**

```
Main Website & Admin:  https://royaldansityinvestments.com.gh
                       https://www.royaldansityinvestments.com.gh
                       (Serves both public pages AND /admin routes)

API Backend:           https://api.royaldansityinvestments.com.gh
                       (Express backend on port 5001)
```

**Key Insight:** Since your React app handles BOTH public pages and admin routes, you only need **ONE BUILD**! 🎉

---

## 📋 **Prerequisites**

- ✅ Windows Server
- ✅ Node.js installed
- ✅ Nginx for Windows installed
- ✅ MongoDB (or MongoDB Atlas)
- ✅ Wildcard SSL certificate (you already have this!)
- ✅ PM2 or Windows Service to run Node.js

---

## 📂 **Step 1: Project Setup on Windows Server**

### 1.1 Clone Repository

```powershell
# Navigate to your deployment directory
cd C:\Users\Administrator\Desktop

# Clone your repository
git clone https://YOUR_TOKEN@github.com/donzyy/royal-dansity-admin-dashboard.git royaldansityinvestments

cd royaldansityinvestments
```

### 1.2 Install Dependencies

```powershell
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ..\client
npm install
```

### 1.3 Create Backend Environment File

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\backend
notepad .env
```

**Paste (adjust values):**
```env
NODE_ENV=production
PORT=5001

# MongoDB
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/royaldansity

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=YOUR_64_CHAR_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_DIFFERENT_64_CHAR_SECRET_HERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Allow your main domain
CORS_ORIGIN=https://royaldansityinvestments.com.gh,https://www.royaldansityinvestments.com.gh,https://api.royaldansityinvestments.com.gh

# Frontend URL
FRONTEND_URL=https://royaldansityinvestments.com.gh

# Email Configuration
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@royaldansityinvestments.com.gh
EMAIL_FROM_NAME=Royal Dansity Investments

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# Logging
LOG_LEVEL=error
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Admin
ADMIN_EMAIL=admin@royaldansityinvestments.com.gh
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
```

### 1.4 Create Frontend Environment File

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\client
notepad .env.production
```

**Paste:**
```env
# Point to your API subdomain
VITE_API_URL=https://api.royaldansityinvestments.com.gh/api
VITE_SOCKET_URL=https://api.royaldansityinvestments.com.gh
VITE_APP_NAME="Royal Dansity Investments"
```

---

## 🏗️ **Step 2: Build Application**

### 2.1 Build Frontend (ONE BUILD for everything!)

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\client
npm run build
```

This creates `client\dist\` with:
- Public website pages (/, /about, /services, /news, /contact)
- Admin dashboard (/admin/login, /admin/dashboard, etc.)
- All in ONE optimized build! ✅

### 2.2 Build Backend (Compile TypeScript)

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\backend
npm run build
```

### 2.3 Seed Database

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\backend
npm run seed
```

This creates:
- Default permissions
- Default roles (Admin, Editor, Viewer, etc.)
- Default admin user: `admin@royaldansityinvestments.com.gh` / Your password

---

## 🚀 **Step 3: Start Backend with PM2**

### 3.1 Install PM2 (if not installed)

```powershell
npm install -g pm2
npm install -g pm2-windows-startup

# Configure PM2 to start on Windows boot
pm2-startup install
```

### 3.2 Start Backend

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\backend

# Start with PM2
pm2 start npm --name "royaldansity-api" -- start

# Save PM2 configuration
pm2 save
```

### 3.3 Verify Backend is Running

```powershell
# Check PM2 status
pm2 list

# Test backend locally
curl http://localhost:5001/api/ping
# Should return: {"message":"pong"}
```

---

## 🌐 **Step 4: Nginx Configuration for Windows**

### 4.1 Your Current Main Domain Config (Already Good!)

Your current config at `C:\nginx\conf\nginx.conf` (or sites-available):

```nginx
# This is already correct! ✅
server {
    listen 443 ssl;
    server_name royaldansityinvestments.com.gh www.royaldansityinvestments.com.gh;

    ssl_certificate C:/nginx/ssl/Royaldansityinvestments_com.gh/fullchain.pem;
    ssl_certificate_key C:/nginx/ssl/Royaldansityinvestments_com.gh/__royaldansityinvestments.com.gh-PrivateKey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1h;
    ssl_prefer_server_ciphers on;

    # Serves your React app (both public AND admin routes!)
    root C:/Users/Administrator/Desktop/royaldansityinvestments/client/dist;
    index index.html index.htm;

    # Client body size for file uploads
    client_max_body_size 10M;

    # React Router - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Error handling
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root html;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name royaldansityinvestments.com.gh www.royaldansityinvestments.com.gh;
    return 301 https://$host$request_uri;
}

# Redirect .com to .com.gh
server {
    listen 80;
    server_name royaldansityinvestments.com www.royaldansityinvestments.com;
    return 301 https://royaldansityinvestments.com.gh$request_uri;
}
```

### 4.2 ADD API Subdomain Configuration

Add this NEW server block to your Nginx config:

```nginx
# API Subdomain - api.royaldansityinvestments.com.gh
server {
    listen 443 ssl;
    server_name api.royaldansityinvestments.com.gh;

    # Use your wildcard SSL certificate (same as main domain)
    ssl_certificate C:/nginx/ssl/Royaldansityinvestments_com.gh/fullchain.pem;
    ssl_certificate_key C:/nginx/ssl/Royaldansityinvestments_com.gh/__royaldansityinvestments.com.gh-PrivateKey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1h;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client body size for file uploads
    client_max_body_size 10M;

    # Proxy ALL requests to Express backend
    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO support (if using WebSockets)
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Serve uploaded files
    location /uploads/ {
        alias C:/Users/Administrator/Desktop/royaldansityinvestments/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log C:/nginx/logs/api.royaldansity_access.log;
    error_log C:/nginx/logs/api.royaldansity_error.log;
}

# Redirect HTTP to HTTPS for API subdomain
server {
    listen 80;
    server_name api.royaldansityinvestments.com.gh;
    return 301 https://$host$request_uri;
}
```

### 4.3 Update Backend CORS in Your Code

Edit `backend\src\index.ts` and update CORS configuration:

```typescript
import cors from 'cors';

// Allow multiple origins
const allowedOrigins = [
  'https://royaldansityinvestments.com.gh',
  'https://www.royaldansityinvestments.com.gh',
  'https://api.royaldansityinvestments.com.gh',
  'http://localhost:5173', // Development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

### 4.4 Test and Reload Nginx

```powershell
# Test Nginx configuration
C:\nginx\nginx.exe -t

# If test passes, reload Nginx
C:\nginx\nginx.exe -s reload

# Or restart Nginx service (if running as service)
net stop nginx
net start nginx
```

---

## 🌍 **Step 5: DNS Configuration**

Add these DNS records in your domain registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| CNAME | www | yourdomain.com | 3600 |
| A | api | YOUR_SERVER_IP | 3600 |

**Wait 5-30 minutes for DNS propagation**, then test:

```powershell
nslookup yourdomain.com
nslookup api.yourdomain.com
```

---

## 🧪 **Step 6: Testing**

### 6.1 Test Backend API

```powershell
# Test locally
curl http://localhost:5001/api/ping

# Test through API subdomain
curl https://api.royaldansityinvestments.com.gh/api/ping
```

Both should return: `{"message":"pong"}`

### 6.2 Test Main Website

Visit: `https://yourdomain.com`

**Should load:**
- ✅ Homepage (public)
- ✅ About, Services, News, Contact pages
- ✅ Admin login at `/admin/login`
- ✅ Admin dashboard (after login)

### 6.3 Test Admin Dashboard

1. Visit: `https://yourdomain.com/admin/login`
2. Login with: `admin@royaldansity.com` / Your password
3. Check dashboard loads and can fetch data from API subdomain

### 6.4 Test File Uploads

- Upload a news article with image
- Upload carousel slide
- Upload profile picture
- Verify files are accessible via API subdomain

---

## 🔄 **Step 7: Update Workflow**

### When You Make Changes:

```powershell
# On your development machine
git add .
git commit -m "Your changes"
git push origin main

# On Windows Server
cd C:\Users\Administrator\Desktop\royaldansityinvestments
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart royaldansity-api

# Update frontend
cd ..\client
npm install
npm run build
# Nginx will automatically serve new files from dist folder!
```

---

## 📊 **Your Final Architecture**

```
User visits: https://yourdomain.com.gh
  ↓
  Nginx serves: C:/Users/.../royaldansityinvestments/client/dist
  ↓
  React Router handles:
    • / → Homepage
    • /about → About page
    • /services → Services
    • /news → News listing
    • /admin/login → Admin login
    • /admin/dashboard → Admin dashboard
  ↓
  React app makes API calls to: https://api.yourdomain.com/api/...
  ↓
  Nginx proxies to: http://localhost:5001
  ↓
  Express backend responds
```

**Clean, professional, and scalable!** ✨

---

## 🛡️ **Security Checklist**

- ✅ HTTPS enforced (HTTP redirects to HTTPS)
- ✅ Wildcard SSL certificate installed
- ✅ CORS configured for specific origins
- ✅ `.env` files not in Git
- ✅ Admin routes protected by authentication
- ✅ API on separate subdomain
- ✅ File upload size limits set
- ✅ Rate limiting enabled in backend
- ✅ JWT tokens with expiration
- ✅ bcrypt for password hashing

**Additional hardening:**
- Enable Windows Firewall (ports 80, 443, 5001 only)
- Use fail2ban equivalent for Windows
- Regular Windows Updates
- Database backups
- Monitor PM2 logs regularly

---

## 🚨 **Troubleshooting**

### Problem: "502 Bad Gateway" on API subdomain
```powershell
# Check if backend is running
pm2 list
pm2 logs royaldansity-api

# Check if port 5001 is listening
netstat -ano | findstr :5001

# Restart backend
pm2 restart royaldansity-api
```

### Problem: "CORS Error" in browser console
```typescript
// Make sure backend CORS includes all origins:
const allowedOrigins = [
  'https://royaldansityinvestments.com.gh',
  'https://www.royaldansityinvestments.com.gh',
  'https://api.royaldansityinvestments.com.gh',
];
```

### Problem: Admin dashboard shows blank page
```powershell
# Check browser console for errors
# Verify API URL in .env.production
# Rebuild frontend:
cd client
npm run build
```

### Problem: File uploads don't work
```nginx
# Make sure Nginx config has:
client_max_body_size 10M;

# And uploads location points to correct path:
location /uploads/ {
    alias C:/Users/Administrator/Desktop/royaldansityinvestments/backend/uploads/;
}
```

### Problem: Can't access after reboot
```powershell
# Make sure PM2 is configured for startup
pm2-startup install
pm2 save

# Verify Nginx starts on boot (if running as service)
```

---

## 📞 **Useful Commands**

### PM2 Commands
```powershell
pm2 list                      # List all processes
pm2 logs royaldansity-api     # View logs
pm2 restart royaldansity-api  # Restart
pm2 stop royaldansity-api     # Stop
pm2 delete royaldansity-api   # Remove
pm2 monit                     # Real-time monitoring
```

### Nginx Commands (Windows)
```powershell
# Test configuration
C:\nginx\nginx.exe -t

# Reload configuration
C:\nginx\nginx.exe -s reload

# Stop
C:\nginx\nginx.exe -s stop

# Start
Start-Process C:\nginx\nginx.exe

# Check if running
Get-Process nginx
```

### Git Commands
```powershell
git status
git pull origin main
git log --oneline -5
```

---

## 🎉 **Summary**

### What You Have:
✅ **ONE Build** - Serves both public website AND admin dashboard  
✅ **Subdomain API** - Clean separation for backend  
✅ **Wildcard SSL** - Covers all subdomains  
✅ **Professional Structure** - Industry-standard architecture  
✅ **Windows Server** - Optimized for your environment  

### Your URLs:
- **Public Website**: https://royaldansityinvestments.com.gh
- **Admin Dashboard**: https://royaldansityinvestments.com.gh/admin
- **API Backend**: https://api.royaldansityinvestments.com.gh
- **API Docs**: https://api.royaldansityinvestments.com.gh/api-docs (if enabled)

**Everything is documented and ready for deployment!** 🚀

---

**Sleep well - you have a clear, Windows-specific deployment plan!** 🪟✨

