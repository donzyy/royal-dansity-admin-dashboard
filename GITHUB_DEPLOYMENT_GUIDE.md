# 🚀 GitHub Deployment Guide - Royal Dansity

Complete guide to push your project to GitHub and deploy from a private repository.

---

## 📦 **Step 1: Create GitHub Repository (Private)**

### 1.1 On GitHub (https://github.com/donzyy)

1. Click the **"+"** icon → **"New repository"**
2. **Repository name**: `royal-dansity` (or your preferred name)
3. **Description**: Royal Dansity - Full Stack Website & Admin Dashboard
4. **Visibility**: ⚠️ **PRIVATE** (Important!)
5. **DO NOT** initialize with README, .gitignore, or license (we have these)
6. Click: **"Create repository"**

---

## 🔧 **Step 2: Prepare Your Local Repository**

### 2.1 Check Current Git Status

Open PowerShell in your project folder:

```powershell
# Check if git is initialized
git status
```

If you see "not a git repository", initialize it:

```powershell
git init
```

### 2.2 Verify .gitignore

Your `.gitignore` already looks good! It prevents sensitive files from being committed:
- ✅ `.env` files
- ✅ `node_modules/`
- ✅ `uploads/` (user content)
- ✅ `logs/`

### 2.3 Create Required .env Files (Don't Commit These!)

Before pushing, create these files locally:

**`client/.env`** (development):
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME="Royal Dansity Admin"
```

**`client/.env.production`** (for production build):
```env
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_APP_NAME="Royal Dansity Admin"
```

**`backend/.env`** (development):
```env
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/royaldansity
JWT_SECRET=your-development-secret
JWT_REFRESH_SECRET=your-development-refresh-secret
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
# ... (see backend/.env.example for full list)
```

⚠️ **These files won't be pushed to GitHub** (they're in `.gitignore`)

---

## 📤 **Step 3: Push to GitHub**

### 3.1 Add Remote Repository

```powershell
# Add your GitHub repository as remote
git remote add origin https://github.com/donzyy/royal-dansity.git

# Verify
git remote -v
```

### 3.2 Stage All Files

```powershell
# Add all files (respects .gitignore)
git add .

# Check what will be committed
git status
```

**Verify these are NOT staged:**
- ❌ `.env` files
- ❌ `node_modules/`
- ❌ `dist/` or `build/` folders
- ❌ User uploads

### 3.3 Commit Changes

```powershell
git commit -m "Initial commit - Royal Dansity full-stack application"
```

### 3.4 Push to GitHub

```powershell
# If using default branch 'main'
git branch -M main
git push -u origin main

# If it asks for credentials, enter:
# Username: donzyy
# Password: (your GitHub password or Personal Access Token)
```

**⚠️ If password fails**, you need a **Personal Access Token** (see Step 4).

---

## 🔑 **Step 4: GitHub Authentication**

### **Option A: Personal Access Token (HTTPS) - Recommended**

GitHub requires tokens instead of passwords for HTTPS.

#### 4.1 Create Token

1. Go to: https://github.com/settings/tokens
2. Click: **"Generate new token"** → **"Generate new token (classic)"**
3. **Note**: `Windows Server Deploy`
4. **Expiration**: `No expiration` or `1 year`
5. **Select scopes**:
   - ✅ `repo` (Full control of private repositories)
6. Click: **"Generate token"**
7. **⚠️ COPY THE TOKEN NOW** (you won't see it again!)

Example token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 4.2 Use Token for Push

```powershell
# If push failed earlier, try again with token
git push -u origin main

# When prompted:
# Username: donzyy
# Password: <paste your token here>
```

#### 4.3 Save Credentials (Optional)

To avoid entering token every time:

```powershell
# Windows - saves credentials securely
git config --global credential.helper wincred

# Or store in Git credential store
git config --global credential.helper store

