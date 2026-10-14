'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Zahtjev nije uspio. Pokušajte ponovo.');
        return;
      }

      setMessage(data.message);
    } catch (submitError) {
      console.error('Forgot password request failed:', submitError);
      setError('Nije moguće povezati se sa serverom. Pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-md items-center justify-center py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-zinc-950 p-7 text-white shadow-xl shadow-black/10 sm:p-9">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
          BStore račun
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Zaboravljena lozinka?</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Unesite email povezan s računom. Ako račun postoji, dobit ćete upute za promjenu lozinke.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-zinc-300">
              Email adresa
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-white outline-none transition placeholder:text-zinc-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/15"
              placeholder="vi@example.com"
            />
          </div>

          {message && (
            <p role="status" className="rounded-lg bg-emerald-950/70 px-3.5 py-3 text-sm text-emerald-300">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-lg bg-red-950/70 px-3.5 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-400/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Slanje...' : 'Pošalji upute'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Sjetili ste se lozinke?{' '}
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
            Prijavite se
          </Link>
        </p>
      </div>
    </section>
  );
}
