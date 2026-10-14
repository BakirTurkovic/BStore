'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'bstore_cart';

function readCart(key) {
  try {
    const storedCart = localStorage.getItem(key);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
      throw new Error(`Stored cart "${key}" is not an array.`);
    }

    return parsedCart.filter(
      (item) =>
        item &&
        typeof item._id === 'string' &&
        typeof item.name === 'string' &&
        Number.isFinite(item.price) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch (error) {
    console.error('Unable to read saved cart:', error);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [cartKey, setCartKey] = useState(GUEST_CART_KEY);
  const [isCartLoaded, setIsCartLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCartForSession() {
      setIsCartLoaded(false);

      let sessionUser = null;
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) throw new Error('Unable to load account session.');
        const data = await response.json();
        sessionUser = data.user;
      } catch (error) {
        console.error('Unable to check cart account session:', error);
      }

      if (!mounted) return;

      const nextKey = sessionUser ? `${GUEST_CART_KEY}_${sessionUser.id}` : GUEST_CART_KEY;
      let nextCart = readCart(nextKey);

      if (sessionUser && nextCart.length === 0) {
        const guestCart = readCart(GUEST_CART_KEY);
        if (guestCart.length > 0) {
          nextCart = guestCart;
          try {
            localStorage.setItem(nextKey, JSON.stringify(guestCart));
            localStorage.removeItem(GUEST_CART_KEY);
          } catch (error) {
            console.error('Unable to move guest cart to account storage:', error);
          }
        }
      }

      setUser(sessionUser);
      setCartKey(nextKey);
      setCart(nextCart);
      setIsCartLoaded(true);
    }

    loadCartForSession();
    window.addEventListener('bstore-auth-changed', loadCartForSession);

    return () => {
      mounted = false;
      window.removeEventListener('bstore-auth-changed', loadCartForSession);
    };
  }, []);

  useEffect(() => {
    if (!isCartLoaded) return;

    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Unable to save cart:', error);
    }
  }, [cart, cartKey, isCartLoaded]);

  const addToCart = (product, size, color = '') => {
    setCart((previousCart) => {
      const existingIndex = previousCart.findIndex(
        (item) => item._id === product._id && item.size === size && (item.color || '') === color
      );
      if (existingIndex > -1) {
        return previousCart.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...previousCart, { ...product, size, color, quantity: 1 }];
    });
  };

  const updateQuantity = (id, size, color, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setCart((previousCart) =>
      previousCart.map((item) =>
        item._id === id && item.size === size && (item.color || '') === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (id, size, color = '') => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => !(item._id === id && item.size === size && (item.color || '') === color)
      )
    );
  };

  const clearCart = () => setCart([]);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        user,
        isCartLoaded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider.');
  return context;
};
