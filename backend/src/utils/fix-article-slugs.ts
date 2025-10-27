/**
 * Utility script to fix articles that are missing slugs
 * Run this with: npm run fix-slugs (add this to package.json scripts)
 * Or: tsx src/utils/fix-article-slugs.ts
 */

import 'dotenv/config';
import connectDB from '../config/database';
import Article from '../models/Article';
import { logger } from './logger';

const fixArticleSlugs = async () => {
  try {
    console.log('🔧 Connecting to database...');
    await connectDB();

    // Find all articles without slugs
    const articlesWithoutSlugs = await Article.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    });

    console.log(`\n📊 Found ${articlesWithoutSlugs.length} articles without slugs\n`);

    if (articlesWithoutSlugs.length === 0) {
      console.log('✅ All articles already have slugs!');
      process.exit(0);
    }

    // Fix each article
    for (const article of articlesWithoutSlugs) {
      const oldSlug = article.slug;
      
      // Generate slug from title
      const slug = article.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      article.slug = slug;
      await article.save();

      console.log(`✅ Fixed: "${article.title}"`);
      console.log(`   Slug: ${oldSlug || '(none)'} → ${slug}\n`);
      
      logger.info(`Fixed article slug: ${article._id} → ${slug}`);
    }

    console.log(`\n🎉 Successfully fixed ${articlesWithoutSlugs.length} articles!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing article slugs:', error);
    logger.error(`Error fixing article slugs: ${error}`);
    process.exit(1);
  }
};

fixArticleSlugs();


