import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

/**
 * Upload Middleware
 * Handles file uploads with automatic folder creation
 */

// Ensure upload directories exist
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    // Determine folder based on the uploadType field in the request body
    let folder = 'uploads/misc';

    // Get uploadType from body (sent from frontend)
    const uploadType = (req.body as any).uploadType;

    if (uploadType === 'article') {
      folder = 'uploads/articles';
    } else if (uploadType === 'carousel') {
      folder = 'uploads/carousel';
    } else if (uploadType === 'user') {
      folder = 'uploads/users';
    }

    // Ensure the folder exists
    ensureDirectoryExists(folder);

    cb(null, folder);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with dash
      .toLowerCase();
    
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Export different upload configurations
export const uploadSingle = upload.single('image');
export const uploadAvatar = upload.single('avatar'); // For avatar uploads
export const uploadMultiple = upload.array('images', 10); // Max 10 images
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 },
]);

export default upload;

