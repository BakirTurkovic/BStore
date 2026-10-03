import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import Product from '../models/Product.js';
import Category from '../models/Category.js';

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI nije pronađen u .env.local fajlu!');
    }

    await mongoose.connect(uri);
    console.log('Spajanje na Atlas bazu uspješno!');

    await Product.deleteMany({});
    await Category.deleteMany({});

    const cat1 = await Category.create({ name: 'Muška odjeća', slug: 'muska-odjeca' });
    const cat2 = await Category.create({ name: 'Ženska odjeća', slug: 'zenska-odjeca' });

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

    console.log('Baza je uspješno napunjena podacima!');
    process.exit(0);
  } catch (error) {
    console.error('Greška pri popunjavanju baze:', error);
    process.exit(1);
  }
}

seed();