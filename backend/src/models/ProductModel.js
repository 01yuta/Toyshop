const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    series: { type: String, required: true },
    scale: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    description: { type: String },
    images: { type: [String], required: true },
    specifications: { type: String },
    stock: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isNewProduct: { type: Boolean, default: false },
    discountText: { type: String, default: "" },
    category: { type: String, default: "Model Kits" },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
