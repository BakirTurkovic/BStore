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

    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password) {
      return NextResponse.json({ message: 'Enter your email and password.' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Email or password is incorrect.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Email or password is incorrect.' }, { status: 401 });
    }

    const response = NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    });
    return setSessionCookie(response, createSessionToken(user));
  } catch (error) {
    console.error('API Auth Login Error:', error);
    return NextResponse.json({ message: 'Unable to sign in. Please try again.' }, { status: 500 });
  }
}