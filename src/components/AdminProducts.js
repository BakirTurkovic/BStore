'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload.js';
import { PRODUCT_GENDER_LABELS } from '../lib/productGender.js';

const initialForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  gender: 'UNISEX',
  imageUrl: '',
  sizes: '',
  colors: '',
};

const parseOptions = (value) =>
  value
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);

const formatPrice = (price) =>
  `${new Intl.NumberFormat('bs-BA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)} KM`;

async function fetchCatalog() {
  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch('/api/products', { cache: 'no-store' }),
    fetch('/api/categories', { cache: 'no-store' }),
  ]);
  const [productsData, categoriesData] = await Promise.all([
    productsResponse.json(),
    categoriesResponse.json(),
  ]);

  if (!productsResponse.ok) {
    throw new Error(productsData.message || 'Unable to load products.');
  }
  if (!categoriesResponse.ok) {
    throw new Error(categoriesData.message || 'Unable to load categories.');
  }
  if (!Array.isArray(productsData) || !Array.isArray(categoriesData)) {
    throw new Error('The catalog returned an unexpected response.');
  }

  return { products: productsData, categories: categoriesData };
}

export default function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState('');
  const [editingProductId, setEditingProductId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteNotice, setDeleteNotice] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadInitialCatalog() {
      try {
        const catalog = await fetchCatalog();
        if (!mounted) return;
        setProducts(catalog.products);
        setCategories(catalog.categories);
      } catch (loadError) {
        if (!mounted) return;
        console.error('Unable to load admin catalog:', loadError);
        setError(loadError.message || 'Unable to load the catalog.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadInitialCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  async function refreshCatalog() {
    setIsLoading(true);
    setError('');

    try {
      const catalog = await fetchCatalog();
      setProducts(catalog.products);
      setCategories(catalog.categories);
    } catch (loadError) {
      console.error('Unable to load admin catalog:', loadError);
      setError(loadError.message || 'Unable to load the catalog.');
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSaving(true);

    try {
      const response = await fetch(
        editingProductId ? `/api/products/${encodeURIComponent(editingProductId)}` : '/api/products',
        {
        method: editingProductId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          category: form.category,
          gender: form.gender,
          imageUrl: form.imageUrl,
          sizes: parseOptions(form.sizes),
          colors: parseOptions(form.colors),
        }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save the product.');
      }

      setProducts((current) =>
        editingProductId
          ? current.map((product) => (product._id === editingProductId ? data : product))
          : [data, ...current]
      );
      setForm(initialForm);
      setNotice(editingProductId ? 'Product updated successfully.' : 'Product created successfully.');
      setEditingProductId('');
    } catch (saveError) {
      console.error('Unable to save product:', saveError);
      setError(saveError.message || 'Unable to save the product.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Želite li obrisati proizvod "${product.name}"?`)) return;

    setDeleteError('');
    setDeleteNotice('');
    setDeletingProductId(product._id);

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(product._id)}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete the product.');
      }

      setProducts((current) => current.filter((item) => item._id !== product._id));
      if (editingProductId === product._id) {
        setEditingProductId('');
        setForm(initialForm);
      }
      setDeleteNotice('Proizvod je uspješno obrisan.');
    } catch (deleteError) {
      console.error('Unable to delete product:', deleteError);
      setDeleteError(deleteError.message || 'Unable to delete the product.');
    } finally {
      setDeletingProductId('');
    }
  }

  function handleEdit(product) {
    setEditingProductId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category?._id || '',
      gender: product.gender || 'UNISEX',
      imageUrl: product.imageUrl,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : '',
    });
    setError('');
    setNotice('');
  }

  function cancelEdit() {
    setEditingProductId('');
    setForm(initialForm);
    setError('');
    setNotice('');
  }

  return (
    <section className="space-y-8 rounded-3xl bg-neutral-950 px-5 py-8 text-white sm:px-8 sm:py-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
          Store management
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Admin products</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Add products to your catalog and manage your current listings.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form
          onSubmit={handleSubmit}
          className="h-fit space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6"
        >
          <h2 className="text-lg font-semibold">{editingProductId ? 'Edit product' : 'Add a product'}</h2>

          <div>
            <label htmlFor="product-name" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Title
            </label>
            <input
              id="product-name"
              name="name"
              required
              maxLength={160}
              value={form.name}
              onChange={updateField}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label htmlFor="product-description" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Description
            </label>
            <textarea
              id="product-description"
              name="description"
              required
              maxLength={5000}
              rows={4}
              value={form.description}
              onChange={updateField}
              className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label htmlFor="product-price" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Price (KM)
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={form.price}
              onChange={updateField}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Category
            </label>
            <select
              id="product-category"
              name="category"
              required
              value={form.category}
              onChange={updateField}
              disabled={isLoading || categories.length === 0}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
            >
              <option value="">
                {isLoading ? 'Loading categories...' : categories.length ? 'Select a category' : 'No categories available'}
              </option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-gender" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Namijenjeno za
            </label>
            <select
              id="product-gender"
              name="gender"
              required
              value={form.gender}
              onChange={updateField}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
            >
              {Object.entries(PRODUCT_GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-sizes" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Available sizes
            </label>
            <input
              id="product-sizes"
              name="sizes"
              value={form.sizes}
              onChange={updateField}
              placeholder="S, M, L, XL"
              maxLength={400}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-neutral-500">Separate sizes with commas.</p>
          </div>

          <div>
            <label htmlFor="product-colors" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Available colors
            </label>
            <input
              id="product-colors"
              name="colors"
              value={form.colors}
              onChange={updateField}
              placeholder="Black, White, Navy"
              maxLength={400}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none placeholder:text-neutral-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
            />
            <p className="mt-1 text-xs text-neutral-500">Separate colors with commas.</p>
          </div>

          <ImageUpload
            imageUrl={form.imageUrl}
            onUploadComplete={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
          />

          {!form.imageUrl && (
            <p className="text-xs text-neutral-400">Upload an image before creating the product.</p>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-red-950/70 px-3.5 py-3 text-sm text-red-300">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-lg bg-emerald-950/70 px-3.5 py-3 text-sm text-emerald-300">
              {notice}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving || !form.imageUrl || categories.length === 0}
              className="flex-1 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving product...' : editingProductId ? 'Save changes' : 'Create product'}
            </button>
            {editingProductId && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="rounded-lg border border-neutral-700 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Existing products</h2>
              <p className="mt-1 text-sm text-neutral-400">{products.length} listed</p>
            </div>
            <button
              type="button"
              onClick={refreshCatalog}
              disabled={isLoading}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {deleteNotice && (
            <p role="status" className="mb-4 rounded-lg bg-emerald-950/70 px-3.5 py-3 text-sm text-emerald-300">
              {deleteNotice}
            </p>
          )}
          {deleteError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-950/70 px-3.5 py-3 text-sm text-red-300">
              {deleteError}
            </p>
          )}

          {isLoading ? (
            <p className="py-8 text-center text-sm text-neutral-400">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-700 px-4 py-10 text-center text-sm text-neutral-400">
              No products found.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {products.map((product) => (
                <li key={product._id} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">{product.name}</h3>
                    <p className="mt-1 truncate text-xs text-neutral-400">
                      {product.category?.name || 'Uncategorized'} · {PRODUCT_GENDER_LABELS[product.gender] || PRODUCT_GENDER_LABELS.UNISEX}
                    </p>
                    {(product.sizes?.length > 0 || product.colors?.length > 0) && (
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {[
                          product.sizes?.length ? `Veličine: ${product.sizes.join(', ')}` : '',
                          product.colors?.length ? `Boje: ${product.colors.join(', ')}` : '',
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="text-sm font-medium">{formatPrice(Number(product.price))}</p>
                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      disabled={Boolean(deletingProductId) || isSaving}
                      className="rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={Boolean(deletingProductId)}
                      aria-label={`Obriši ${product.name}`}
                      className="rounded-lg border border-red-900/70 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-700 hover:bg-red-950/70 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingProductId === product._id ? 'Brisanje...' : 'Obriši'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
