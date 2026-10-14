import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../src/lib/db.js';
import { createSessionToken, setSessionCookie } from '../../../../src/lib/auth.js';
import User from '../../../../src/models/User.js';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
    }
    if (name.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Enter a valid name and email address.' }, { status: 400 });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters and no more than 72 UTF-8 bytes.' },
        { status: 400 }
      );
    }

    await connectDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    const token = createSessionToken(newUser);
    await newUser.save();

    const response = NextResponse.json(
      {
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
    return setSessionCookie(response, token);
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    console.error('API Auth Register Error:', error);
    return NextResponse.json({ message: 'Unable to create your account. Please try again.' }, { status: 500 });
  }
}