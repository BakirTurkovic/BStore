export const PRODUCT_GENDERS = ['MEN', 'WOMEN', 'UNISEX'];

export const PRODUCT_GENDER_LABELS = {
  MEN: 'Muško',
  WOMEN: 'Žensko',
  UNISEX: 'Unisex',
};

export function getProductGender(product) {
  if (PRODUCT_GENDERS.includes(product?.gender)) return product.gender;

  const categorySlug = product?.category?.slug;
  if (categorySlug === 'muska-odjeca') return 'MEN';
  if (categorySlug === 'zenska-odjeca') return 'WOMEN';
  return 'UNISEX';
}
