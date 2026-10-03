import { NextResponse } from 'next/server';
import { connectDB } from '../../../src/lib/db.js';
import Category from '../../../src/models/Category.js';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({});
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
    return NextResponse.json({ message: 'Greška pri kreiranju kategorije' }, { status: 500 });
  }
}