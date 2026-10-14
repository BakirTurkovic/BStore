import { NextResponse } from 'next/server';
import {
  clearSessionCookie,
  getSessionUser,
  SESSION_COOKIE,
} from '../../../../src/lib/auth.js';

export async function GET(request) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    return NextResponse.json({ user: getSessionUser(token) });
  } catch (error) {
    console.error('API Auth Session Error:', error);
    return NextResponse.json({ message: 'Unable to verify your session.' }, { status: 500 });
  }
}

export async function DELETE() {
  return clearSessionCookie(NextResponse.json({ message: 'Signed out.' }));
}
