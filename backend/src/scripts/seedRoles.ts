import Role from '../models/Role';
import connectDB from '../config/database';

const roles = [
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Full system access',
    isSystem: true,
    permissions: [
      'view_dashboard', 'view_analytics', 'view_users', 'create_users', 'edit_users', 
      'delete_users', 'manage_roles', 'view_articles', 'create_articles', 'edit_articles', 
      'delete_articles', 'publish_articles', 'manage_categories', 'manage_carousel', 
      'view_messages', 'reply_messages', 'delete_messages', 'export_reports', 
      'manage_settings', 'view_activity_log'
    ],
  },
  {
    name: 'Editor',
    slug: 'editor',
    description: 'Content management access',
    isSystem: true,
    permissions: [
      'view_dashboard', 'view_articles', 'create_articles', 'edit_articles', 
      'publish_articles', 'manage_categories', 'manage_carousel', 'view_messages', 
      'reply_messages'
    ],
  },
  {
    name: 'Viewer',
    slug: 'viewer',
    description: 'Read-only access',
    isSystem: true,
    permissions: [
      'view_dashboard', 'view_articles', 'view_messages'
    ],
  },
];

async function seedRoles() {
  try {
    await connectDB();
    
    console.log('🌱 Seeding roles...');
    
    // Clear existing roles
    await Role.deleteMany({});
    console.log('✅ Cleared existing roles');
    
    // Insert new roles
    await Role.insertMany(roles);
    console.log(`✅ Inserted ${roles.length} roles`);
    
    console.log('🎉 Roles seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    process.exit(1);
  }
}

seedRoles();

