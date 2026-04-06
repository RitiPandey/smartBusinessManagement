const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const protect = require('../middleware/protect');

const router = express.Router();

router.use(protect);

// ─── GET /api/sales ────────────────────────────────────────
// Get all sales for the logged in user
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find({ userId: req.user.id }).sort({
      date: -1, // newest first
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/sales ───────────────────────────────────────
// Record a new sale
router.post('/', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Product and quantity are required' });
  }

  try {
    // Find the product to get its price and stock
    const product = await Product.findOne({
      _id: productId,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Make sure there is enough stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Not enough stock. Only ${product.stock} units available`,
      });
    }

    // Calculate totals
    const totalAmount = product.price * quantity;
    const profit = (product.price - product.costPrice) * quantity;

    // Save the sale record
    const sale = await Sale.create({
      productId: product._id,
      productName: product.name,
      quantity,
      salePrice: product.price,
      costPrice: product.costPrice,
      totalAmount,
      profit,
      userId: req.user.id,
    });

    // Deduct stock from product automatically
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity }, // $inc with negative number reduces stock
    });

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/sales/:id ─────────────────────────────────
// Delete a sale and restore stock
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore stock back to product
    await Product.findByIdAndUpdate(sale.productId, {
      $inc: { stock: sale.quantity },
    });

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Sale deleted and stock restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;