# PM2 Setup Guide

PM2 is a process manager for Node.js applications that keeps your app running in the background and automatically restarts it if it crashes.

## 📦 Installation

```bash
npm install -g pm2
```

## 🚀 Usage

### Start Backend with PM2

```bash
# Start backend using ecosystem.config.js
pm2 start ecosystem.config.js

# Or start directly
pm2 start ./backend/dist/index.js --name royaldansity-api
```

### PM2 Commands

```bash
# List all running processes
pm2 list

# View logs
pm2 logs royaldansity-api
pm2 logs --lines 100  # Last 100 lines

# Stop process
pm2 stop royaldansity-api

# Restart process
pm2 restart royaldansity-api

# Delete process
pm2 delete royaldansity-api

# Monitor processes
pm2 monit

# Save current process list
pm2 save

# Generate startup script (run once)
pm2 startup
# Then run the command it outputs (as admin)
```

### Production Deployment Workflow

```bash
# 1. Build backend
cd backend
npm run build

# 2. Start with PM2
cd ..
pm2 start ecosystem.config.js

# 3. Save process list
pm2 save

# 4. Setup auto-start on boot (Windows)
pm2 startup
# Follow the instructions it prints

# 5. Verify it's running
pm2 list
pm2 logs
```

### Update/Redeploy

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild backend
cd backend
npm install  # if package.json changed
npm run build

# 3. Restart PM2
cd ..
pm2 restart royaldansity-api

# 4. Check logs
pm2 logs royaldansity-api --lines 50
```

### Environment Variables

Environment variables should be set in `backend/.env`. PM2 will automatically use them.

### Monitoring

```bash
# Real-time monitoring
pm2 monit

# Process information
pm2 describe royaldansity-api

# Memory usage
pm2 list --sort memory

# CPU usage
pm2 list --sort cpu
```

### Troubleshooting

**Process won't start:**
```bash
# Check logs
pm2 logs royaldansity-api --err

# Check if port is in use
netstat -ano | findstr :5001
```

**Process crashes:**
```bash
# View error logs
pm2 logs royaldansity-api --err

# Increase memory limit in ecosystem.config.js
# max_memory_restart: '2G'
```

**Can't find PM2 after restart:**
```bash
# Re-run startup command
pm2 startup
pm2 save
```

---

**Next Steps:**
- Configure cron jobs (see backend/src/jobs/scheduler.ts)
- Set up email (see EMAIL_SETUP_GUIDE.md)
- Set up CI/CD pipeline (see .github/workflows/ci-cd.yml)



