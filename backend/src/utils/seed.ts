import mongoose from 'mongoose';
import User from '../models/User';
import Article from '../models/Article';
import Message from '../models/Message';
import CarouselSlide from '../models/CarouselSlide';
import Analytics from '../models/Analytics';
import connectDB from '../config/database';
import { logger } from './logger';

/**
 * Database Seeder
 * Populates the database with initial data for development
 */

const seedData = async () => {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await connectDB();

    console.log('Starting database seed...');
    logger.info('Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Message.deleteMany({});
    await CarouselSlide.deleteMany({});
    await Analytics.deleteMany({});

    logger.info('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@royaldansity.com',
      name: 'Admin User',
      password: 'Admin123!',
      role: 'admin',
      status: 'active',
    });

    // Create editor user
    const editorUser = await User.create({
      email: 'editor@royaldansity.com',
      name: 'Editor User',
      password: 'Editor123!',
      role: 'editor',
      status: 'active',
    });

    // Create viewer user
    await User.create({
      email: 'viewer@royaldansity.com',
      name: 'Viewer User',
      password: 'Viewer123!',
      role: 'viewer',
      status: 'active',
    });

    logger.info('Created users');

    // Create articles
    const articles = [
      {
        title: 'Understanding Investment Strategies in 2025',
        excerpt: 'Learn about the most effective investment strategies for the current market.',
        content: '<p>Investment strategies are crucial for long-term financial success...</p>',
        category: 'Investment',
        image: '/placeholder.svg',
        author: adminUser._id,
        authorName: adminUser.name,
        status: 'published',
        readTime: '5 min read',
        tags: ['investment', 'strategy', '2025'],
      },
      {
        title: 'Market Analysis: Global Trends',
        excerpt: 'A comprehensive analysis of global market trends and opportunities.',
        content: '<p>The global market is experiencing significant changes...</p>',
        category: 'Market News',
        image: '/placeholder.svg',
        author: editorUser._id,
        authorName: editorUser.name,
        status: 'published',
        readTime: '7 min read',
        tags: ['market', 'analysis', 'trends'],
      },
      {
        title: 'Company Growth Report Q4 2024',
        excerpt: 'Our quarterly report showcasing company achievements and milestones.',
        content: '<p>This quarter has been remarkable for Royal Dansity Investments...</p>',
        category: 'Company Updates',
        image: '/placeholder.svg',
        author: adminUser._id,
        authorName: adminUser.name,
        status: 'published',
        readTime: '4 min read',
        tags: ['company', 'report', 'growth'],
      },
      {
        title: 'Draft: Upcoming Investment Opportunities',
        excerpt: 'Preview of upcoming investment opportunities we are exploring.',
        content: '<p>We are currently researching several promising opportunities...</p>',
        category: 'Investment',
        image: '/placeholder.svg',
        author: editorUser._id,
        authorName: editorUser.name,
        status: 'draft',
        readTime: '6 min read',
        tags: ['opportunities', 'preview'],
      },
    ];

    await Article.insertMany(articles);
    logger.info('Created articles');

    // Create carousel slides
    const slides = [
      {
        title: 'Welcome to Royal Dansity Investments',
        subtitle: 'Your trusted partner in global investment opportunities',
        description: 'Building wealth through strategic and sustainable investment solutions',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&q=80',
        buttonText: 'Learn More',
        buttonLink: '/about',
        order: 0,
        isActive: true,
      },
      {
        title: 'Invest in Your Future',
        subtitle: 'Discover exclusive investment opportunities tailored for you',
        description: 'Expert guidance for maximizing your financial potential and securing your tomorrow',
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1920&h=1080&fit=crop&q=80',
        buttonText: 'Get Started',
        buttonLink: '/services',
        order: 1,
        isActive: true,
      },
      {
        title: 'Expert Financial Guidance',
        subtitle: 'Professional investment advice from industry leaders',
        description: 'Personalized strategies designed to help you achieve your financial goals',
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1920&h=1080&fit=crop&q=80',
        buttonText: 'Contact Us',
        buttonLink: '/contact',
        order: 2,
        isActive: true,
      },
    ];

    await CarouselSlide.insertMany(slides);
    logger.info('Created carousel slides');

    // Create sample messages
    const messages = [
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        subject: 'Investment Inquiry',
        message: 'I would like to learn more about your investment opportunities.',
        status: 'unread',
        isStarred: true,
        priority: 'high',
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1987654321',
        subject: 'Portfolio Management',
        message: 'Can you provide information about portfolio management services?',
        status: 'read',
        isStarred: false,
        priority: 'medium',
      },
      {
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+1122334455',
        subject: 'General Question',
        message: 'What are your office hours?',
        status: 'resolved',
        isStarred: false,
        priority: 'low',
      },
    ];

    await Message.insertMany(messages);
    logger.info('Created messages');

    // Create analytics data for the past 7 days
    const analyticsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      analyticsData.push({
        date,
        visitors: Math.floor(Math.random() * 500) + 200,
        pageViews: Math.floor(Math.random() * 1500) + 500,
        uniqueVisitors: Math.floor(Math.random() * 400) + 150,
        averageSessionDuration: Math.floor(Math.random() * 300) + 120,
        bounceRate: Math.floor(Math.random() * 40) + 30,
        topPages: [
          { page: '/', views: Math.floor(Math.random() * 200) + 100 },
          { page: '/services', views: Math.floor(Math.random() * 150) + 50 },
          { page: '/about', views: Math.floor(Math.random() * 100) + 30 },
        ],
        referralSources: [
          { source: 'google', count: Math.floor(Math.random() * 100) + 50 },
          { source: 'direct', count: Math.floor(Math.random() * 80) + 40 },
        ],
        deviceTypes: {
          desktop: Math.floor(Math.random() * 300) + 100,
          mobile: Math.floor(Math.random() * 200) + 50,
          tablet: Math.floor(Math.random() * 50) + 10,
        },
      });
    }

    await Analytics.insertMany(analyticsData);
    logger.info('Created analytics data');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Default Users:');
    console.log('👤 Admin - Email: admin@royaldansity.com, Password: Admin123!');
    console.log('👤 Editor - Email: editor@royaldansity.com, Password: Editor123!');
    console.log('👤 Viewer - Email: viewer@royaldansity.com, Password: Viewer123!');
    
    logger.info('Database seeded successfully!');
    logger.info('\nDefault Users:');
    logger.info('Admin - Email: admin@royaldansity.com, Password: Admin123!');
    logger.info('Editor - Email: editor@royaldansity.com, Password: Editor123!');
    logger.info('Viewer - Email: viewer@royaldansity.com, Password: Viewer123!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    logger.error(`Error seeding database: ${error}`);
    process.exit(1);
  }
};

// Run seeder
seedData();

