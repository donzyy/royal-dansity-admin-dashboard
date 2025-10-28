# 🗑️ File Upload & Cleanup System

## 📋 Overview

The system now automatically manages uploaded images:
1. **Organized folders** - Images go to their correct directories
2. **Auto-deletion** - Images are deleted when records are deleted
3. **Cleanup script** - Finds and removes orphaned files

---

## 📁 Upload Directories

```
uploads/
├── articles/    # News/blog article images
├── carousel/    # Homepage slider images
├── users/       # User avatars
└── misc/        # Everything else (fallback)
```

---

## ✅ How It Works

### 1. **Upload Type Routing** (Already Configured)

When uploading an image, the frontend sends `uploadType`:

```typescript
// Example: Article image upload
const formData = new FormData();
formData.append('image', file);
formData.append('uploadType', 'article'); // ← Tells backend where to save

await axios.post('/api/upload/image', formData);
```

**Supported Types:**
- `article` → `/uploads/articles/`
- `carousel` → `/uploads/carousel/`
- `user` → `/uploads/users/`
- _(default)_ → `/uploads/misc/`

---

### 2. **Automatic Image Deletion** (NEW! ✨)

When you delete a record, its images are automatically deleted:

#### Articles:
```typescript
// Delete article → deletes image + additionalImages
await Article.findByIdAndDelete(articleId);
// ✅ Main image deleted
// ✅ All additional images deleted
```

#### Carousel Slides:
```typescript
// Delete slide → deletes slide image
await CarouselSlide.findByIdAndDelete(slideId);
// ✅ Image deleted
```

#### Users:
```typescript
// Delete user → deletes avatar
await User.findByIdAndDelete(userId);
// ✅ Avatar deleted
```

---

### 3. **Cleanup Orphaned Files** (NEW! 🧹)

Over time, orphaned files might accumulate (e.g., if someone uploads an image but doesn't save the article). Use the cleanup script to find and remove them:

#### Run on Server:

```powershell
cd C:\Users\Administrator\Desktop\royaldansityinvestments\royal-dansity-admin-dashboard\backend

# Run the cleanup script
npm run cleanup
```

#### What It Does:

1. **Scans database** for all image references (articles, carousel, users)
2. **Scans filesystem** for all uploaded files
3. **Finds orphaned files** (files not referenced in DB)
4. **Asks for confirmation** before deleting
5. **Deletes** orphaned files (if you confirm)

#### Example Output:

```
🧹 Starting orphaned files cleanup...

📰 Checking articles...
   Found 15 article images
🎠 Checking carousel slides...
   Found 5 carousel images
👤 Checking user avatars...
   Found 3 user avatars

📊 Total images in database: 23

🔍 Scanning filesystem for orphaned files...

⚠️  Found 4 orphaned files:

   1. uploads/misc/oldimage-123456789.jpg
   2. uploads/articles/deleted-article-987654321.jpg
   3. uploads/carousel/old-slide-456789123.jpg
   4. uploads/misc/test-upload-111222333.jpg

❓ Do you want to delete these files? (yes/no)
   Type "yes" to proceed with deletion...

yes

🗑️  Deleting orphaned files...

✅ Cleanup complete! Deleted 4 files.
```

---

## 🛠️ Technical Details

### File Cleanup Utility

All image deletion logic is centralized in `backend/src/utils/fileCleanup.ts`:

```typescript
import { deleteFile, deleteFiles } from '../utils/fileCleanup';

// Delete a single file
deleteFile('/uploads/articles/image.jpg');

// Delete multiple files
deleteFiles([
  '/uploads/articles/img1.jpg',
  '/uploads/articles/img2.jpg'
]);
```

**Features:**
- ✅ Handles both absolute and relative paths
- ✅ Gracefully handles missing files
- ✅ Logs all deletions
- ✅ Returns success/failure status

---

## 📋 Best Practices

### 1. **Always Specify Upload Type**

When creating upload forms, always include `uploadType`:

```typescript
const formData = new FormData();
formData.append('image', file);
formData.append('uploadType', 'article'); // ← Don't forget this!
```

### 2. **Run Cleanup Periodically**

Recommended schedule:
- **Weekly** for active sites
- **Monthly** for low-traffic sites
- **After major content changes**

### 3. **Backup Before Cleanup**

Before running cleanup on production:

```powershell
# Backup uploads folder
Copy-Item -Recurse uploads uploads-backup-2025-10-28
```

---

## 🔧 Troubleshooting

### Problem: Images Still in `/misc` Folder

**Cause:** Frontend not sending `uploadType`

**Fix:** Check the upload form and add:
```typescript
uploadFormData.append('uploadType', 'article');
```

---

### Problem: Cleanup Script Shows No Files

**Possible Reasons:**
1. ✅ No orphaned files (good!)
2. ❌ Database connection failed
3. ❌ Files are stored outside `/uploads/` directory

**Check:**
```powershell
# Check if files exist
dir backend\uploads\articles
dir backend\uploads\misc

# Check database connection
npm run seed  # If this works, connection is fine
```

---

### Problem: Image Not Deleted When Record Deleted

**Possible Reasons:**
1. Image path in DB doesn't match filesystem
2. File permissions issue
3. Server restart needed

**Check Backend Logs:**
```powershell
# Check PM2 logs
pm2 logs royaldansity-api --lines 50

# Look for deletion messages:
# ✅ Deleted file: uploads/articles/image.jpg
# ⚠️ File not found: uploads/articles/image.jpg
```

---

## 🚀 On Your Server

To activate these features:

```powershell
# 1. Pull latest code
cd C:\Users\Administrator\Desktop\royaldansityinvestments\royal-dansity-admin-dashboard
git pull origin main

# 2. Rebuild backend
cd backend
npm run build

# 3. Restart PM2
pm2 restart royaldansity-api

# 4. (Optional) Run cleanup
npm run cleanup
```

---

## 📊 Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Upload Type Routing | ✅ Already working | Images go to correct folders |
| Auto-delete (Articles) | ✅ NEW | Deletes image + additionalImages |
| Auto-delete (Carousel) | ✅ NEW | Deletes slide image |
| Auto-delete (Users) | ✅ NEW | Deletes avatar |
| Cleanup Script | ✅ NEW | Run with `npm run cleanup` |

---

## 🎯 Your Question Answered

> **"Does the current API delete images when records are deleted?"**

**Before:** ❌ NO - Images stayed forever, wasting storage

**Now:** ✅ YES - Images are automatically deleted when:
- Articles are deleted
- Carousel slides are deleted
- Users are deleted

**Plus:** 🧹 You can run `npm run cleanup` to remove orphaned files from old operations!

---

**No more storage bloat!** 🎉

