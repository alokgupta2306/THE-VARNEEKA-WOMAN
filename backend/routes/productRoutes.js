const express = require('express');
const router = express.Router();
const { getProducts, getProductById, addProduct, updateProduct, deleteProduct, addReview } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only — accept main image + up to 3 extra images
router.post('/', protect, adminOnly, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]), addProduct);

router.put('/:id', protect, adminOnly, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]), updateProduct);

router.delete('/:id', protect, adminOnly, deleteProduct);

// Customer - add review
router.post('/:id/review', protect, addReview);

module.exports = router;