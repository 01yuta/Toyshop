const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const Review = require('../models/ReviewModel');
const Order = require('../models/OrderModel');

const updateProductRatingStats = async (productId) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);
  const stats = await Review.aggregate([
    { $match: { product: productObjectId } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const avgRating = stats[0]?.avgRating ?? 0;
  const ratingCount = stats[0]?.ratingCount ?? 0;
  const roundedAvg = Math.round(avgRating * 100) / 100;

  await Product.findByIdAndUpdate(productId, {
    avgRating: roundedAvg,
    ratingCount,
  });
};

const createProduct = async (data) => {
  const product = await Product.create(data);
  return product;
};

const getProducts = async ({
  keyword,
  series,
  scale,
  minPrice,
  maxPrice,
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) => {
  const query = {};

  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  if (series) {
    query.series = series;
  }

  if (scale) {
    query.scale = scale;
  }

  const parsedMin = Number(minPrice);
  const parsedMax = Number(maxPrice);

  if (!Number.isNaN(parsedMin) || !Number.isNaN(parsedMax)) {
    query.price = {};
    if (!Number.isNaN(parsedMin)) {
      query.price.$gte = parsedMin;
    }
    if (!Number.isNaN(parsedMax)) {
      query.price.$lte = parsedMax;
    }
  }

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const allowedSortFields = ['price', 'createdAt', 'name', 'stock'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortDirection };

  const [items, total] = await Promise.all([
    Product.find(query).skip(skip).limit(limitNum).sort(sort),
    Product.countDocuments(query),
  ]);

  return {
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    limit: limitNum,
    sort: { field: sortField, order: sortDirection === 1 ? 'asc' : 'desc' },
    filters: {
      keyword: keyword || null,
      series: series || null,
      scale: scale || null,
      minPrice: !Number.isNaN(parsedMin) ? parsedMin : null,
      maxPrice: !Number.isNaN(parsedMax) ? parsedMax : null,
    },
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id);
  return product;
};

const updateProduct = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  return product;
};

const deleteProduct = async (id) => {
  await Product.findByIdAndDelete(id);
};

const hasUserPurchasedProduct = async (userId, productId) => {
  const order = await Order.exists({
    user: userId,
    'orderItems.product': productId,
  });
  return !!order;
};

const getProductReviews = async (productId, { page = 1, limit = 10 } = {}) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Review.find({ product: productId })
      .populate('user', 'username email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments({ product: productId }),
  ]);

  return {
    items,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
};

const createOrUpdateProductReview = async (productId, userId, { rating, comment }) => {
  const product = await Product.findById(productId);
  if (!product) {
    return null;
  }

  const reviewPayload = {
    rating,
    comment: comment?.trim() || '',
  };

  const review = await Review.findOneAndUpdate(
    { product: productId, user: userId },
    { $set: reviewPayload, $setOnInsert: { product: productId, user: userId } },
    { upsert: true, new: true, runValidators: true }
  ).populate('user', 'username email avatar');

  await updateProductRatingStats(productId);

  return review;
};

const updateProductStock = async (productId, stock) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { stock },
    { new: true, runValidators: true }
  );
  return product;
};

const getRelatedProducts = async (productId, { limit = 4 } = {}) => {
  const baseProduct = await Product.findById(productId);
  if (!baseProduct) {
    return null;
  }

  const limitNum = Math.max(1, Number(limit) || 4);

  const query = {
    _id: { $ne: baseProduct._id },
  };

  if (baseProduct.series) {
    query.series = baseProduct.series;
  }
  if (baseProduct.scale) {
    query.scale = baseProduct.scale;
  }

  let related = await Product.find(query).limit(limitNum).sort({ createdAt: -1 });

  if (related.length < limitNum) {
    const fallback = await Product.find({
      _id: { $ne: baseProduct._id },
    })
      .limit(limitNum - related.length)
      .sort({ createdAt: -1 });

    related = [...related, ...fallback];
  }

  return related;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  hasUserPurchasedProduct,
  getProductReviews,
  createOrUpdateProductReview,
  updateProductStock,
  getRelatedProducts,
};
