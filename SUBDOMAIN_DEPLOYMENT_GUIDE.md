# 🌐 Subdomain Deployment Guide - Your Company Name

Complete guide to deploy with subdomain architecture using your wildcard SSL certificate.

---

## 🎯 **Your Architecture**

```
Main Website (Public):
├─ https://yourdomain.com
└─ https://www.yourdomain.com

Admin Dashboard:
└─ https://admin.yourdomain.com

API Backend:
└─ https://api.yourdomain.com
```

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Better security (API isolated)
- ✅ Easier to scale (can move API to different server later)
- ✅ Professional structure
- ✅ One wildcard SSL covers all subdomains

---

## 📡 **Step 1: DNS Configuration**

### 1.1 Add DNS Records

In your domain registrar's DNS settings (or cPanel):

**Main Domain:**
```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600
```

**WWW Subdomain:**
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

**API Subdomain:**
```
Type: A
Name: api
Value: YOUR_SERVER_IP
TTL: 3600
```

**Admin Subdomain:**
```
Type: A
Name: admin
Value: YOUR_SERVER_IP
TTL: 3600
```

### 1.2 Verify DNS Propagation

```bash
# Wait 5-30 minutes, then test
nslookup yourdomain.com
nslookup api.yourdomain.com
nslookup admin.yourdomain.com

# Or use ping
ping api.yourdomain.com
ping admin.yourdomain.com
```

---

## 🔧 **Step 2: Server Setup**

### 2.1 Deploy Application

```bash
# SSH into your server
ssh your-username@your-server-ip

# Create application directory
sudo mkdir -p /var/www/royaldansity
sudo chown -R $USER:$USER /var/www/royaldansity
cd /var/www/royaldansity

# Clone repository
git clone https://YOUR_TOKEN@github.com/donzyy/royal-dansity-admin-dashboard.git .

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2.2 Build Frontend

You'll need to build the frontend TWICE with different configurations:

#### Build Public Website
```bash
cd /var/www/royaldansity/client

# Create production environment for public website
cat > .env.production << 'EOF'
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_APP_NAME="Your Company Name"
EOF

# Build
npm run build

