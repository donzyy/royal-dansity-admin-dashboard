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

async function cleanupOrphanedFiles() {
  try {
    console.log('\n🧹 Starting orphaned files cleanup...\n');
    
    // Connect to database
    await connectDB();
    
    // Collect all image paths currently in use
    const usedPaths: string[] = [];
    
    // 1. Get all article images
    console.log('📰 Checking articles...');
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
    console.log(`   Found ${usedPaths.length} article images`);
    
    // 2. Get all carousel images
    console.log('🎠 Checking carousel slides...');
    const carouselCount = usedPaths.length;
    const slides = await CarouselSlide.find({}, 'image');
    slides.forEach(slide => {
      if (slide.image) {
        const path = extractFilePath(slide.image);
        if (path) usedPaths.push(path);
      }
    });
    console.log(`   Found ${usedPaths.length - carouselCount} carousel images`);
    
    // 3. Get all user avatars
    console.log('👤 Checking user avatars...');
    const userCount = usedPaths.length;
    const users = await User.find({}, 'avatar');
    users.forEach(user => {
      if (user.avatar) {
        const path = extractFilePath(user.avatar);
        if (path) usedPaths.push(path);
      }
    });
    console.log(`   Found ${usedPaths.length - userCount} user avatars`);
    
    console.log(`\n📊 Total images in database: ${usedPaths.length}`);
    
    // 4. Find orphaned files
    console.log('\n🔍 Scanning filesystem for orphaned files...');
    const orphanedFiles = await findOrphanedFiles(usedPaths);
    
    if (orphanedFiles.length === 0) {
      console.log('\n✅ No orphaned files found! Filesystem is clean.\n');
      process.exit(0);
    }
    
    console.log(`\n⚠️  Found ${orphanedFiles.length} orphaned files:\n`);
    orphanedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    // 5. Prompt user for confirmation
    console.log('\n❓ Do you want to delete these files? (yes/no)');
    console.log('   Type "yes" to proceed with deletion...\n');
    
    // Read from stdin
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (text: string) => {
      const answer = text.trim().toLowerCase();
      
      if (answer === 'yes' || answer === 'y') {
        console.log('\n🗑️  Deleting orphaned files...\n');
        const deletedCount = deleteFiles(orphanedFiles);
        console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} files.\n`);
        logger.info(`Cleanup: Deleted ${deletedCount} orphaned files`);
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

// Run the cleanup
cleanupOrphanedFiles();

