export default function ProductVariantOptions({
  product,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
}) {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  if (sizes.length === 0 && colors.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {sizes.length > 0 && (
        <label className="block text-xs font-medium text-zinc-400">
          Veličina
          <select
            value={selectedSize ?? sizes[0]}
            onChange={(event) => onSizeChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
          >
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
      {colors.length > 0 && (
        <label className="block text-xs font-medium text-zinc-400">
          Boja
          <select
            value={selectedColor ?? colors[0]}
            onChange={(event) => onColorChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
