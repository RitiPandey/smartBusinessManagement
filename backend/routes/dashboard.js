// const express = require('express');
// const Sale = require('../models/Sale');
// const Product = require('../models/Product');
// const Customer = require('../models/Customer');
// const protect = require('../middleware/protect');

// const router = express.Router();

// router.use(protect);

// // ─── GET /api/dashboard/stats ──────────────────────────────
// // Returns all numbers the dashboard needs in one single request
// router.get('/stats', async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Get all sales and products for this user
//     const sales = await Sale.find({ userId });
//     const products = await Product.find({ userId });

//     // ── Summary numbers ──────────────────────────────────
//     const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
//     const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
//     const totalProducts = products.length;
//     const lowStockProducts = products.filter(
//       (p) => p.stock <= p.lowStockLimit
//     ).length;

//     // ── Daily sales for the last 7 days ──────────────────
//     // Build a map of date → total for last 7 days
//     const last7Days = [];
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateStr = date.toISOString().split('T')[0]; // "2025-04-05"

//       // Sum all sales that happened on this day
//       const daySales = sales.filter((s) => {
//         return s.date.toISOString().split('T')[0] === dateStr;
//       });

//       const dayTotal = daySales.reduce((sum, s) => sum + s.totalAmount, 0);

//       last7Days.push({
//         date: date.toLocaleDateString('en-IN', {
//           weekday: 'short',
//           day: 'numeric',
//           month: 'short',
//         }),
//         revenue: dayTotal,
//       });
//     }

//     // ── Monthly revenue for last 6 months ────────────────
//     const last6Months = [];
//     for (let i = 5; i >= 0; i--) {
//       const date = new Date();
//       date.setMonth(date.getMonth() - i);
//       const month = date.getMonth();
//       const year = date.getFullYear();

//       const monthSales = sales.filter((s) => {
//         const d = new Date(s.date);
//         return d.getMonth() === month && d.getFullYear() === year;
//       });

//       const monthTotal = monthSales.reduce((sum, s) => sum + s.totalAmount, 0);

//       last6Months.push({
//         month: date.toLocaleDateString('en-IN', {
//           month: 'short',
//           year: '2-digit',
//         }),
//         revenue: monthTotal,
//       });
//     }

//     // ── Top 5 selling products ────────────────────────────
//     // Group all sales by product name and sum their quantities
//     const productSalesMap = {};
//     sales.forEach((s) => {
//       if (!productSalesMap[s.productName]) {
//         productSalesMap[s.productName] = {
//           name: s.productName,
//           totalQty: 0,
//           totalRevenue: 0,
//         };
//       }
//       productSalesMap[s.productName].totalQty += s.quantity;
//       productSalesMap[s.productName].totalRevenue += s.totalAmount;
//     });

//     const topProducts = Object.values(productSalesMap)
//       .sort((a, b) => b.totalQty - a.totalQty)
//       .slice(0, 5);

//     const recommendedCombos = buildComboRecommendations(sales);
//     const trendingProducts = buildTrendingProducts(sales);

//     // ── AI Suggestions ────────────────────────────────────
//     const suggestions = generateSuggestions(
//       sales,
//       products,
//       topProducts,
//       recommendedCombos,
//       trendingProducts
//     );

//     res.json({
//       summary: {
//         totalRevenue,
//         totalProfit,
//         totalProducts,
//         lowStockProducts,
//         totalSales: sales.length,
//       },
//       last7Days,
//       last6Months,
//       topProducts,
//       recommendedCombos,
//       products, // Add products for restock modal
//       suggestions,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ─── AI Suggestions Engine ─────────────────────────────────
// // Simple logic that looks at data and gives smart advice
// function generateSuggestions(sales, products, topProducts, recommendedCombos, trendingProducts) {
//   const suggestions = [];
//   const now = new Date();

//   // Suggestion 1: Low stock warnings
//   products.forEach((p) => {
//     if (p.stock <= p.lowStockLimit) {
//       suggestions.push({
//         type: 'warning',
//         message: `Restock "${p.name}" soon — only ${p.stock} units left`,
//       });
//     }
//   });

