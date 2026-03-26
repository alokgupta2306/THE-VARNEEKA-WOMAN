const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// @desc Get all products
// @route GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { fabric, colour, minPrice, maxPrice } = req.query;

    let filter = {};
    if (fabric) filter.fabric = fabric;
    if (colour) filter.colour = { $regex: colour, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product
// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add new product (admin only)
// @route POST /api/products
exports.addProduct = async (req, res) => {
  try {
    const { name, fabric, colour, pattern, price, stock } = req.body;

    if (!req.files || !req.files['image']) {
      return res.status(400).json({ message: 'Please upload a main product image' });
    }

    const image = `/uploads/${req.files['image'][0].filename}`;

    // Extra images (optional)
    const images = [];
    if (req.files['images']) {
      req.files['images'].forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const product = await Product.create({
      name,
      fabric,
      colour,
      pattern,
      price: Number(price),
      stock: Number(stock),
      image,
      images
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update product (admin only)
// @route PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, fabric, colour, pattern, price, stock } = req.body;

    if (req.file) {
      // Delete old image
      const oldImage = path.join(__dirname, '..', product.image);
      if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
      product.image = `/uploads/${req.file.filename}`;
    }

    product.name = name || product.name;
    product.fabric = fabric || product.fabric;
    product.colour = colour || product.colour;
    product.pattern = pattern || product.pattern;
    product.price = price ? Number(price) : product.price;
    product.stock = stock ? Number(stock) : product.stock;

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete product (admin only)
// @route DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image file
    const imagePath = path.join(__dirname, '..', product.image);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Add review
// @route POST /api/products/:id/review
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user.id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};