import { NextResponse } from 'next/server';
import { connectDB } from '../../../src/lib/db.js';
import Product from '../../../src/models/Product.js';
import '../../../src/models/Category.js';

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
    const body = await request.json();
    await connectDB();
    const newProduct = await Product.create(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('API Products POST Error:', error);
    return NextResponse.json({ message: 'Greška pri kreiranju proizvoda' }, { status: 500 });
  }
}