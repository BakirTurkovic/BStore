import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../src/lib/db.js';
import { hashPasswordResetToken } from '../../../../src/lib/passwordReset.js';
import User from '../../../../src/models/User.js';

export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Zahtjev nije ispravan.' }, { status: 400 });
  }

  const token = typeof body?.token === 'string' ? body.token : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!/^[a-f\d]{64}$/i.test(token)) {
    return NextResponse.json({ message: 'Link za promjenu lozinke nije ispravan ili je istekao.' }, { status: 400 });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return NextResponse.json(
      { message: 'Lozinka mora imati najmanje 8 znakova i najviše 72 UTF-8 bajta.' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const tokenHash = hashPasswordResetToken(token);
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return NextResponse.json(
        { message: 'Link za promjenu lozinke nije ispravan ili je istekao.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await User.updateOne(
      {
        _id: user._id,
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      },
      {
        $set: { password: hashedPassword },
        $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 },
      }
    );

    if (result.modifiedCount !== 1) {
      return NextResponse.json(
        { message: 'Link za promjenu lozinke nije ispravan ili je istekao.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Lozinka je uspješno promijenjena. Sada se možete prijaviti.' });
  } catch (error) {
    console.error('API Auth Reset Password Error:', error);
    return NextResponse.json(
      { message: 'Trenutno nije moguće promijeniti lozinku. Pokušajte ponovo kasnije.' },
      { status: 500 }
    );
  }
}
