'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { cart } = useCart();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    let mounted = true;

    async function refreshSession() {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) throw new Error('Unable to load account session.');
        const data = await response.json();
        if (mounted) setUser(data.user);
      } catch (error) {
        console.error('Navbar session check failed:', error);
      }
    }

    refreshSession();
    window.addEventListener('bstore-auth-changed', refreshSession);

    return () => {
      mounted = false;
      window.removeEventListener('bstore-auth-changed', refreshSession);
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      const response = await fetch('/api/auth/session', { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to sign out.');
      setUser(null);
      window.dispatchEvent(new Event('bstore-auth-changed'));
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsSigningOut(false);
    }
  }

  const userInitial = user?.name?.trim().charAt(0).toUpperCase();

  function navigateToGender(gender) {
    window.dispatchEvent(new CustomEvent('bstore-gender-navigation', { detail: gender }));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 shadow-lg shadow-black/5 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:min-h-[4.5rem] sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-80 sm:text-2xl">
          BStore<span className="text-indigo-400">.</span>
        </Link>

        <nav aria-label="Glavna navigacija" className="flex min-w-0 items-center gap-1.5 sm:gap-3 md:gap-5">
          <Link
            href="/products"
            className="shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:px-2.5 sm:text-sm"
          >
            Proizvodi
          </Link>
          <Link
            href="/products?gender=WOMEN"
            onClick={() => navigateToGender('WOMEN')}
            className="hidden shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white md:inline-flex md:text-sm"
          >
            Žene
          </Link>
          <Link
            href="/products?gender=MEN"
            onClick={() => navigateToGender('MEN')}
            className="hidden shrink-0 rounded-lg px-2 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white md:inline-flex md:text-sm"
          >
            Muškarci
          </Link>

          <Link
            href="/cart"
            aria-label={cartItemCount > 0 ? `Košarica, ${cartItemCount} artikala` : 'Košarica'}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-zinc-950">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-zinc-200"
                >
                  {userInitial}
                </span>
                <span className="hidden max-w-36 truncate text-sm text-zinc-400 md:inline">
                  Zdravo, {user.name}
                </span>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2.5 py-1 text-xs font-semibold text-indigo-300 transition-colors hover:bg-indigo-400/20 sm:inline-flex"
                  >
                    Admin
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="shrink-0 rounded-lg border border-white/10 bg-zinc-800 px-2.5 py-2 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60 disabled:cursor-wait disabled:opacity-60 sm:px-4 sm:text-sm"
              >
                {isSigningOut ? 'Odjava...' : <><span className="sm:hidden">Odjava</span><span className="hidden sm:inline">Odjavi se</span></>}
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <Link
                href="/login"
                className="rounded-lg border border-white/10 bg-zinc-800 px-2.5 py-2 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white sm:px-4 sm:text-sm"
              >
                Prijava
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-500 px-2.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-950/40 transition-all hover:bg-indigo-400 sm:px-4 sm:text-sm"
              >
                Registracija
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
