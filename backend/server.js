const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
// const corsOptions = {
//   origin: [
//     'http://localhost:5173',
//     'smart-business-management-liard.vercel.app',   // your actual URL here
//   ],
//   credentials: true,
// };
// app.use(cors(corsOptions));
app.use(cors());  // <-- for development, allow all origins. Change this in production!
app.use(express.json());  // ← must be BEFORE the routes
// Route imports (we add these day by day)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const customerRoutes = require('./routes/customers');
const dashboardRoutes = require('./routes/dashboard');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((err) => {
    console.log('MongoDB connection FAILED:');
    console.log(err.message); // this will tell you exactly what went wrong
    process.exit(1);
  });