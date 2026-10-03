'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../src/context/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchData() {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        const dataProd = await resProd.json();
        const dataCat = await resCat.json();
        
        if (Array.isArray(dataProd)) setProducts(dataProd);
        if (Array.isArray(dataCat)) setCategories(dataCat);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category?._id === selectedCategory || p.category === selectedCategory)
    : products;

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Učitavanje proizvoda...</div>;
  }

  return (
    <div>
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            selectedCategory === '' ? 'bg-black text-white' : 'bg-white border text-gray-700'
          }`}
        >
          Sve
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat._id ? 'bg-black text-white' : 'bg-white border text-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-4 flex flex-col flex-1">
              <h2 className="font-semibold text-lg">{product.name}</h2>
              <p className="text-gray-500 text-sm mt-1 flex-1">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-bold text-lg">{product.price} KM</span>
                <button
                  onClick={() => addToCart(product, product.sizes?.[0] || 'M')}
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Dodaj u košaricu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}