// const mongoose = require('mongoose');

// const customerSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     phone: {
//       type: String,
//       trim: true,
//     },
//     email: {
//       type: String,
//       trim: true,
//     },
//     notes: {
//       type: String,
//     },
//     totalPurchases: {
//       type: Number,
//       default: 0,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Customer', customerSchema);
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    // CRM tag — set manually by the owner
    tag: {
      type: String,
      enum: ['New', 'Regular', 'VIP', 'Inactive'],
      default: 'New',
    },
    // Updated automatically every time a purchase is recorded
    lastPurchaseDate: {
      type: Date,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);