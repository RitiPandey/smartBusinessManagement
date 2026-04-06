// const express = require('express');
// const Customer = require('../models/Customer');
// const protect = require('../middleware/protect');

// const router = express.Router();

// router.use(protect);

// // ─── GET /api/customers ────────────────────────────────────
// // Get all customers for the logged in user
// router.get('/', async (req, res) => {
//   try {
//     const customers = await Customer.find({ userId: req.user.id }).sort({
//       createdAt: -1,
//     });
//     res.json(customers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── POST /api/customers ───────────────────────────────────
// // Add a new customer
// router.post('/', async (req, res) => {
//   const { name, phone, email, notes } = req.body;

//   if (!name) {
//     return res.status(400).json({ message: 'Customer name is required' });
//   }

//   try {
//     const customer = await Customer.create({
//       name,
//       phone: phone || '',
//       email: email || '',
//       notes: notes || '',
//       totalPurchases: 0,
//       userId: req.user.id,
//     });
//     res.status(201).json(customer);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── PUT /api/customers/:id ────────────────────────────────
// // Update customer details
// router.put('/:id', async (req, res) => {
//   try {
//     const customer = await Customer.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!customer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }

//     const updated = await Customer.findByIdAndUpdate(
//       req.params.id,
//       { $set: req.body },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── DELETE /api/customers/:id ─────────────────────────────
// // Delete a customer
// router.delete('/:id', async (req, res) => {
//   try {
//     const customer = await Customer.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!customer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }

//     await Customer.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Customer deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── PUT /api/customers/:id/purchase ──────────────────────
// // Add a purchase amount to a customer's total
// router.put('/:id/purchase', async (req, res) => {
//   const { amount } = req.body;

//   if (!amount || amount <= 0) {
//     return res.status(400).json({ message: 'Valid amount is required' });
//   }

//   try {
//     const customer = await Customer.findOne({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!customer) {
//       return res.status(404).json({ message: 'Customer not found' });
//     }

//     // Add the amount to their running total
//     const updated = await Customer.findByIdAndUpdate(
//       req.params.id,
//       { $inc: { totalPurchases: amount } },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const Customer = require('../models/Customer');
const CustomerPurchase = require('../models/CustomerPurchase');
const Product = require('../models/Product');
const protect = require('../middleware/protect');

const router = express.Router();

router.use(protect);

// ─── GET /api/customers ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/customers ───────────────────────────────────
router.post('/', async (req, res) => {
  const { name, phone, email, notes } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Customer name is required' });
  }

  try {
    const customer = await Customer.create({
      name,
      phone: phone || '',
      email: email || '',
      notes: notes || '',
      totalPurchases: 0,
      userId: req.user.id,
    });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/customers/:id ────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/customers/:id ─────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Also delete all purchase history for this customer
    await CustomerPurchase.deleteMany({ customerId: req.params.id });
    await Customer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/customers/:id/purchases ─────────────────────
// Get full purchase history for one customer
router.get('/:id/purchases', async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const purchases = await CustomerPurchase.find({
      customerId: req.params.id,
    }).sort({ date: -1 }); // newest first

    res.json({ customer, purchases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/customers/:id/purchases ────────────────────
// Record a new purchase for a customer
// This links to a real product from inventory
router.post('/:id/purchases', async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: 'Product and quantity are required' });
  }

  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Get the real product so we know price and name
    const product = await Product.findOne({
      _id: productId,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} units available`,
      });
    }

    const totalAmount = product.price * quantity;

    // Save purchase record
    const purchase = await CustomerPurchase.create({
      customerId: customer._id,
      productId: product._id,
      productName: product.name,
      quantity,
      pricePerUnit: product.price,
      totalAmount,
      userId: req.user.id,
    });

    // Add to customer total
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $inc: { totalPurchases: totalAmount } },
      { new: true }
    );

    // Deduct stock from product automatically
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity },
    });

    res.status(201).json({ purchase, customer: updatedCustomer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/customers/:id/purchases/:purchaseId ──────
// Delete a purchase and restore stock
router.delete('/:id/purchases/:purchaseId', async (req, res) => {
  try {
    const purchase = await CustomerPurchase.findOne({
      _id: req.params.purchaseId,
      customerId: req.params.id,
      userId: req.user.id,
    });

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    // Restore stock
    await Product.findByIdAndUpdate(purchase.productId, {
      $inc: { stock: purchase.quantity },
    });

    // Subtract from customer total
    await Customer.findByIdAndUpdate(req.params.id, {
      $inc: { totalPurchases: -purchase.totalAmount },
    });

    await CustomerPurchase.findByIdAndDelete(req.params.purchaseId);

    res.json({ message: 'Purchase deleted and stock restored' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;