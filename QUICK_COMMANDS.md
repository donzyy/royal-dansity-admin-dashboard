# Quick Command Reference

> **Copy-paste these commands when you need them!**

---

## 🚀 Git Commands

### First Time Setup
```bash
# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Royal Dansity Admin Dashboard"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/royal-dansity-admin-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Daily Workflow
```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your commit message here"

# Push to GitHub
git push

# Pull latest changes
git pull
```

### Branching (Advanced)
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

---

## 💻 Development Commands

### Start Development Servers
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm run dev
```

### Database
```bash
# Seed database
cd backend
npm run seed

# Seed only permissions
npm run seed:permissions

# Seed only roles
npm run seed:roles
```

### Build for Production
```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Start production backend
npm start
```

---

## 🧪 Testing Commands

```bash
# Run all tests
cd backend
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Type checking
npm run typecheck
```

---

## 📦 Package Management

```bash
# Install dependencies
npm install

# Add new package
npm add package-name

# Add dev dependency
npm add -D package-name

# Remove package
npm remove package-name

# Update all packages
npm update
```

---

## 🗄️ MongoDB Commands

### Local MongoDB
```bash
# Start MongoDB
mongod

# Stop MongoDB
# Press Ctrl+C in the terminal running mongod

# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use database
use royal-dansity

# Show collections
show collections

# Find all users
db.users.find()

# Drop database (CAREFUL!)
db.dropDatabase()
```

### MongoDB Atlas (Cloud)
- Use MongoDB Compass GUI
- Or connection string in your app

---

## 🐛 Debugging Commands

### Check Logs
```bash
# Backend logs
cd backend
tail -f logs/all.log

# Only errors
tail -f logs/error.log

# Last 50 lines
tail -n 50 logs/all.log
```

### Check Ports
```bash
# Windows
netstat -ano | findstr :5001
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5001
lsof -i :5173

# Kill process (Linux/Mac)
kill -9 <PID>
```

---

## 🔧 Troubleshooting

### Clear Node Modules
```bash
# Delete node_modules and reinstall
rm -rf node_modules
rm -rf backend/node_modules
pnpm install
cd backend && npm install
```

### Clear Build Cache
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear TypeScript cache
rm -rf backend/dist
rm -rf dist
```

### Reset Git (CAREFUL!)
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Discard all local changes
git reset --hard origin/main
```

---

## 🌐 Deployment Commands

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

---

## 📊 Useful Checks

### Check Versions
```bash
node --version
npm --version
pnpm --version
git --version
mongod --version
```

### Check Running Processes
```bash
# Windows
tasklist | findstr node

# Linux/Mac
ps aux | grep node
```

### Check Disk Space
```bash
# Windows
dir

# Linux/Mac
du -sh *
```

---

## 🎯 Quick Fixes

### Port Already in Use
```bash
# Windows - Kill process on port 5001
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Linux/Mac - Kill process on port 5001
lsof -i :5001
kill -9 <PID>
```

### Permission Denied
```bash
# Windows - Run as Administrator
# Right-click terminal → Run as Administrator

# Linux/Mac - Use sudo
sudo <command>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📝 Git Commit Message Templates

### Good Commit Messages
```bash
# Feature
git commit -m "feat: Add user profile avatar upload"

# Bug fix
git commit -m "fix: Resolve profile picture sync issue"

# Documentation
git commit -m "docs: Update README with deployment guide"

# Refactor
git commit -m "refactor: Simplify authentication logic"

# Style
git commit -m "style: Format code with prettier"

# Test
git commit -m "test: Add unit tests for auth controller"
```

---

## 🆘 Emergency Commands

### Rollback to Previous Commit
```bash
# Find commit hash
git log

# Rollback (replace <hash>)
git reset --hard <hash>

# Force push (CAREFUL!)
git push -f origin main
```

### Recover Deleted Files
```bash
# Restore single file
git checkout HEAD -- <file>

# Restore all files
git checkout HEAD -- .
```

---

**Save this file for quick reference!** 📌


