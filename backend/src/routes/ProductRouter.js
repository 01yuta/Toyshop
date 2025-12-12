const express = require('express');
const router = express.Router();

const ProductController = require('../controller/ProductController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/test', (req, res) => {
  return res.json({ message: 'Product route OK' });
});

router.get('/', ProductController.getProducts);
router.get('/:id/reviews', ProductController.getProductReviews);
router.post('/:id/reviews', authMiddleware, ProductController.createProductReview);
router.get('/:id/related', ProductController.getRelatedProducts);
router.patch('/:id/stock', authMiddleware, adminMiddleware, ProductController.updateProductStock);
router.get('/:id', ProductController.getProductById);
router.post('/', authMiddleware, adminMiddleware, ProductController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, ProductController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, ProductController.deleteProduct);

module.exports = router;
