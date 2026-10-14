export const CATALOG_CATEGORIES = [
  { name: 'Muška odjeća', slug: 'muska-odjeca' },
  { name: 'Ženska odjeća', slug: 'zenska-odjeca' },
  { name: 'Obuća', slug: 'obuca' },
  { name: 'Duksevi i Majice', slug: 'duksevi-i-majice' },
  { name: 'Jakne i Kaputi', slug: 'jakne-i-kaputi' },
  { name: 'Modni dodaci (Aksesoari)', slug: 'modni-dodaci-aksesoari' },
  { name: 'Sportska oprema', slug: 'sportska-oprema' },
];

export async function ensureCatalogCategories(Category) {
  await Category.bulkWrite(
    CATALOG_CATEGORIES.map(({ name, slug }) => ({
      updateOne: {
        filter: { slug },
        update: { $setOnInsert: { name, slug } },
        upsert: true,
      },
    }))
  );
}