# Next time you push, it will save your credentials
```

---

### **Option B: SSH Key (More Secure)**

#### 4.1 Generate SSH Key (if you don't have one)

```powershell
# Check if you already have a key
ls ~/.ssh/id_ed25519.pub

# If not, generate one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter for default location
# Enter passphrase (optional but recommended)
```

#### 4.2 Copy Public Key

```powershell
# Windows
type ~\.ssh\id_ed25519.pub | clip

# Or display and copy manually
cat ~/.ssh/id_ed25519.pub
```

#### 4.3 Add to GitHub

1. Go to: https://github.com/settings/keys
2. Click: **"New SSH key"**
3. **Title**: `Windows Development Machine`
4. **Key**: Paste the public key
5. Click: **"Add SSH key"**

#### 4.4 Change Remote to SSH

```powershell
# Change from HTTPS to SSH
git remote set-url origin git@github.com:donzyy/royal-dansity.git

# Push
git push -u origin main
```

---

## 🖥️ **Step 5: Clone on Windows Server (Private Repo)**

### **Method 1: Using Personal Access Token (Easier)**

On your Windows server:

```powershell
# Navigate to deployment directory
cd C:\inetpub\wwwroot\  # Or your preferred location

# Clone with token embedded in URL
git clone https://ghp_YOUR_TOKEN_HERE@github.com/donzyy/royal-dansity.git

# OR clone first, configure later
git clone https://github.com/donzyy/royal-dansity.git
cd royal-dansity

# Configure credential storage
git config credential.helper wincred

# Pull (will prompt for token once, then save)
git pull
# Username: donzyy
# Password: ghp_YOUR_TOKEN_HERE
```

### **Method 2: Using SSH Key (More Secure)**

If your Windows server has SSH configured:

```powershell
# Generate SSH key on server (if not exists)
ssh-keygen -t ed25519 -C "server@yourdomain.com"

# Copy public key
type ~\.ssh\id_ed25519.pub

# Add to GitHub: https://github.com/settings/keys

# Clone with SSH
git clone git@github.com:donzyy/royal-dansity.git
```

---

## 🔄 **Step 6: Update Workflow**

### **On Your Development Machine:**

```powershell
# Make changes to your code
# ...

# Stage and commit
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main
```

### **On Your Windows Server:**

```powershell
# Navigate to project
cd C:\path\to\royal-dansity

# Pull latest changes
git pull origin main

# Restart services (if needed)
# PM2 or your process manager
pm2 restart royaldansity-api

# Rebuild frontend (if needed)
cd client
npm run build
```

---

## 🛡️ **Security Best Practices**

### ✅ **What's Protected:**
- `.env` files (never committed)
- `node_modules/` (installed locally)
- User uploads (not in Git)
- Logs (not in Git)

### ⚠️ **What to Check Before Pushing:**

```powershell
# Always verify before pushing
git status

# Make sure these are NOT listed:
# - .env files
# - node_modules/
# - User-uploaded content
# - API keys or secrets
```

### 🔒 **Repository Settings (On GitHub):**

1. Go to: `https://github.com/donzyy/royal-dansity/settings`
2. **Security**:
   - ✅ Enable "Private vulnerability reporting"
   - ✅ Enable Dependabot alerts
3. **Branches**:
   - Protect `main` branch (optional, but recommended)
   - Require pull request reviews (for team collaboration)

---

## 📝 **Environment Variables on Server**

**IMPORTANT**: After cloning on server, you need to create `.env` files!

### On Windows Server:

**Create `backend\.env`:**
```powershell
cd C:\path\to\royal-dansity\backend
notepad .env
```