//   // Suggestion 2: Check if sales dropped this week vs last week
//   const thisWeekSales = sales.filter((s) => {
//     const diff = (now - new Date(s.date)) / (1000 * 60 * 60 * 24);
//     return diff <= 7;
//   });
//   const lastWeekSales = sales.filter((s) => {
//     const diff = (now - new Date(s.date)) / (1000 * 60 * 60 * 24);
//     return diff > 7 && diff <= 14;
//   });

//   if (
//     lastWeekSales.length > 0 &&
//     thisWeekSales.length < lastWeekSales.length * 0.8
//   ) {
//     suggestions.push({
//       type: 'alert',
//       message:
//         'Sales are down compared to last week. Consider running a promotion.',
//     });
//   }

//   // Suggestion 3: Best performing product
//   if (sales.length > 0) {
//     const productMap = {};
//     sales.forEach((s) => {
//       productMap[s.productName] = (productMap[s.productName] || 0) + s.quantity;
//     });
//     const best = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0];
//     if (best) {
//       suggestions.push({
//         type: 'tip',
//         message: `"${best[0]}" is your top seller. Keep it well stocked.`,
//       });
//     }
//   }

//   // Suggestion 4: No sales today
//   const todaySales = sales.filter((s) => {
//     return new Date(s.date).toDateString() === now.toDateString();
//   });
//   if (todaySales.length === 0 && sales.length > 0) {
//     suggestions.push({
//       type: 'info',
//       message: 'No sales recorded today yet. Don\'t forget to log your sales.',
//     });
//   }

//   // Suggestion 5: Build bundles if combos are strong
//   if (recommendedCombos && recommendedCombos.length > 0) {
//     const topCombo = recommendedCombos[0];
//     if (topCombo.count >= 2) {
//       suggestions.push({
//         type: 'tip',
//         message: `Customers often buy ${topCombo.products[0]} with ${topCombo.products[1]}. Consider bundle pricing.`,
//       });
//     }
//   }

//   // Suggestion 6: Promote trending products
//   if (trendingProducts && trendingProducts.length > 0) {
//     const trend = trendingProducts[0];
//     if (trend.growth > 0.2) {
//       suggestions.push({
//         type: 'tip',
//         message: `${trend.name} is trending up ${Math.round(trend.growth * 100)}% in the last 30 days. Promote while momentum is high.`,
//       });
//     }
//   }

//   // If no suggestions, business is doing great
//   if (suggestions.length === 0) {
//     suggestions.push({
//       type: 'tip',
//       message: 'Everything looks good! Keep tracking your sales daily.',
//     });
//   }

//   return suggestions;
// }

// function buildComboRecommendations(sales) {
//   const combos = {};
//   const salesByDay = {};

//   sales.forEach((sale) => {
//     const dateKey = new Date(sale.date).toISOString().split('T')[0];
//     if (!salesByDay[dateKey]) {
//       salesByDay[dateKey] = new Set();
//     }
//     salesByDay[dateKey].add(sale.productName);
//   });

//   Object.values(salesByDay).forEach((productSet) => {
//     const items = [...productSet];
//     for (let i = 0; i < items.length; i += 1) {
//       for (let j = i + 1; j < items.length; j += 1) {
//         const pairKey = [items[i], items[j]].sort().join(' || ');
//         combos[pairKey] = (combos[pairKey] || 0) + 1;
//       }
//     }
//   });

//   return Object.entries(combos)
//     .map(([key, count]) => {
//       const [first, second] = key.split(' || ');
//       return {
//         products: [first, second],
//         count,
//       };
//     })
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 3);
// }

// function buildTrendingProducts(sales) {
//   const now = new Date();
//   const thirtyDaysAgo = new Date(now);
//   thirtyDaysAgo.setDate(now.getDate() - 30);
//   const sixtyDaysAgo = new Date(now);
//   sixtyDaysAgo.setDate(now.getDate() - 60);

//   const recentSales = sales.filter((s) => new Date(s.date) > thirtyDaysAgo);
//   const previousSales = sales.filter(
//     (s) => new Date(s.date) > sixtyDaysAgo && new Date(s.date) <= thirtyDaysAgo
//   );

