import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { connectDB } from '../../../../src/lib/db.js';
import {
  createPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from '../../../../src/lib/passwordReset.js';
import User from '../../../../src/models/User.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const GENERIC_RESPONSE = {
  message: 'Ako račun postoji za ovu email adresu, poslat ćemo upute za promjenu lozinke.',
};

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Unesite ispravnu email adresu.' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: 'Unesite ispravnu email adresu.' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (user) {
      const reset = createPasswordResetToken();
      user.resetPasswordToken = reset.tokenHash;
      user.resetPasswordExpires = reset.expiresAt;
      await user.save();

      const appUrl = process.env.APP_URL?.trim() || new URL(request.url).origin;
      const resetUrl = `${appUrl}/reset-password/${reset.token}`;

      // Ispis u konzoli radi brzog debugovanja u razvoju
      if (process.env.NODE_ENV !== 'production') {
        console.info(
          `Password reset link (valid for ${PASSWORD_RESET_TTL_MS / 60000} minutes): ${resetUrl}`
        );
      }

      // Slanje pravog emaila preko Resend-a
      await resend.emails.send({
        from: 'BStore <onboarding@resend.dev>', // Dok ne verifikuješ svoju domenu na Resendu
        to: email,
        subject: 'Resetovanje lozinke - BStore',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #ededed; padding: 40px 20px; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center;">BStore<span style="color: #3b82f6;">.</span></h1>
            <p style="font-size: 16px; line-height: 1.5; color: #a1a1aa; margin-bottom: 20px;">
              Zahtijevali ste resetovanje lozinke za vaš BStore nalog. Kliknite na dugme ispod kako biste postavili novu lozinku:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #ffffff; color: #000000; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; display: inline-block;">
                Resetuj lozinku
              </a>
            </div>
            <p style="font-size: 13px; color: #71717a; margin-top: 30px; text-align: center;">
              Link važi ${PASSWORD_RESET_TTL_MS / 60000} minuta. Ako niste poslali ovaj zahtjev, možete sigurno ignorisati ovaj email.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('API Auth Forgot Password Error:', error);
    return NextResponse.json(
      { message: 'Trenutno nije moguće poslati upute. Pokušajte ponovo kasnije.' },
      { status: 500 }
    );
  }
}