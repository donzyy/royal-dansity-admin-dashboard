import 'dotenv/config';
import connectDB from '../config/database';
import Category from '../models/Category';
import { logger } from './logger';

const defaultCategories = [
  {
    name: 'Investment',
    description: 'Investment opportunities and strategies',
    type: 'article',
    color: '#D4AF37',
    order: 1,
  },
  {
    name: 'Market News',
    description: 'Latest market trends and updates',
    type: 'article',
    color: '#1E40AF',
    order: 2,
  },
  {
    name: 'Company Updates',
    description: 'News and updates about Royal Dansity',
    type: 'article',
    color: '#059669',
    order: 3,
  },
  {
    name: 'Analysis',
    description: 'In-depth market and investment analysis',
    type: 'article',
    color: '#7C3AED',
    order: 4,
  },
  {
    name: 'Tips',
    description: 'Investment tips and best practices',
    type: 'article',
    color: '#DC2626',
    order: 5,
  },
];

const seedCategories = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting category seeding...\n');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('✅ Cleared existing categories');

    // Create default categories
    const categories = await Category.create(defaultCategories);
    console.log(`✅ Created ${categories.length} default categories`);

    console.log('\n📊 Seeded Categories:');
    categories.forEach((cat) => {
      console.log(`   • ${cat.name} (${cat.slug}) - ${cat.type}`);
    });

    console.log('\n✨ Category seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding categories:', error);
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();


