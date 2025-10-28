import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Delete file from filesystem
 * @param filePath - Relative path like '/uploads/articles/image.jpg' or 'uploads/articles/image.jpg'
 */
export const deleteFile = (filePath: string): boolean => {
  try {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    // Construct absolute path
    const absolutePath = path.join(process.cwd(), cleanPath);
    
    // Check if file exists
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      logger.info(`✅ Deleted file: ${cleanPath}`);
      return true;
    } else {
      logger.warn(`⚠️ File not found: ${cleanPath}`);
      return false;
    }
  } catch (error: any) {
    logger.error(`❌ Error deleting file ${filePath}:`, error.message);
    return false;
  }
};

/**
 * Delete multiple files from filesystem
 * @param filePaths - Array of relative paths
 */
export const deleteFiles = (filePaths: string[]): number => {
  let deletedCount = 0;
  
  for (const filePath of filePaths) {
    if (deleteFile(filePath)) {
      deletedCount++;
    }
  }
  
  logger.info(`🗑️  Deleted ${deletedCount}/${filePaths.length} files`);
  return deletedCount;
};

/**
 * Extract file path from URL
 * @param url - Can be full URL or relative path
 * @returns Relative path like 'uploads/articles/image.jpg'
 */
export const extractFilePath = (url: string): string | null => {
  if (!url) return null;
  
  // If it's already a relative path starting with 'uploads/'
  if (url.startsWith('uploads/') || url.startsWith('/uploads/')) {
    return url.startsWith('/') ? url.substring(1) : url;
  }
  
  // If it's a full URL, extract the path
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Extract everything after /uploads/
    const match = pathname.match(/\/uploads\/.+/);
    return match ? match[0].substring(1) : null; // Remove leading slash
  } catch {
    // Not a valid URL, might be a relative path
    return null;
  }
};

/**
 * Find all image files in upload directories
 */
export const getAllUploadedFiles = (): string[] => {
  const uploadDirs = [
    'uploads/articles',
    'uploads/carousel',
    'uploads/users',
    'uploads/misc',
  ];
  
  const allFiles: string[] = [];
  
  for (const dir of uploadDirs) {
    const dirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      // Skip .gitkeep files
      if (file !== '.gitkeep') {
        allFiles.push(path.join(dir, file));
      }
    });
  }
  
  return allFiles;
};

/**
 * Find orphaned files (files that don't exist in database)
 * This will be used by the cleanup script
 */
export const findOrphanedFiles = async (usedPaths: string[]): Promise<string[]> => {
  const allFiles = getAllUploadedFiles();
  
  // Normalize used paths (remove leading slashes, convert to forward slashes)
  const normalizedUsedPaths = usedPaths.map(p => 
    p.replace(/\\/g, '/').replace(/^\//, '')
  );
  
  // Find files that are not in the used paths
  const orphaned = allFiles.filter(file => {
    const normalized = file.replace(/\\/g, '/');
    return !normalizedUsedPaths.includes(normalized);
  });
  
  return orphaned;
};

