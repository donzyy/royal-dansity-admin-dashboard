# 🚀 Server Deployment Guide - Royal Dansity

Complete guide for deploying to your own server with Nginx and your domain.

---

## 📋 Prerequisites

- **Server**: Linux server (Ubuntu 20.04/22.04 recommended)
- **Domain**: Your domain name with DNS access
- **Access**: SSH access to your server
- **Node.js**: v18+ installed
- **MongoDB**: Installed or MongoDB Atlas account
- **Nginx**: Installed

---

## 🎯 Architecture Overview

```
[Domain] → [Nginx] → [Backend :5001] ← [MongoDB]
                   ↓
              [Frontend (Static)]
```

**How it works:**
- Nginx serves your frontend (React build) as static files
- Nginx proxies `/api/*` requests to your Express backend (port 5001)
- Backend connects to MongoDB
- All on same domain - **no CORS issues!**

---

## 📦 Step 1: Prepare Your Server

### 1.1 Connect to Your Server
```bash
ssh your-username@your-server-ip
```

### 1.2 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install Node.js (if not installed)
```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### 1.4 Install Nginx (if not installed)
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 1.5 Install MongoDB (Option A: Local)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod
```

**OR Option B: Use MongoDB Atlas** (Recommended for production)
- Create account at https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Use in your `.env` file

### 1.6 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

## 📂 Step 2: Deploy Your Application

### 2.1 Create Application Directory
```bash
sudo mkdir -p /var/www/royaldansity
sudo chown -R $USER:$USER /var/www/royaldansity
cd /var/www/royaldansity
```

### 2.2 Clone Your Repository
```bash
# After pushing to GitHub
git clone https://github.com/yourusername/royal-dansity.git .
```

### 2.3 Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2.4 Build Frontend
```bash
# From client directory
npm run build

# This creates a 'dist' folder with optimized static files
```

---

## 🔧 Step 3: Configure Environment Variables

### 3.1 Backend Environment
```bash
cd /var/www/royaldansity/backend
nano .env
```

**Paste this (adjust values):**
```env
NODE_ENV=production
PORT=5001

# Use MongoDB Atlas or local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/royaldansity

# Generate secure secrets: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-generated-secret
JWT_REFRESH_SECRET=your-generated-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Your domain
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Email (use SendGrid for production)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Royal Dansity

# File uploads
UPLOAD_DIR=/var/www/royaldansity/uploads

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-secure-password

LOG_LEVEL=error
BCRYPT_ROUNDS=12
```

### 3.2 Frontend Environment (for build)
```bash
cd /var/www/royaldansity/client
nano .env.production
```

**Paste this:**
```env
# Use relative paths - Nginx will proxy API requests
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_APP_NAME="Royal Dansity Admin"
```

**Rebuild frontend with production env:**
```bash
npm run build
```

### 3.3 Create Required Directories
```bash
mkdir -p /var/www/royaldansity/uploads/{users,articles,carousel,misc}
mkdir -p /var/www/royaldansity/logs
```

---

## 🗄️ Step 4: Seed Database

```bash
cd /var/www/royaldansity/backend
npm run seed
```

This creates:
- Default permissions
- Default roles (Admin, Editor, Viewer)
- Default admin user: admin@royaldansity.com / Admin@123

**⚠️ Change the admin password immediately after first login!**

---

## 🚦 Step 5: Start Backend with PM2

### 5.1 Start Application
```bash
cd /var/www/royaldansity/backend
pm2 start npm --name "royaldansity-api" -- start

# OR if using development mode (not recommended)
# pm2 start npm --name "royaldansity-api" -- run dev
```

### 5.2 Configure PM2 Startup
```bash
# Save PM2 process list
pm2 save

# Generate startup script
pm2 startup

# Run the command it outputs (starts with sudo)
```

### 5.3 Useful PM2 Commands
```bash
pm2 list                 # List all processes
pm2 logs royaldansity-api # View logs
pm2 restart royaldansity-api # Restart app
pm2 stop royaldansity-api    # Stop app
pm2 delete royaldansity-api  # Remove app
pm2 monit                # Monitor in real-time
```

