import connectDB from '../config/database';
import { logger } from '../utils/logger';
import Article from '../models/Article';
import CarouselSlide from '../models/CarouselSlide';
import User from '../models/User';
import { findOrphanedFiles, deleteFiles, extractFilePath } from '../utils/fileCleanup';

/**
 * Cleanup Orphaned Files Script
 * Finds and deletes image files that are no longer referenced in the database
 * 
 * Run with: npm run cleanup
 */

export async function cleanupOrphanedFiles() {
  try {
    logger.info('Starting orphaned files cleanup...');
    
    // Connect to database
    await connectDB();
    
    // Collect all image paths currently in use
    const usedPaths: string[] = [];
    
    // 1. Get all article images
    const articles = await Article.find({}, 'image additionalImages');
    articles.forEach(article => {
      if (article.image) {
        const path = extractFilePath(article.image);
        if (path) usedPaths.push(path);
      }
      if (article.additionalImages && article.additionalImages.length > 0) {
        article.additionalImages.forEach(img => {
          const path = extractFilePath(img);
          if (path) usedPaths.push(path);
        });
      }
    });
    
    // 2. Get all carousel images
    const slides = await CarouselSlide.find({}, 'image');
    slides.forEach(slide => {
      if (slide.image) {
        const path = extractFilePath(slide.image);
        if (path) usedPaths.push(path);
      }
    });
    
    // 3. Get all user avatars
    const users = await User.find({}, 'avatar');
    users.forEach(user => {
      if (user.avatar) {
        const path = extractFilePath(user.avatar);
        if (path) usedPaths.push(path);
      }
    });
    
    logger.info(`Total images in database: ${usedPaths.length}`);
    
    // 4. Find orphaned files
    const orphanedFiles = await findOrphanedFiles(usedPaths);
    
    if (orphanedFiles.length === 0) {
      logger.info('No orphaned files found! Filesystem is clean.');
      return { deleted: 0, found: 0 };
    }
    
    logger.info(`Found ${orphanedFiles.length} orphaned files`);
    
    // 5. Delete orphaned files (automatic for cron job)
    const deletedCount = deleteFiles(orphanedFiles);
    logger.info(`Cleanup complete! Deleted ${deletedCount} files.`);
    
    return { deleted: deletedCount, found: orphanedFiles.length };
    
  } catch (error) {
    logger.error('Error during cleanup:', error);
    throw error;
  }
}

async function cleanupOrphanedFilesCLI() {
  try {
    console.log('\n🧹 Starting orphaned files cleanup...\n');
    
    const result = await cleanupOrphanedFiles();
    
    if (result.found === 0) {
      console.log('\n✅ No orphaned files found! Filesystem is clean.\n');
      process.exit(0);
    }
    
    console.log(`\n⚠️  Found ${result.found} orphaned files`);
    console.log('\n❓ Do you want to delete these files? (yes/no)');
    console.log('   Type "yes" to proceed with deletion...\n');
    
    // Read from stdin
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (text: string) => {
      const answer = text.trim().toLowerCase();
      
      if (answer === 'yes' || answer === 'y') {
        console.log('\n🗑️  Deleting orphaned files...\n');
        const deletedCount = result.deleted;
        console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} files.\n`);
        process.exit(0);
      } else {
        console.log('\n❌ Cleanup cancelled. No files were deleted.\n');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    logger.error('Cleanup script error:', error);
    process.exit(1);
  }
}

// Run the cleanup if called directly (CLI mode)
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('cleanupOrphanedFiles')) {
  cleanupOrphanedFilesCLI();
}

