'use client';

import Image from 'next/image';
import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../../src/context/CartContext';
import ProductVariantOptions from '../../src/components/ProductVariantOptions';

const formatPrice = (price) =>
  `${new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price))} KM`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [addedProduct, setAddedProduct] = useState('');
  const [variants, setVariants] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
        ]);
        const [productsData, categoriesData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!productsResponse.ok) {
          throw new Error(productsData.message || 'Proizvode trenutno nije moguće učitati.');
        }
        if (!categoriesResponse.ok) {
          throw new Error(categoriesData.message || 'Kategorije trenutno nije moguće učitati.');
        }
        if (!Array.isArray(productsData) || !Array.isArray(categoriesData)) {
          throw new Error('Katalog je vratio neočekivan odgovor.');
        }

        if (mounted) {
          setProducts(productsData);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Greška pri učitavanju proizvoda:', error);
        if (mounted) setLoadError(error.message || 'Katalog trenutno nije dostupan.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleProducts = useMemo(
    () =>
      selectedCategory
        ? products.filter(
            (product) =>
              product.category?._id === selectedCategory || product.category === selectedCategory
          )
        : products,
    [products, selectedCategory]
  );

  function handleAddToCart(product) {
    const variant = variants[product._id] || {};
    addToCart(
      product,
      variant.size ?? product.sizes?.[0] ?? 'M',
      variant.color ?? product.colors?.[0] ?? ''
    );
    setAddedProduct(product._id);
    window.setTimeout(() => setAddedProduct(''), 1600);
  }

  function updateVariant(productId, field, value) {
    setVariants((current) => ({
      ...current,
      [productId]: { ...current[productId], [field]: value },
    }));
  }

  return (
    <section className="space-y-8 pb-12 text-white">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
          BStore kolekcija
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Svi proizvodi</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          Pregledaj ponudu i odaberi kategoriju koja odgovara tvom stilu.
        </p>
      </header>

      <nav aria-label="Filtriraj proizvode po kategoriji" className="flex gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('')}
          aria-pressed={selectedCategory === ''}
          className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-medium transition ${
            selectedCategory === ''
              ? 'border-indigo-400/50 bg-indigo-400/15 text-white'
              : 'border-white/10 bg-zinc-900/70 text-zinc-400 hover:border-white/20 hover:text-white'
          }`}
        >
          Sve kategorije
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category._id}
            onClick={() => setSelectedCategory(category._id)}
            aria-pressed={selectedCategory === category._id}
            className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-medium transition ${
              selectedCategory === category._id
                ? 'border-indigo-400/50 bg-indigo-400/15 text-white'
                : 'border-white/10 bg-zinc-900/70 text-zinc-400 hover:border-white/20 hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </nav>

      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold sm:text-2xl">
          {categories.find((category) => category._id === selectedCategory)?.name || 'Ponuda'}
        </h2>
        <span className="text-sm text-zinc-500">
          {loading ? 'Učitavanje...' : `${visibleProducts.length} proizvoda`}
        </span>
      </div>

      {loading ? (
        <p role="status" className="py-10 text-center text-sm text-zinc-400">
          Učitavanje proizvoda...
        </p>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-red-400/20 bg-red-950/30 px-5 py-6 text-sm text-red-200">
          {loadError}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900/40 px-5 py-14 text-center">
          <ShoppingBag aria-hidden="true" className="mx-auto h-8 w-8 text-zinc-500" />
          <h3 className="mt-4 font-semibold text-white">Nema proizvoda u ovoj kategoriji</h3>
          <p className="mt-2 text-sm text-zinc-400">Izaberi drugu kategoriju i pregledaj ponudu.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleProducts.map((product) => {
            const isAdded = addedProduct === product._id;

            return (
              <article
                key={product._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-indigo-300/30 hover:shadow-xl hover:shadow-black/20"
              >
                {product.imageUrl && (
                  <div className="relative aspect-[4/4.5] overflow-hidden bg-zinc-800">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                      {product.category?.name || 'BStore'}
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-1 font-semibold text-white">{product.name}</h3>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-zinc-400">
                    {product.description}
                  </p>
                  <ProductVariantOptions
                    product={product}
                    selectedSize={variants[product._id]?.size}
                    selectedColor={variants[product._id]?.color}
                    onSizeChange={(size) => updateVariant(product._id, 'size', size)}
                    onColorChange={(color) => updateVariant(product._id, 'color', color)}
                  />
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-base font-semibold text-indigo-300">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isAdded
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-white text-zinc-950 hover:bg-indigo-100'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check aria-hidden="true" className="h-3.5 w-3.5" />
                          Dodano
                        </>
                      ) : (
                        <>
                          <ShoppingBag aria-hidden="true" className="h-3.5 w-3.5" />
                          Dodaj u košaricu
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
