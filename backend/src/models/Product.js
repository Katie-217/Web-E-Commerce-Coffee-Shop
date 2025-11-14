const mongoose = require('mongoose');

const VariantOptionSchema = new mongoose.Schema({
  label: { type: String, required: true },     // "250g", "500g", "1kg", "300ml"...
  priceDelta: { type: Number, default: 0 },    // cộng/trừ vào base price (đơn vị VND)
  sku: String,
  inStock: { type: Boolean, default: true },
}, { _id: false });

const VariantSchema = new mongoose.Schema({
  name: { type: String, enum: ['size', 'color', 'grind'], required: true },
  options: { type: [VariantOptionSchema], default: [] }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,          // 'roasted', 'cups', 'sets', 'makers' ...
  description: String,
  images: [String],
  price: Number,             // base price (size nhỏ nhất)
  oldPrice: Number,
  discount: Number,
  // 👇 mới thêm
  variants: { type: [VariantSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
