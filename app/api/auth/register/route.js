import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Sva polja su obavezna' }, { status: 400 });
    }
    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Korisnik već postoji' }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role: role || 'USER' });
    return NextResponse.json({ message: 'Registracija uspješna', userId: newUser._id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Greška na serveru', error: error.message }, { status: 500 });
  }
}