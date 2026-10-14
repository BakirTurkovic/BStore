import { NextResponse } from 'next/server';
import { connectDB } from '../../../../src/lib/db.js';
import { getSessionUser, SESSION_COOKIE } from '../../../../src/lib/auth.js';
import Product from '../../../../src/models/Product.js';
import Category from '../../../../src/models/Category.js';
import { normalizeProductOptions } from '../../../../src/lib/productOptions.js';
import { PRODUCT_GENDERS } from '../../../../src/lib/productGender.js';

function getAdminUser(request) {
  return getSessionUser(request.cookies.get(SESSION_COOKIE)?.value);
}

function isValidProductId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

function getProductInput(body) {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const description = typeof body?.description === 'string' ? body.description.trim() : '';
  const price = Number(body?.price);
  const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const categoryId = typeof body?.category === 'string' ? body.category : '';
  const gender = typeof body?.gender === 'string' ? body.gender : 'UNISEX';
  const sizes = normalizeProductOptions(body?.sizes, 'Sizes');
  const colors = normalizeProductOptions(body?.colors, 'Colors');

  if (sizes.error || colors.error || !PRODUCT_GENDERS.includes(gender)) {
    return { error: sizes.error || colors.error || 'Select a valid product gender.' };
  }
  if (!name || !description || !imageUrl || !categoryId || !Number.isFinite(price) || price <= 0) {
    return { error: 'Title, description, positive price, category, and image are required.' };
  }
  if (name.length > 160 || description.length > 5000 || !imageUrl.startsWith('https://')) {
    return { error: 'Product details or image URL are invalid.' };
  }
  if (!/^[a-f\d]{24}$/i.test(categoryId)) {
    return { error: 'Select a valid category.' };
  }

  return {
    product: {
      name,
      description,
      price,
      imageUrl,
      category: categoryId,
      gender,
      sizes: sizes.options,
      colors: colors.options,
    },
  };
}

export async function DELETE(request, { params }) {
  try {
    let user;
    try {
      user = getAdminUser(request);
    } catch (error) {
      console.error('API Products DELETE Auth Error:', error);
      return NextResponse.json({ message: 'Authentication is not configured.' }, { status: 503 });
    }

    if (!user) {
      return NextResponse.json({ message: 'Sign in to delete products.' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only administrators can delete products.' }, { status: 403 });
    }

    const { id } = await params;
    if (!isValidProductId(id)) {
      return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('API Products DELETE Error:', error);
    return NextResponse.json({ message: 'Unable to delete the product.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    let user;
    try {
      user = getAdminUser(request);
    } catch (error) {
      console.error('API Products PUT Auth Error:', error);
      return NextResponse.json({ message: 'Authentication is not configured.' }, { status: 503 });
    }

    if (!user) {
      return NextResponse.json({ message: 'Sign in to update products.' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Only administrators can update products.' }, { status: 403 });
    }

    const { id } = await params;
    if (!isValidProductId(id)) {
      return NextResponse.json({ message: 'Invalid product ID.' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const input = getProductInput(body);
    if (input.error) {
      return NextResponse.json({ message: input.error }, { status: 400 });
    }

    await connectDB();
    const categoryExists = await Category.exists({ _id: input.product.category });
    if (!categoryExists) {
      return NextResponse.json({ message: 'The selected category was not found.' }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(id, input.product, {
      new: true,
      runValidators: true,
    }).populate('category');
    if (!product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('API Products PUT Error:', error);
    return NextResponse.json({ message: 'Unable to update the product.' }, { status: 500 });
  }
}