Paste (with your production values):
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/royaldansity
JWT_SECRET=<generate-secure-64-char-string>
JWT_REFRESH_SECRET=<generate-different-64-char-string>
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
# ... (see .env.production.example)
```

**Create `client\.env.production`:**
```powershell
cd C:\path\to\royal-dansity\client
notepad .env.production
```

Paste:
```env
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_APP_NAME="Royal Dansity Admin"
```

---

## 🚨 **Troubleshooting**

### **Problem: "Authentication failed"**

**Solution**: Use Personal Access Token instead of password
- Create token: https://github.com/settings/tokens
- Use token as password when prompted

### **Problem: "Repository not found" (for private repo)**

**Solution**: 
- Verify you have access to the repository
- Use the correct token with `repo` scope
- Check repository name is correct

### **Problem: ".env file is in the repository!"**

**Solution**: Remove it immediately!
```powershell
# Remove from Git (keep local file)
git rm --cached backend/.env
git commit -m "Remove .env file from repository"
git push origin main

# Make sure .gitignore includes .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
git push origin main
```

### **Problem: "Can't clone on Windows Server"**

**Solutions**:
1. Check firewall/antivirus isn't blocking Git
2. Use Personal Access Token with HTTPS
3. Verify Git is installed: `git --version`
4. Try cloning with full token URL

---

## 📊 **Repository Structure (What Gets Pushed)**

```
royal-dansity/
├── .gitignore              ✅ Pushed
├── README.md               ✅ Pushed
├── DOCUMENTATION.md        ✅ Pushed
├── package.json            ✅ Pushed
├── client/
│   ├── .env               ❌ NOT pushed (in .gitignore)
│   ├── .env.production    ❌ NOT pushed (in .gitignore)
│   ├── .env.example       ✅ Pushed (example only)
│   ├── src/               ✅ Pushed
│   ├── public/            ✅ Pushed
│   └── node_modules/      ❌ NOT pushed (in .gitignore)
├── backend/
│   ├── .env               ❌ NOT pushed (in .gitignore)
│   ├── .env.example       ✅ Pushed (example only)
│   ├── src/               ✅ Pushed
│   ├── uploads/           ❌ NOT pushed (in .gitignore)
│   ├── logs/              ❌ NOT pushed (in .gitignore)
│   └── node_modules/      ❌ NOT pushed (in .gitignore)
└── shared/                ✅ Pushed
```

---

## ✅ **Deployment Checklist**

### Before Pushing to GitHub:
- [ ] `.gitignore` is configured
- [ ] No `.env` files are staged
- [ ] No sensitive data in code
- [ ] `node_modules/` not staged
- [ ] Repository is set to **PRIVATE**

### After Pushing to GitHub:
- [ ] Repository is private
- [ ] Created Personal Access Token
- [ ] `.env.example` files are pushed (without real secrets)
- [ ] README is up to date

### On Windows Server:
- [ ] Cloned repository with token/SSH
- [ ] Created `.env` files with production values
- [ ] Installed dependencies: `npm install`
- [ ] Built frontend: `npm run build`
- [ ] Seeded database: `npm run seed`
- [ ] Started backend: `pm2 start`

---

## 🎉 **Summary**

**Private Repository**: ✅ YES - Recommended for security  
**Works on Windows Server**: ✅ YES - Use Personal Access Token or SSH  
**GitHub Account**: `donzyy`  
**Repository Name**: `royal-dansity` (or your choice)  

**Authentication**:
- **HTTPS**: Use Personal Access Token
- **SSH**: Add server's public key to GitHub

**Your `.env` files are safe** - they're in `.gitignore` and won't be pushed!

---

## 🚀 **Ready to Push?**

Run these commands in your project folder:

```powershell
# 1. Initialize (if needed)
git init

# 2. Add remote
git remote add origin https://github.com/donzyy/royal-dansity.git

# 3. Stage files
git add .

# 4. Commit
git commit -m "Initial commit - Royal Dansity full-stack application"

# 5. Push
git branch -M main
git push -u origin main
```

**When prompted, use:**
- Username: `donzyy`
- Password: Your Personal Access Token

---

**You're all set! Sleep well, and we'll deploy tomorrow!** 🌙✨

