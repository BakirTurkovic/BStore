import { NextResponse } from 'next/server';
import { connectDB } from '../../../src/lib/db.js';
import Category from '../../../src/models/Category.js';
import { CATALOG_CATEGORIES, ensureCatalogCategories } from '../../../src/lib/catalogCategories.js';

export async function GET() {
  try {
    await connectDB();
    await ensureCatalogCategories(Category);
    const categories = await Category.find({});
    const categoryOrder = new Map(CATALOG_CATEGORIES.map(({ slug }, index) => [slug, index]));
    categories.sort(
      (first, second) =>
        (categoryOrder.get(first.slug) ?? Number.MAX_SAFE_INTEGER) -
          (categoryOrder.get(second.slug) ?? Number.MAX_SAFE_INTEGER) ||
        first.name.localeCompare(second.name)
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error('API Categories GET Error:', error);
    return NextResponse.json({ message: 'Greška pri dohvaćanju kategorija' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, slug } = await request.json();
    await connectDB();
    const newCategory = await Category.create({ name, slug });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('API Categories POST Error:', error);
    return NextResponse.json({ message: 'Greška pri kreiranju kategorije' }, { status: 500 });
  }
}