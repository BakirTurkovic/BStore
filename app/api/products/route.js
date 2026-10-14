import { NextResponse } from 'next/server';
import { connectDB } from '../../../src/lib/db.js';
import Product from '../../../src/models/Product.js';
import Category from '../../../src/models/Category.js';
import { getSessionUser, SESSION_COOKIE } from '../../../src/lib/auth.js';
import { normalizeProductOptions } from '../../../src/lib/productOptions.js';

function getAdminUser(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return getSessionUser(token);
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const filter = category ? { category } : {};
    const products = await Product.find(filter).populate('category');
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('API Products GET Error:', error);
    return NextResponse.json({ message: 'Greška pri dohvaćanju proizvoda' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let user;
    try {
      user = getAdminUser(request);
    } catch (error) {
      console.error('API Products POST Auth Error:', error);
      return NextResponse.json({ message: 'Authentication is not configured.' }, { status: 503 });
    }

    if (!user) {
      return NextResponse.json({ message: 'Sign in to create products.' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only administrators can create products.' }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const price = Number(body?.price);
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
    const categoryId = typeof body?.category === 'string' ? body.category : '';
    const sizes = normalizeProductOptions(body?.sizes, 'Sizes');
    const colors = normalizeProductOptions(body?.colors, 'Colors');

    if (sizes.error || colors.error) {
      return NextResponse.json({ message: sizes.error || colors.error }, { status: 400 });
    }

    if (!name || !description || !imageUrl || !categoryId || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: 'Title, description, positive price, category, and image are required.' },
        { status: 400 }
      );
    }
    if (name.length > 160 || description.length > 5000 || !imageUrl.startsWith('https://')) {
      return NextResponse.json({ message: 'Product details or image URL are invalid.' }, { status: 400 });
    }

    await connectDB();
    if (!/^[a-f\d]{24}$/i.test(categoryId)) {
      return NextResponse.json({ message: 'Select a valid category.' }, { status: 400 });
    }
    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) {
      return NextResponse.json({ message: 'The selected category was not found.' }, { status: 400 });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      imageUrl,
      category: categoryId,
      sizes: sizes.options,
      colors: colors.options,
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('API Products POST Error:', error);
    return NextResponse.json({ message: 'Greška pri kreiranju proizvoda' }, { status: 500 });
  }
}