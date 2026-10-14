import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    gender: { type: String, enum: ['MEN', 'WOMEN', 'UNISEX'], default: 'UNISEX', index: true },
    sizes: [{ type: String }],
    colors: [{ type: String }],
  },
  { timestamps: true }
);

if (mongoose.models.Product && !mongoose.models.Product.schema.path('gender')) {
  delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);