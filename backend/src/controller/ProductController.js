const ProductService = require('../services/ProductService');

const normalizeProductPayload = (payload = {}) => {
  const data = { ...payload };

  if (data.price !== undefined) {
    data.price = Number(data.price);
  }

  if (data.stock !== undefined) {
    data.stock = Number(data.stock);
  }

  if (Array.isArray(data.images)) {
    data.images = data.images.map((img) => String(img).trim()).filter(Boolean);
  } else if (typeof data.images === 'string') {
    data.images = data.images
      .split(',')
      .map((img) => img.trim())
      .filter(Boolean);
  }

  if (typeof data.description === 'string') {
    data.description = data.description.trim();
    if (!data.description) {
      delete data.description;
    }
  }

  if (typeof data.specifications === 'string') {
    data.specifications = data.specifications.trim();
    if (!data.specifications) {
      delete data.specifications;
    }
  }

  return data;
};

const validateRequiredFields = (data) => {
  const errors = [];
  const requiredFields = ['name', 'series', 'price', 'images'];

  requiredFields.forEach((field) => {
    if (!data[field] && data[field] !== 0) {
      errors.push(`${field} is required`);
    }
  });

  if (Number.isNaN(data.price)) {
    errors.push('price must be a valid number');
  }

  if (data.stock !== undefined && Number.isNaN(data.stock)) {
    errors.push('stock must be a valid number');
  }

  if (!Array.isArray(data.images) || data.images.length === 0) {
    errors.push('images must be a non-empty array');
  }

  return errors;
};

const normalizeReviewPayload = (payload = {}) => ({
  rating: payload.rating !== undefined ? Number(payload.rating) : undefined,
  comment: typeof payload.comment === 'string' ? payload.comment.trim() : '',
});

const validateReviewPayload = (data) => {
  const errors = [];

  if (data.rating === undefined || Number.isNaN(data.rating)) {
    errors.push('rating is required and must be a number');
  } else if (data.rating < 1 || data.rating > 5) {
    errors.push('rating must be between 1 and 5');
  }

  return errors;
};

const createProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);
    const validationErrors = validateRequiredFields(payload);

    if (validationErrors.length) {
      return res.status(400).json({
        message: 'Invalid product payload',
        errors: validationErrors,
      });
    }

    const product = await ProductService.createProduct(payload);
    return res.status(201).json({
      message: 'Product created successfully',
      data: product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProducts = async (req, res) => {
  try {
    const result = await ProductService.getProducts(req.query);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body);

    if (payload.price !== undefined && Number.isNaN(payload.price)) {
      return res.status(400).json({
        message: 'Invalid product payload',
        errors: ['price must be a valid number'],
      });
    }

    if (payload.stock !== undefined && Number.isNaN(payload.stock)) {
      return res.status(400).json({
        message: 'Invalid product payload',
        errors: ['stock must be a valid number'],
      });
    }

    if (payload.images !== undefined && (!Array.isArray(payload.images) || payload.images.length === 0)) {
      return res.status(400).json({
        message: 'Invalid product payload',
        errors: ['images must be a non-empty array when provided'],
      });
    }

    const product = await ProductService.updateProduct(req.params.id, payload);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({
      message: 'Product updated successfully',
      data: product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await ProductService.deleteProduct(req.params.id);
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createProductReview = async (req, res) => {
  try {
    const payload = normalizeReviewPayload(req.body);
    const errors = validateReviewPayload(payload);
    if (errors.length) {
      return res.status(400).json({
        message: 'Invalid review payload',
        errors,
      });
    }

    const review = await ProductService.createOrUpdateProductReview(req.params.id, req.user.id, payload);
    if (!review) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Review saved successfully',
      data: review,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await ProductService.getProductReviews(req.params.id, req.query);
    return res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const stock = Number(req.body.stock);
    if (Number.isNaN(stock) || stock < 0) {
      return res.status(400).json({
        message: 'Invalid stock value',
        errors: ['stock must be a non-negative number'],
      });
    }

    const product = await ProductService.updateProductStock(req.params.id, stock);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getRelatedProducts = async (req, res) => {
  try {
    const related = await ProductService.getRelatedProducts(req.params.id, req.query);
    if (!related) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({
      items: related,
      count: related.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  updateProductStock,
  getRelatedProducts,
};
