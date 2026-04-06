const express = require('express');
const Product = require('../models/Product');
const protect = require('../middleware/protect');

const router = express.Router();

// All product routes are protected — user must be logged in
router.use(protect);

// ─── GET /api/products ─────────────────────────────────────
// Get all products belonging to the logged in user
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/products ────────────────────────────────────
// Add a new product
router.post('/', async (req, res) => {
  const { name, category, price, costPrice, stock, lowStockLimit } = req.body;

  if (!name || !category || price === undefined || costPrice === undefined) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  try {
    const product = await Product.create({
      name,
      category,
      price,
      costPrice,
      stock: stock || 0,
      lowStockLimit: lowStockLimit || 5,
      userId: req.user.id,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/products/:id ─────────────────────────────────
// Update a product (edit details or update stock)
router.put('/:id', async (req, res) => {
  try {
    // Make sure user can only edit their own products
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // return the updated document
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/products/:id ──────────────────────────────
// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ─── GET /api/products/barcode/:code ──────────────────────
// Find a product by its barcode number
router.get('/barcode/:code', async (req, res) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.code,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;