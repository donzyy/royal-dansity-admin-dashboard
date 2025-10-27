# ✅ Deployment Checklist - Royal Dansity

Quick reference before pushing to GitHub and deploying.

---

## 🎯 **TL;DR - Your Question Answered**

**Q:** Will hardcoded `http://localhost:5001` break when I deploy with Nginx?

**A:** ✅ **NO! Your code already uses environment variables correctly!**

- **Development**: Uses `http://localhost:5001/api` from `.env`
- **Production**: Uses `/api` (relative path) → Nginx proxies to backend
- **Result**: No hardcoded URLs, works perfectly! 🎉

---

## 📋 **Before Pushing to GitHub**

### 1. Create Environment Files

**Create `client/.env`:**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME="Royal Dansity Admin"
```

**Create `client/.env.production`:**
```env
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_APP_NAME="Royal Dansity Admin"
```

**Create `backend/.env`:**
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/royaldansity
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
# ... (see ENVIRONMENT_SETUP.md for full list)
```

### 2. Verify `.gitignore` ✅
Already configured correctly! `.env` files won't be committed.

### 3. Test Locally
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 4. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## 🚀 **On Your Server**

### 1. Initial Setup
```bash
# Connect to server
ssh your-username@your-server-ip

# Navigate to web directory
sudo mkdir -p /var/www/royaldansity
sudo chown -R $USER:$USER /var/www/royaldansity
cd /var/www/royaldansity

# Clone repository
git clone https://github.com/yourusername/royal-dansity.git .
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment

**Create `backend/.env`** (production values):
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/royaldansity
JWT_SECRET=<generate-64-char-string>
JWT_REFRESH_SECRET=<generate-different-64-char-string>
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-key
EMAIL_FROM=noreply@yourdomain.com
UPLOAD_DIR=/var/www/royaldansity/uploads
LOG_FILE=/var/www/royaldansity/logs/app.log
BCRYPT_ROUNDS=12
LOG_LEVEL=error
```

**Generate secure JWT secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Build Frontend
```bash
cd /var/www/royaldansity/client
npm run build
```

This creates `client/dist/` with optimized static files.

### 5. Seed Database
```bash
cd /var/www/royaldansity/backend
npm run seed
```

Creates default roles, permissions, and admin user.

### 6. Start Backend with PM2
```bash
cd /var/www/royaldansity/backend
npm run build  # Compile TypeScript
pm2 start npm --name "royaldansity-api" -- start
pm2 save
pm2 startup  # Run the command it outputs
```

### 7. Configure Nginx

**Create `/etc/nginx/sites-available/royaldansity`:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/royaldansity/client/dist;
    index index.html;

    client_max_body_size 10M;

    # API → Backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/royaldansity/uploads/;
    }

    # Frontend (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/royaldansity /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 8. Point Domain
In your domain registrar's DNS settings:

**A Record:**
- Type: A
- Name: @ (or yourdomain.com)
- Value: YOUR_SERVER_IP
- TTL: 3600

**CNAME Record (optional):**
- Type: CNAME
- Name: www
- Value: yourdomain.com
- TTL: 3600

Wait 5-60 minutes for DNS propagation.

### 9. Add SSL
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow prompts:
- Enter email
- Agree to terms
- Choose: Redirect HTTP to HTTPS (recommended)

### 10. Create Required Directories
```bash
mkdir -p /var/www/royaldansity/uploads/{users,articles,carousel,misc}
mkdir -p /var/www/royaldansity/logs
chmod 755 /var/www/royaldansity/uploads
```

---

## 🧪 **Testing**

### Test Backend
```bash
curl http://localhost:5001/api/ping
# Should return: {"message":"pong"}
```

### Test Frontend
Visit: `https://yourdomain.com`

### Test API through Nginx
```bash
curl https://yourdomain.com/api/ping
# Should return: {"message":"pong"}
```

### Test Login
1. Visit: `https://yourdomain.com/admin/login`
2. Login: `admin@royaldansity.com` / `Admin@123`
3. ⚠️ **Change password immediately!**

---

## 🔄 **Updating Your App**

### On Server:
```bash
cd /var/www/royaldansity
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart royaldansity-api

# Update frontend
cd ../client
npm install
npm run build
# No restart needed - Nginx serves static files
```

---

## 🔧 **Useful Commands**

### PM2
```bash
pm2 list                      # List processes
pm2 logs royaldansity-api     # View logs
pm2 restart royaldansity-api  # Restart
pm2 stop royaldansity-api     # Stop
pm2 monit                     # Real-time monitoring
```

### Nginx
```bash
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload
sudo systemctl restart nginx  # Restart
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Logs
```bash
pm2 logs royaldansity-api
tail -f /var/www/royaldansity/logs/app.log
```

---

## 🛡️ **Security Checklist**

- [ ] Change default admin password
- [ ] Use strong JWT secrets (64+ chars)
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall: `sudo ufw allow 22,80,443/tcp`
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Set up backups
- [ ] Use environment-specific secrets

---

## 📚 **Reference Documents**

1. **`ENVIRONMENT_SETUP.md`** - Detailed environment variable guide
2. **`DEPLOYMENT_SERVER_GUIDE.md`** - Complete step-by-step deployment
3. **`README.md`** - Project overview and features
4. **`DOCUMENTATION.md`** - Technical documentation

---

## 🎉 **You're All Set!**

Your app is production-ready and properly configured for deployment!

**What makes it work:**
1. ✅ Environment variables (no hardcoded URLs)
2. ✅ Nginx as reverse proxy
3. ✅ PM2 keeps backend running
4. ✅ SSL for security
5. ✅ Same domain = No CORS issues

**Now:**
1. 😴 Get some rest
2. 🔄 Push to GitHub tomorrow
3. 🚀 Deploy to your server
4. 🎊 Celebrate!

**See you when you're refreshed!** ✨