---

## 🌐 Step 6: Configure Nginx

### 6.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/royaldansity
```

**Paste this configuration:**
```nginx
# Royal Dansity - Nginx Configuration
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Root directory (frontend build)
    root /var/www/royaldansity/client/dist;
    index index.html;

    # Client body size limit for file uploads
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # API requests → Backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO (if using WebSockets)
    location /socket.io/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/royaldansity/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API Documentation
    location /api-docs {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend - Single Page Application
    # Try to serve file, if not found, serve index.html (for React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/royaldansity_access.log;
    error_log /var/log/nginx/royaldansity_error.log;
}
```

**Replace `yourdomain.com` with your actual domain!**

### 6.2 Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/royaldansity /etc/nginx/sites-enabled/

# Remove default site (if exists)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 7: Configure SSL (HTTPS)

### 7.1 Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 7.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Follow the prompts:**
- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 7.3 Auto-Renewal
```bash
# Certbot auto-renews, but test it:
sudo certbot renew --dry-run
```

SSL certificates will auto-renew every 90 days.

---

## 🎯 Step 8: Point Your Domain

### 8.1 Update DNS Records

Go to your domain registrar's DNS settings and add:

**A Record:**
```
Type: A
Name: @ (or yourdomain.com)
Value: YOUR_SERVER_IP
TTL: 3600
```

**CNAME Record (optional, for www):**
```
Type: CNAME
Name: www
Value: yourdomain.com
TTL: 3600
```

**Wait 5-60 minutes for DNS propagation.**

### 8.2 Verify DNS
```bash
nslookup yourdomain.com
ping yourdomain.com
```

---

## ✅ Step 9: Test Your Deployment

### 9.1 Check Backend
```bash
curl http://localhost:5001/api/ping
```

Should return: `{"message":"pong"}`

### 9.2 Check Frontend
Visit: `https://yourdomain.com`

Should load your React app.

### 9.3 Check API through Nginx
```bash
curl https://yourdomain.com/api/ping
```

Should return: `{"message":"pong"}`

### 9.4 Login Test
- Visit: `https://yourdomain.com/admin/login`
- Login with: `admin@royaldansity.com` / `Admin@123`
- Change password immediately!

---

## 🔄 Step 10: Updating Your Application

### 10.1 Pull Latest Changes
```bash
cd /var/www/royaldansity
git pull origin main
```

### 10.2 Update Backend
```bash
cd backend
npm install
pm2 restart royaldansity-api
```

### 10.3 Update Frontend
```bash
cd ../client
npm install
npm run build
# No restart needed - Nginx serves static files
```

---

## 🛡️ Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable SSL/HTTPS
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Set up firewall (UFW)
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Use strong passwords everywhere
- [ ] Set up MongoDB authentication
- [ ] Configure backup strategy
- [ ] Set up monitoring (optional: Uptime Robot, New Relic)

### Configure Firewall (UFW)
```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

---

## 🚨 Troubleshooting

### Backend Not Starting
```bash
pm2 logs royaldansity-api
```

### Nginx Errors
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check If Backend Is Running
```bash
pm2 list
curl http://localhost:5001/api/ping
```

### Rebuild Frontend
```bash
cd /var/www/royaldansity/client
rm -rf dist
npm run build
```

### Permission Issues
```bash
sudo chown -R $USER:$USER /var/www/royaldansity
sudo chmod -R 755 /var/www/royaldansity
```

---

## 📊 Monitoring & Logs

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/royaldansity_access.log
sudo tail -f /var/log/nginx/royaldansity_error.log
```

### Application Logs
```bash
tail -f /var/www/royaldansity/logs/app.log
```

---

## 🎉 You're Live!

Your application is now running at:
- **Website**: https://yourdomain.com
- **Admin Panel**: https://yourdomain.com/admin
- **API Docs**: https://yourdomain.com/api-docs

---

## 📞 Need Help?

Common issues and solutions are in the Troubleshooting section above.

**Remember:**
- Keep your system updated
- Monitor logs regularly
- Back up your database
- Change default credentials
- Test updates in development first

**Happy deploying!** 🚀

