import cron from 'node-cron';
import { logger } from '../utils/logger';
import { cleanupOrphanedFiles } from '../scripts/cleanupOrphanedFiles';
import connectDB from '../config/database';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scheduled Jobs
 * Handles automated tasks like cleanup, backups, and maintenance
 */

// Clean up orphaned files (runs daily at 2 AM)
cron.schedule('0 2 * * *', async () => {
  logger.info('Running scheduled job: Clean orphaned files');
  
  try {
    // Ensure database is connected
    await connectDB();
    await cleanupOrphanedFiles();
    logger.info('Orphaned files cleanup completed successfully');
  } catch (error: any) {
    logger.error('Error during orphaned files cleanup:', error);
  }
}, {
  scheduled: true,
  timezone: 'Africa/Accra', // Ghana timezone
});

// Clean up old log files (runs daily at 3 AM)
cron.schedule('0 3 * * *', () => {
  logger.info('Running scheduled job: Clean old logs');
  
  try {
    const logsDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logsDir)) {
      logger.warn('Logs directory does not exist');
      return;
    }
    
    const files = fs.readdirSync(logsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      
      try {
        const stats = fs.statSync(filePath);
        
        // Skip directories
        if (stats.isDirectory()) return;
        
        if (stats.mtimeMs < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info(`Deleted old log file: ${file}`);
        }
      } catch (error: any) {
        logger.error(`Error processing log file ${file}:`, error);
      }
    });
    
    logger.info(`Old logs cleanup completed. Deleted ${deletedCount} file(s)`);
  } catch (error: any) {
    logger.error('Error during old logs cleanup:', error);
  }
}, {
  scheduled: true,
  timezone: 'Africa/Accra',
});

// Database maintenance reminder (runs weekly on Sunday at 4 AM)
cron.schedule('0 4 * * 0', () => {
  logger.info('Running scheduled job: Weekly maintenance reminder');
  
  // You can add database optimization, backup checks, etc. here
  // Example: Check database connection health, index optimization, etc.
  
  logger.info('Weekly maintenance check completed');
}, {
  scheduled: true,
  timezone: 'Africa/Accra',
});

logger.info('Cron jobs initialized');

