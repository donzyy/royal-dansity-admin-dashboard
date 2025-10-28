# 🔧 Axios Migration Guide

## ⚠️ Problem
The codebase currently has **18 files** using `axios` directly with inconsistent URL patterns, causing `/api/api/` double path issues in production.

## ✅ Solution
Use the **centralized axios instance** from `client/lib/axios.ts` instead of importing axios directly.

---

## 📝 Migration Pattern

### ❌ OLD WAY (Inconsistent):
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Problem: Manually adding /api everywhere
const response = await axios.get(`${API_URL}/api/articles`);
```

### ✅ NEW WAY (Consistent):
```typescript
import axios from '@/lib/axios';

// Automatically uses baseURL with /api
const response = await axios.get('/articles');
```

---

## 📋 Files That Need Migration

### Admin Dashboard Pages:
- [x] `client/contexts/AuthContext.tsx` - **DONE** (now uses `authAPI`)
- [ ] `client/dashboard/pages/AdminDashboard.tsx`
- [ ] `client/dashboard/pages/AdminNews.tsx`
- [ ] `client/dashboard/pages/AdminNewsEdit.tsx`
- [ ] `client/dashboard/pages/AdminNewsDetail.tsx`
- [ ] `client/dashboard/pages/AdminUsers.tsx`
- [ ] `client/dashboard/pages/AdminMessages.tsx`
- [ ] `client/dashboard/pages/AdminMessageDetail.tsx`
- [ ] `client/dashboard/pages/AdminCarousel.tsx`
- [ ] `client/dashboard/pages/AdminCarouselEdit.tsx`
- [ ] `client/dashboard/pages/AdminCarouselDetail.tsx`
- [ ] `client/dashboard/pages/AdminCategories.tsx`
- [ ] `client/dashboard/pages/AdminCategoryEdit.tsx`
- [ ] `client/dashboard/pages/AdminActivityLog.tsx`

### Website Pages:
- [ ] `client/website/pages/News.tsx`
- [ ] `client/website/pages/ArticleDetail.tsx`
- [ ] `client/website/pages/Contact.tsx`
- [ ] `client/website/components/HeroCarousel.tsx`
- [ ] `client/website/components/NewsSection.tsx`

---

## 🎯 Quick Migration Script

### Example: Migrating AdminDashboard.tsx

**Before:**
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const fetchData = async () => {
  const response = await axios.get(`${API_URL}/api/analytics/dashboard`);
  return response.data;
};
```

**After:**
```typescript
import axios from '@/lib/axios';

// Remove API_URL constant - no longer needed

const fetchData = async () => {
  const response = await axios.get('/analytics/dashboard');
  return response.data;
};
```

---

## 🚀 Benefits

1. **No more double `/api/api/` issues** ✅
2. **Automatic auth token injection** ✅
3. **Centralized error handling** ✅
4. **Automatic 401 redirect to login** ✅
5. **Single `.env` configuration** ✅

---

## ⚙️ Environment Configuration

### `.env.production`
```env
# IMPORTANT: NO /api suffix needed!
VITE_API_URL=https://api.royaldansityinvestments.com.gh
VITE_SOCKET_URL=https://api.royaldansityinvestments.com.gh
VITE_APP_NAME=Royal Dansity Investment International
VITE_APP_VERSION=1.0.0
```

### `.env` (local development)
```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_NAME=Royal Dansity Admin
VITE_APP_VERSION=1.0.0
```

---

## 🔧 How the Centralized Axios Works

```typescript
// client/lib/axios.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,  // /api added HERE, once
  // ...
});
```

Now all calls like `axios.get('/users')` automatically become:
- **Dev**: `http://localhost:5001/api/users`
- **Prod**: `https://api.royaldansityinvestments.com.gh/api/users`

---

## 📌 Priority Migration Order

1. **High Priority** (most used):
   - AdminDashboard.tsx
   - AdminNews.tsx
   - AdminUsers.tsx
   - AdminMessages.tsx

2. **Medium Priority**:
   - All other Admin pages

3. **Low Priority** (public website, less critical):
   - Website pages (News, ArticleDetail, Contact, etc.)

---

## 🧪 Testing After Migration

```powershell
# On server
cd C:\Users\Administrator\Desktop\royaldansityinvestments\royal-dansity-admin-dashboard

# Pull latest
git pull origin main

# Ensure .env.production has NO /api suffix
cat .env.production

# Rebuild
Remove-Item -Recurse -Force dist
npm run build

# Test in browser - should see SINGLE /api in URLs:
# ✅ https://api.royaldansityinvestments.com.gh/api/users
# ❌ https://api.royaldansityinvestments.com.gh/api/api/users
```

---

## 💡 Need Help?

If you see `/api/api/` in browser console, check:
1. Is the file using `import axios from '@/lib/axios'`?
2. Is `.env.production` set correctly (no `/api` suffix)?
3. Did you rebuild after changes?

