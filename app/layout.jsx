import './globals.css';
import { CartProvider } from '../src/context/CartContext';
import Navbar from '../src/components/Navbar';

export const metadata = {
  title: 'BStore | Online Shop',
  description: 'E-commerce web aplikacija',
};

export default function RootLayout({ children }) {
  return (
    <html lang="hr">
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto p-4">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}