//   const buildMap = (list) =>
//     list.reduce((map, sale) => {
//       map[sale.productName] = (map[sale.productName] || 0) + sale.quantity;
//       return map;
//     }, {});

//   const recentMap = buildMap(recentSales);
//   const previousMap = buildMap(previousSales);

//   return Object.keys({ ...recentMap, ...previousMap })
//     .map((name) => {
//       const recentQty = recentMap[name] || 0;
//       const prevQty = previousMap[name] || 0;
//       const growth = prevQty === 0 ? (recentQty > 0 ? 1 : 0) : (recentQty - prevQty) / prevQty;
//       return { name, recentQty, prevQty, growth };
//     })
//     .filter((item) => item.recentQty > 0)
//     .sort((a, b) => b.growth - a.growth)
//     .slice(0, 3);
// }

// module.exports = router;
const express = require('express');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const protect = require('../middleware/protect');

const router = express.Router();

// All dashboard routes require the user to be logged in
router.use(protect);

// ─── GET /api/dashboard/stats ──────────────────────────────────────────────
// This is the single most important route in the whole app.
// The dashboard calls this once and gets everything it needs —
// summary numbers, charts, top products, and AI suggestions.
// We do all the heavy lifting here so the frontend stays clean.
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch everything we need in parallel — much faster than sequential awaits
    const [sales, products, customers] = await Promise.all([
      Sale.find({ userId }),
      Product.find({ userId }),
      Customer.find({ userId }),
    ]);

    // ── Summary numbers ──────────────────────────────────────────────────
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalProfit  = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalProducts = products.length;
    const totalCustomers = customers.length;

    const lowStockProducts = products.filter(
      (p) => p.stock <= p.lowStockLimit
    ).length;

    // ── Daily sales — last 7 days ─────────────────────────────────────────
    // We build one entry per day so the bar chart always shows 7 bars
    // even if some days had zero sales
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const daySales = sales.filter((s) => {
        const saleDate = new Date(s.date);
        return saleDate >= date && saleDate < nextDay;
      });

      last7Days.push({
        date: date.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        revenue: daySales.reduce((sum, s) => sum + s.totalAmount, 0),
        profit:  daySales.reduce((sum, s) => sum + s.profit, 0),
        count:   daySales.length,
      });
    }

    // ── Monthly revenue — last 6 months ───────────────────────────────────
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year  = date.getFullYear();

      const monthSales = sales.filter((s) => {
        const d = new Date(s.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      last6Months.push({
        month: date.toLocaleDateString('en-IN', {
          month: 'short',
          year: '2-digit',
        }),
        revenue: monthSales.reduce((sum, s) => sum + s.totalAmount, 0),
        profit:  monthSales.reduce((sum, s) => sum + s.profit, 0),
      });
    }

    // ── Top 5 selling products ─────────────────────────────────────────────
    // Group all sales by product name and rank by quantity sold
    const productSalesMap = {};
    sales.forEach((s) => {
      if (!productSalesMap[s.productName]) {
        productSalesMap[s.productName] = {
          name: s.productName,
          totalQty: 0,
          totalRevenue: 0,
          totalProfit: 0,
        };
      }
      productSalesMap[s.productName].totalQty     += s.quantity;
      productSalesMap[s.productName].totalRevenue += s.totalAmount;
      productSalesMap[s.productName].totalProfit  += s.profit;
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5);

    // ── Today's snapshot ───────────────────────────────────────────────────
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySales = sales.filter((s) => new Date(s.date) >= todayStart);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const todayProfit  = todaySales.reduce((sum, s) => sum + s.profit, 0);

    // ── AI suggestions ─────────────────────────────────────────────────────
    const suggestions = generateSuggestions(sales, products, customers);

    // Send everything the dashboard needs in one clean response
    res.json({
      summary: {
        totalRevenue,
        totalProfit,
        totalProducts,
        totalCustomers,
        lowStockProducts,
        totalSales: sales.length,
        todayRevenue,
        todayProfit,
        todaySalesCount: todaySales.length,
      },
      last7Days,
      last6Months,
      topProducts,
      suggestions,
    });
  } catch (err) {
    console.log('Dashboard stats error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ─── AI Suggestions Engine ─────────────────────────────────────────────────
// This function is the "brain" of the dashboard.
// It looks at real data and generates specific, actionable advice
// — the kind a business consultant would give, but automatically.
function generateSuggestions(sales, products, customers) {
  const suggestions = [];
  const now = new Date();

  // ── 1. Low stock warnings ────────────────────────────────────────────────
  // Alert the owner before a product runs out completely
  products.forEach((p) => {
    if (p.stock <= p.lowStockLimit && p.stock > 0) {
      suggestions.push({
        type: 'warning',
        message: `Restock "${p.name}" soon — only ${p.stock} unit${p.stock > 1 ? 's' : ''} left`,
      });
    }
    // Separate message for products that are completely out
    if (p.stock === 0) {
      suggestions.push({
        type: 'alert',
        message: `"${p.name}" is completely out of stock. Restock immediately.`,
      });
    }
  });

  // ── 2. Weekly sales comparison ───────────────────────────────────────────
  // Compare this week's sales to last week — detect drops early
  const msPerDay = 1000 * 60 * 60 * 24;

  const thisWeekSales = sales.filter((s) => {
    const diff = (now - new Date(s.date)) / msPerDay;
    return diff <= 7;
  });
  const lastWeekSales = sales.filter((s) => {
    const diff = (now - new Date(s.date)) / msPerDay;
    return diff > 7 && diff <= 14;
  });

  if (lastWeekSales.length > 0 && thisWeekSales.length < lastWeekSales.length * 0.8) {
    const drop = Math.round(
      ((lastWeekSales.length - thisWeekSales.length) / lastWeekSales.length) * 100
    );
    suggestions.push({
      type: 'alert',
      message: `Sales dropped ${drop}% compared to last week. Consider running a promotion.`,
    });
  }

  // ── 3. Best selling product ──────────────────────────────────────────────
  // Identify the top seller and remind the owner to keep it in stock
  if (sales.length > 0) {
    const productMap = {};
    sales.forEach((s) => {
      productMap[s.productName] = (productMap[s.productName] || 0) + s.quantity;
    });
    const best = Object.entries(productMap).sort((a, b) => b[1] - a[1])[0];
    if (best) {
      suggestions.push({
        type: 'tip',
        message: `"${best[0]}" is your best seller with ${best[1]} units sold. Keep it well stocked.`,
      });
    }
  }

  // ── 4. No sales today ────────────────────────────────────────────────────
  // Gentle reminder if nothing has been logged today
  const todayStr = now.toDateString();
  const todaySales = sales.filter(
    (s) => new Date(s.date).toDateString() === todayStr
  );
  if (todaySales.length === 0 && sales.length > 0) {
    suggestions.push({
      type: 'info',
      message: "No sales recorded today yet. Don't forget to log your daily sales.",
    });
  }

  // ── 5. CRM — inactive customers ──────────────────────────────────────────
  // Find customers who haven't bought anything in 30+ days
  // These are people the owner should reach out to personally
  const inactiveCustomers = customers.filter((c) => {
    if (!c.lastPurchaseDate) return false;
    const daysSince = (now - new Date(c.lastPurchaseDate)) / msPerDay;
    return daysSince > 30;
  });

  if (inactiveCustomers.length > 0) {
    const preview = inactiveCustomers
      .slice(0, 2)
      .map((c) => c.name)
      .join(', ');
    const more =
      inactiveCustomers.length > 2
        ? ` and ${inactiveCustomers.length - 2} more`
        : '';
    suggestions.push({
      type: 'crm',
      message: `${preview}${more} haven't purchased in over 30 days. Time to reach out.`,
    });
  }

  // ── 6. VIP customer recognition ──────────────────────────────────────────
  const vipCustomers = customers.filter((c) => c.tag === 'VIP');
  if (vipCustomers.length > 0) {
    suggestions.push({
      type: 'tip',
      message: `You have ${vipCustomers.length} VIP customer${vipCustomers.length > 1 ? 's' : ''}. Make sure they always get priority service.`,
    });
  }

  // ── 7. Good health fallback ──────────────────────────────────────────────
  // If nothing needs attention, say so
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'tip',
      message: 'Everything looks healthy! Keep logging your sales every day.',
    });
  }

  return suggestions;
}

module.exports = router;