'use client';

import Image from 'next/image';
import { ArrowDown, ArrowRight, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../src/context/CartContext';
import ProductVariantOptions from '../src/components/ProductVariantOptions';

const formatPrice = (price) =>
  `${new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price))} KM`;

export default function HomePage() {
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
        console.error('Greška pri učitavanju početnog kataloga:', error);
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

  const visibleProducts = useMemo(() => {
    const categoryProducts = selectedCategory
      ? products.filter(
          (product) =>
            product.category?._id === selectedCategory || product.category === selectedCategory
        )
      : products;

    return categoryProducts.slice(0, 8);
  }, [products, selectedCategory]);

  const heroProduct = products.find((product) => product.imageUrl);

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
    <div className="space-y-16 pb-12 text-white sm:space-y-20">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_15%_15%,rgba(99,102,241,0.2),transparent_42%),linear-gradient(120deg,#09090b_0%,#18181b_58%,#09090b_100%)]" />
        <div className="absolute -right-28 -top-32 -z-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div
          className={`grid min-h-[480px] items-center gap-10 px-6 py-12 sm:px-10 sm:py-14 lg:px-14 ${
            heroProduct ? 'lg:grid-cols-[1fr_0.88fr]' : ''
          }`}
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              Stil koji traje
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Dobro odabrani
              <span className="block text-indigo-300">komadi. Svaki dan.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg">
              Otkrij pažljivo odabranu odjeću za svoj ritam, svoj stil i svaki trenutak koji vrijedi
              pamtiti.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#istaknuti-proizvodi"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400"
              >
                Istraži kolekciju
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                href="#kategorije"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
              >
                Naše kategorije
                <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Jednostavna kupovina
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                Pažljivo biran asortiman
              </span>
            </div>
          </div>

          {heroProduct && (
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 rounded-[2rem] bg-indigo-500/15 blur-2xl" />
              <div className="relative aspect-[4/4.5] overflow-hidden rounded-[1.6rem] border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
                <Image
                  src={heroProduct.imageUrl}
                  alt={heroProduct.name}
                  fill
                  loading="eager"
                  unoptimized
                  sizes="(max-width: 1024px) 80vw, 40vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/10" />
                <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  BStore izbor
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
                    Izdvajamo iz ponude
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-semibold text-white">{heroProduct.name}</h2>
                      <p className="mt-1 text-sm text-zinc-300">{formatPrice(heroProduct.price)}</p>
                    </div>
                    <a
                      href="#istaknuti-proizvodi"
                      aria-label="Pogledaj istaknute proizvode"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                    >
                      <ArrowRight aria-hidden="true" className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="kategorije" className="scroll-mt-28">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
              Pronađi svoj stil
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Istraži kategorije
            </h2>
          </div>
          <span className="hidden text-sm text-zinc-500 sm:inline">
            {categories.length} {categories.length === 1 ? 'kategorija' : 'kategorije'}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
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
        </div>
      </section>

      <section id="istaknuti-proizvodi" className="scroll-mt-28">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
              Odabrano za tebe
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {selectedCategory
                ? categories.find((category) => category._id === selectedCategory)?.name
                : 'Istaknuti proizvodi'}
            </h2>
          </div>
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
            <h3 className="mt-4 font-semibold text-white">Još nema proizvoda u ovoj kategoriji</h3>
            <p className="mt-2 text-sm text-zinc-400">Pokušaj s drugom kategorijom.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                            Dodaj
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
    </div>
  );
}
