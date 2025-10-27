import Permission from '../models/Permission';
import connectDB from '../config/database';

const permissions = [
  // Dashboard
  { name: 'View Dashboard', slug: 'view_dashboard', description: 'Access to admin dashboard', category: 'dashboard' },
  { name: 'View Analytics', slug: 'view_analytics', description: 'View analytics page', category: 'analytics' },
  
  // Users
  { name: 'View Users', slug: 'view_users', description: 'View users list', category: 'users' },
  { name: 'Create Users', slug: 'create_users', description: 'Create new users', category: 'users' },
  { name: 'Edit Users', slug: 'edit_users', description: 'Edit existing users', category: 'users' },
  { name: 'Delete Users', slug: 'delete_users', description: 'Delete users', category: 'users' },
  { name: 'Manage Roles', slug: 'manage_roles', description: 'Assign roles to users', category: 'users' },
  
  // Content
  { name: 'View Articles', slug: 'view_articles', description: 'View articles list', category: 'content' },
  { name: 'Create Articles', slug: 'create_articles', description: 'Create new articles', category: 'content' },
  { name: 'Edit Articles', slug: 'edit_articles', description: 'Edit existing articles', category: 'content' },
  { name: 'Delete Articles', slug: 'delete_articles', description: 'Delete articles', category: 'content' },
  { name: 'Publish Articles', slug: 'publish_articles', description: 'Publish/unpublish articles', category: 'content' },
  { name: 'Manage Categories', slug: 'manage_categories', description: 'Create/edit/delete categories', category: 'content' },
  { name: 'Manage Carousel', slug: 'manage_carousel', description: 'Manage carousel slides', category: 'content' },
  
  // Messages
  { name: 'View Messages', slug: 'view_messages', description: 'View messages', category: 'content' },
  { name: 'Reply Messages', slug: 'reply_messages', description: 'Reply to messages', category: 'content' },
  { name: 'Delete Messages', slug: 'delete_messages', description: 'Delete messages', category: 'content' },
  
  // Analytics
  { name: 'Export Reports', slug: 'export_reports', description: 'Export analytics reports', category: 'analytics' },
  
  // Settings
  { name: 'Manage Settings', slug: 'manage_settings', description: 'Manage system settings', category: 'settings' },
  { name: 'View Activity Log', slug: 'view_activity_log', description: 'View activity logs', category: 'settings' },
];

async function seedPermissions() {
  try {
    await connectDB();
    
    console.log('🌱 Seeding permissions...');
    
    // Clear existing permissions
    await Permission.deleteMany({});
    console.log('✅ Cleared existing permissions');
    
    // Insert new permissions
    await Permission.insertMany(permissions);
    console.log(`✅ Inserted ${permissions.length} permissions`);
    
    console.log('🎉 Permissions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    process.exit(1);
  }
}

seedPermissions();

