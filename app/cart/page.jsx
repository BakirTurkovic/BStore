'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, LockKeyhole, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../src/context/CartContext';

const formatPrice = (amount) =>
  `${new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} KM`;

export default function CartPage() {
  const { cart, user, isCartLoaded, updateQuantity, removeFromCart, totalAmount } = useCart();
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  if (!isCartLoaded) {
    return (
      <section className="rounded-3xl bg-neutral-950 px-6 py-24 text-center text-white">
        <p className="text-sm text-neutral-400">Loading your cart...</p>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="rounded-3xl bg-neutral-950 px-6 py-20 text-center text-white sm:py-28">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-indigo-400">
          <ShoppingBag aria-hidden="true" className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-400">
          Looks like you haven&apos;t added anything yet. Explore the shop and find something you love.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Continue shopping
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-neutral-950 px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Continue shopping
        </Link>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Your selection
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Shopping cart</h1>
          </div>
          <p className="text-sm text-neutral-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
            {user ? ` · Saved to ${user.name}'s cart` : ' · Guest cart'}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="divide-y divide-neutral-800 rounded-2xl border border-neutral-800 bg-neutral-900/50 px-4 sm:px-6">
          {cart.map((item) => (
            <article
              key={`${item._id}-${item.size || ''}`}
              className="flex gap-4 py-5 sm:gap-5"
            >
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-800 sm:h-28 sm:w-24">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={96}
                    height={112}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-500">
                    <ShoppingBag aria-hidden="true" className="h-7 w-7" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold text-white">{item.name}</h2>
                  {item.size && <p className="mt-1 text-sm text-neutral-400">Size: {item.size}</p>}
                  <p className="mt-2 text-sm font-medium text-neutral-300">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="inline-flex items-center rounded-lg border border-neutral-700 bg-neutral-950">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}
                      className="rounded-l-lg p-2.5 text-neutral-300 transition hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <span className="min-w-9 px-1 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                      className="rounded-r-lg p-2.5 text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="w-24 text-right text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeFromCart(item._id, item.size)}
                    className="rounded-lg p-2 text-neutral-500 transition hover:bg-red-950/60 hover:text-red-400"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-6 space-y-4 border-b border-neutral-800 pb-5 text-sm">
            <div className="flex justify-between gap-4 text-neutral-400">
              <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
              <span className="text-white">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between gap-4 text-neutral-400">
              <span>Shipping</span>
              <span className="text-white">Calculated at checkout</span>
            </div>
          </div>
          <div className="flex justify-between gap-4 py-5 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(totalAmount)}</span>
          </div>

          {user ? (
            <button
              type="button"
              onClick={() => setCheckoutMessage('Checkout is not available yet. Your cart is saved to your account on this device.')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            >
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              Proceed to checkout
            </button>
          ) : (
            <Link
              href="/login?next=%2Fcart"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            >
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              Sign in to checkout
            </Link>
          )}

          {checkoutMessage && (
            <p role="status" className="mt-3 rounded-lg bg-neutral-800 px-3 py-2.5 text-sm leading-5 text-neutral-300">
              {checkoutMessage}
            </p>
          )}

          <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
            Secure checkout · Your cart is saved automatically
          </p>
        </aside>
      </div>
    </section>
  );
}
