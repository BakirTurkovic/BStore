'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);

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
    try {
      const response = await fetch('/api/auth/session', { method: 'DELETE' });
      if (!response.ok) throw new Error('Unable to sign out.');
      setUser(null);
      window.dispatchEvent(new Event('bstore-auth-changed'));
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-white transition hover:opacity-90">
          BStore<span className="text-indigo-500">.</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium text-gray-300 transition hover:text-white">
            Proizvodi
          </Link>

          <Link href="/cart" aria-label="Cart" className="relative p-2 text-gray-300 transition hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </Link>

          {user ? (
            <>
              <span className="hidden text-sm font-medium text-gray-300 sm:inline">
                Hi, {user.name}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-gray-300 transition hover:text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-300 transition hover:text-white">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
