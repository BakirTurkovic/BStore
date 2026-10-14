'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ResetPasswordForm({ token }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReset, setIsReset] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Nije moguće promijeniti lozinku.');
        return;
      }

      setIsReset(true);
    } catch (submitError) {
      console.error('Reset password request failed:', submitError);
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
        <h1 className="text-3xl font-bold tracking-tight">
          {isReset ? 'Lozinka je promijenjena' : 'Postavite novu lozinku'}
        </h1>

        {isReset ? (
          <>
            <p role="status" className="mt-4 rounded-lg bg-emerald-950/70 px-3.5 py-3 text-sm text-emerald-300">
              Lozinka je uspješno promijenjena. Sada se možete prijaviti.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex w-full justify-center rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Prijavite se
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Nova lozinka mora imati najmanje 8 znakova.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Nova lozinka
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-white outline-none transition placeholder:text-zinc-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/15"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Potvrdite novu lozinku
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-white outline-none transition placeholder:text-zinc-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/15"
                />
              </div>

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
                {isSubmitting ? 'Čuvanje...' : 'Promijeni lozinku'}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
