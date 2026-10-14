import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { connectDB } from './db.js';
import { CATALOG_CATEGORIES, ensureCatalogCategories } from './catalogCategories.js';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB.');
    await ensureCatalogCategories(Category);

    const [categoryCount, productCount] = await Promise.all([
      Category.countDocuments(),
      Product.countDocuments(),
    ]);

    if (categoryCount > 0 || productCount > 0) {
      console.log('Database already contains catalog data; skipping seed.');
      return;
    }

    const [cat1, cat2] = await Promise.all([
      Category.findOne({ slug: CATALOG_CATEGORIES[0].slug }),
      Category.findOne({ slug: CATALOG_CATEGORIES[1].slug }),
    ]);

    await Product.create([
      {
        name: 'Pamučna Majica',
        description: 'Kvalitetna pamučna majica za svakodnevnu upotrebu.',
        price: 25,
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
        category: cat1._id,
        sizes: ['M', 'L', 'XL'],
      },
      {
        name: 'Zimska Jakna',
        description: 'Topla jakna otporna na vjetar i kišu.',
        price: 120,
        imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500',
        category: cat2._id,
        sizes: ['S', 'M', 'L'],
      },
    ]);

    console.log('Database seeded with sample categories and products.');
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error('Failed to close MongoDB connection:', error);
      process.exitCode = 1;
    }
  }
}

seed();