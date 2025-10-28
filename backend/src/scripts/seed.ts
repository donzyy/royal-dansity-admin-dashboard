import connectDB from '../config/database';
import { logger } from '../utils/logger';
import Permission from '../models/Permission';
import Role from '../models/Role';
import User from '../models/User';
import bcrypt from 'bcryptjs';

/**
 * Consolidated Database Seeding Script
 * Seeds permissions, roles, and default admin user
 */

// Permissions data
const permissions = [
  // Dashboard
  { name: 'View Dashboard', slug: 'view_dashboard', category: 'Dashboard', description: 'Access to main dashboard' },
  
  // Analytics
  { name: 'View Analytics', slug: 'view_analytics', category: 'Analytics', description: 'View analytics and reports' },
  { name: 'Export Reports', slug: 'export_reports', category: 'Analytics', description: 'Export analytics reports' },
  
  // Users
  { name: 'View Users', slug: 'view_users', category: 'Users', description: 'View user list' },
  { name: 'Create Users', slug: 'create_users', category: 'Users', description: 'Create new users' },
  { name: 'Edit Users', slug: 'edit_users', category: 'Users', description: 'Edit user details' },
  { name: 'Delete Users', slug: 'delete_users', category: 'Users', description: 'Delete users' },
  
  // Roles
  { name: 'View Roles', slug: 'view_roles', category: 'Roles', description: 'View roles list' },
  { name: 'Manage Roles', slug: 'manage_roles', category: 'Roles', description: 'Create, edit, and delete roles' },
  
  // Articles
  { name: 'View Articles', slug: 'view_articles', category: 'Articles', description: 'View articles list' },
  { name: 'Create Articles', slug: 'create_articles', category: 'Articles', description: 'Create new articles' },
  { name: 'Edit Articles', slug: 'edit_articles', category: 'Articles', description: 'Edit articles' },
  { name: 'Delete Articles', slug: 'delete_articles', category: 'Articles', description: 'Delete articles' },
  { name: 'Publish Articles', slug: 'publish_articles', category: 'Articles', description: 'Publish/unpublish articles' },
  
  // Categories
  { name: 'View Categories', slug: 'view_categories', category: 'Categories', description: 'View categories' },
  { name: 'Manage Categories', slug: 'manage_categories', category: 'Categories', description: 'Create, edit, delete categories' },
  
  // Carousel
  { name: 'View Carousel', slug: 'view_carousel', category: 'Carousel', description: 'View carousel slides' },
  { name: 'Manage Carousel', slug: 'manage_carousel', category: 'Carousel', description: 'Manage carousel slides' },
  
  // Messages
  { name: 'View Messages', slug: 'view_messages', category: 'Messages', description: 'View messages' },
  { name: 'Reply Messages', slug: 'reply_messages', category: 'Messages', description: 'Reply to messages' },
  { name: 'Delete Messages', slug: 'delete_messages', category: 'Messages', description: 'Delete messages' },
  
  // Activity Log
  { name: 'View Activity Log', slug: 'view_activity_log', category: 'Activity', description: 'View system activity log' },
  
  // Settings
  { name: 'Manage Settings', slug: 'manage_settings', category: 'Settings', description: 'Manage system settings' },
];

// Roles data
const roles = [
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: [
      'view_dashboard', 'view_analytics', 'export_reports',
      'view_users', 'create_users', 'edit_users', 'delete_users',
      'view_roles', 'manage_roles',
      'view_articles', 'create_articles', 'edit_articles', 'delete_articles', 'publish_articles',
      'view_categories', 'manage_categories',
      'view_carousel', 'manage_carousel',
      'view_messages', 'reply_messages', 'delete_messages',
      'view_activity_log',
      'manage_settings'
    ],
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Content management access - can manage articles, carousel, and categories',
    isSystem: true,
    permissions: [
      'view_dashboard',
      'view_articles', 'create_articles', 'edit_articles', 'publish_articles',
      'view_categories', 'manage_categories',
      'view_carousel', 'manage_carousel',
      'view_messages', 'reply_messages'
    ],
  },
  {
    name: 'Viewer',
    slug: 'viewer',
    description: 'Read-only access to dashboard and content',
    isSystem: true,
    permissions: [
      'view_dashboard',
      'view_articles',
      'view_messages'
    ],
  },
];

async function seedPermissions() {
  try {
    logger.info('🌱 Seeding permissions...');
    
    await Permission.deleteMany({});
    await Permission.insertMany(permissions);
    
    logger.info(`✅ Seeded ${permissions.length} permissions`);
  } catch (error) {
    logger.error('❌ Error seeding permissions:', error);
    throw error;
  }
}

async function seedRoles() {
  try {
    logger.info('🌱 Seeding roles...');
    
    await Role.deleteMany({});
    await Role.insertMany(roles);
    
    logger.info(`✅ Seeded ${roles.length} roles`);
  } catch (error) {
    logger.error('❌ Error seeding roles:', error);
    throw error;
  }
}

async function seedDefaultAdmin() {
  try {
    logger.info('🌱 Seeding default admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@royaldansity.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Default admin user already exists, skipping...');
      logger.info('ℹ️  Default admin user already exists, skipping...');
      return;
    }
    
    // Create default admin
    // Note: Don't hash here - the User model's pre-save hook will hash it
    await User.create({
      name: 'Admin User',
      email: 'admin@royaldansity.com',
      password: 'Admin@123',  // Plain password - will be hashed by pre-save hook
      role: 'admin',
      status: 'active',
    });
    
    console.log('✅ Created default admin user');
    console.log('📧 Email: admin@royaldansity.com');
    console.log('🔑 Password: Admin@123');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    logger.info('✅ Created default admin user');
    logger.info('📧 Email: admin@royaldansity.com');
    logger.info('🔑 Password: Admin@123');
    logger.info('⚠️  IMPORTANT: Change this password after first login!');
  } catch (error) {
    logger.error('❌ Error seeding default admin:', error);
    throw error;
  }
}

async function seed() {
  try {
    // Connect to database
    await connectDB();
    
    console.log('');
    console.log('🚀 Starting database seeding...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('🚀 Starting database seeding...');
    
    // Seed in order: permissions → roles → admin user
    await seedPermissions();
    await seedRoles();
    await seedDefaultAdmin();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Database seeded successfully!');
    console.log('');
    logger.info('🎉 Database seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Seeding failed:', error);
    console.error('');
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seed();