# Move to separate directory
sudo mkdir -p /var/www/royaldansity/public-website
sudo cp -r dist/* /var/www/royaldansity/public-website/
```

#### Build Admin Dashboard
```bash
cd /var/www/royaldansity/client

# Update environment for admin dashboard
cat > .env.production << 'EOF'
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_APP_NAME="Royal Dansity Admin"
EOF

# Build again
rm -rf dist
npm run build

# Move to separate directory
sudo mkdir -p /var/www/royaldansity/admin-dashboard
sudo cp -r dist/* /var/www/royaldansity/admin-dashboard/
```

### 2.3 Configure Backend Environment

```bash
cd /var/www/royaldansity/backend
nano .env
```

**Paste (adjust values):**
```env
NODE_ENV=production
PORT=5001

# MongoDB
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/royaldansity

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=YOUR_GENERATED_SECRET
JWT_REFRESH_SECRET=YOUR_GENERATED_REFRESH_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Allow both admin subdomain and main domain
CORS_ORIGIN=https://admin.yourdomain.com,https://yourdomain.com,https://www.yourdomain.com

# Frontend URLs
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Email (use your provider)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your Company Name

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/www/royaldansity/uploads

# Logging
LOG_LEVEL=error
LOG_FILE=/var/www/royaldansity/logs/app.log

# Security
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
```

### 2.4 Seed Database & Start Backend

```bash
# Seed database
cd /var/www/royaldansity/backend
npm run seed

# Build TypeScript
npm run build

# Start with PM2
pm2 start npm --name "royaldansity-api" -- start
pm2 save
pm2 startup  # Run the command it outputs
```

---

## 🌐 **Step 3: Nginx Configuration**

### 3.1 Install Your Wildcard SSL Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Upload your certificate files (use SCP or SFTP)
# You should have:
# - certificate.crt (or .pem)
# - private.key
# - ca_bundle.crt (optional, certificate chain)

# Example upload from your local machine:
# scp certificate.crt username@server:/etc/nginx/ssl/
# scp private.key username@server:/etc/nginx/ssl/
# scp ca_bundle.crt username@server:/etc/nginx/ssl/

# Set proper permissions
sudo chmod 600 /etc/nginx/ssl/private.key
sudo chmod 644 /etc/nginx/ssl/certificate.crt
```

### 3.2 Create Nginx Configuration Files

#### 3.2.1 API Backend (`/etc/nginx/sites-available/api.royaldansity`)

```bash
sudo nano /etc/nginx/sites-available/api.royaldansity
```

**Paste this:**
```nginx
# API Backend - api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration (Wildcard Certificate)
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    # If you have a CA bundle:
    # ssl_trusted_certificate /etc/nginx/ssl/ca_bundle.crt;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # CORS Headers (if needed for public API endpoints)
    add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
    add_header Access-Control-Allow-Origin "https://www.yourdomain.com" always;
    add_header Access-Control-Allow-Origin "https://admin.yourdomain.com" always;

    # Client body size limit
    client_max_body_size 10M;

    # Proxy to Express Backend
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

    # Socket.IO Support
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded Files
    location /uploads/ {
        alias /var/www/royaldansity/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/api.royaldansity_access.log;
    error_log /var/log/nginx/api.royaldansity_error.log;
}
```

#### 3.2.2 Admin Dashboard (`/etc/nginx/sites-available/admin.royaldansity`)

```bash
sudo nano /etc/nginx/sites-available/admin.royaldansity
```

**Paste this:**
```nginx
# Admin Dashboard - admin.yourdomain.com
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    # SSL Configuration (Wildcard Certificate)
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    # If you have a CA bundle:
    # ssl_trusted_certificate /etc/nginx/ssl/ca_bundle.crt;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory (Admin Dashboard build)
    root /var/www/royaldansity/admin-dashboard;
    index index.html;

    # Client body size limit
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # React Router - SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/admin.royaldansity_access.log;
    error_log /var/log/nginx/admin.royaldansity_error.log;
}
```

#### 3.2.3 Public Website (`/etc/nginx/sites-available/public.royaldansity`)

```bash
sudo nano /etc/nginx/sites-available/public.royaldansity
```

**Paste this:**
```nginx
# Public Website - yourdomain.com
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Wildcard Certificate)
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    # If you have a CA bundle:
    # ssl_trusted_certificate /etc/nginx/ssl/ca_bundle.crt;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory (Public Website build)
    root /var/www/royaldansity/public-website;
    index index.html;

    # Client body size limit
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # React Router - SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/public.royaldansity_access.log;
    error_log /var/log/nginx/public.royaldansity_error.log;
}
```

### 3.3 Enable Sites

```bash
# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable your sites
sudo ln -s /etc/nginx/sites-available/api.royaldansity /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/admin.royaldansity /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/public.royaldansity /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## 🔄 **Step 4: Update Backend CORS Configuration**

Your backend needs to allow requests from multiple origins:

```bash
cd /var/www/royaldansity/backend/src
nano config/cors.ts  # Or wherever your CORS config is
```

**Update to:**
```typescript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
  'https://admin.yourdomain.com',
  // For development
  'http://localhost:5173',
  'http://localhost:3000'
];

export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
```

**Or in your main `index.ts`:**
```typescript
app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://admin.yourdomain.com'
  ],
  credentials: true
}));
```

---

## 📊 **Step 5: Update Frontend Environment References**

Since you're building with subdomain API URL, update any hardcoded references:

### Client-side API Configuration

Your `client/lib/api.ts` should already use:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

This is perfect! When built with:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

All API calls will go to your API subdomain! ✅

---

## 🧪 **Step 6: Testing**

### 6.1 Test API Backend
```bash
curl https://api.yourdomain.com/api/ping
# Should return: {"message":"pong"}
```

### 6.2 Test Admin Dashboard
Visit: `https://admin.yourdomain.com`
- Should load admin login page
- Login with: `admin@yourdomain.com` / Your password

### 6.3 Test Public Website
Visit: `https://yourdomain.com`
- Should load your investment company homepage
- Check all pages (About, Services, News, Contact)

### 6.4 Test Cross-Origin Requests
- From admin dashboard, try to fetch data (should work)
- From public website, submit contact form (should work)

---

## 🔒 **Step 7: Security Hardening**

### 7.1 Firewall Rules
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### 7.2 Fail2Ban (Optional but recommended)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 7.3 Regular Updates
```bash
# Set up automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🔄 **Step 8: Update Workflow**

### When You Make Changes:

```bash
# On your development machine
git add .
git commit -m "Your changes"
git push origin main

# On your server
cd /var/www/royaldansity
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart royaldansity-api

# Update public website
cd ../client
npm run build
sudo cp -r dist/* /var/www/royaldansity/public-website/

# Update admin dashboard (if changed)
# (rebuild with admin env vars)
sudo cp -r dist/* /var/www/royaldansity/admin-dashboard/
```

---

## 📋 **Summary - Your URLs**

| Service | URL | Purpose |
|---------|-----|---------|
| **Public Website** | https://yourdomain.com | Investment company homepage |
| **WWW Alias** | https://www.yourdomain.com | Same as main |
| **Admin Dashboard** | https://admin.yourdomain.com | Admin panel |
| **API Backend** | https://api.yourdomain.com | REST API |
| **API Docs** | https://api.yourdomain.com/api-docs | Swagger (if enabled) |

---

## 🎉 **Benefits of This Setup**

✅ **Clean Architecture** - Separation of concerns  
✅ **Professional** - Industry-standard subdomain structure  
✅ **Scalable** - Can move API to different server later  
✅ **Secure** - Isolated components  
✅ **SEO-Friendly** - Main domain for public content  
✅ **One SSL** - Wildcard certificate covers all  

---

## 🚨 **Troubleshooting**

### Problem: "SSL Certificate Error"
- Check certificate paths in Nginx config
- Verify wildcard cert includes `*.yourdomain.com`
- Run: `sudo nginx -t` to check for errors

### Problem: "CORS Error"
- Update backend CORS origins
- Check browser console for exact error
- Verify `CORS_ORIGIN` in backend `.env`

### Problem: "502 Bad Gateway"
- Check if backend is running: `pm2 list`
- Check backend logs: `pm2 logs royaldansity-api`
- Verify port 5001 is open: `sudo netstat -tulpn | grep 5001`

### Problem: "Admin Dashboard Shows Wrong Data"
- Clear browser cache
- Check API URL in browser console (Network tab)
- Verify `.env.production` was used during build

---

## 📞 **Need Help?**

Check logs:
```bash
# Nginx logs
sudo tail -f /var/log/nginx/api.royaldansity_error.log
sudo tail -f /var/log/nginx/admin.royaldansity_error.log
sudo tail -f /var/log/nginx/public.royaldansity_error.log

# Backend logs
pm2 logs royaldansity-api

# Application logs
tail -f /var/www/royaldansity/logs/app.log
```

---

**You're all set with a professional subdomain architecture!** 🚀🎉

