// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';
// import {
//   TrendingUp,
//   Package,
//   ShoppingCart,
//   AlertTriangle,
//   IndianRupee,
//   Lightbulb,
//   Zap,
//   Plus,
//   X,
//   BarChart3,
//   Users,
//   Target,
//   Award,
//   Activity,
//   Star,
//   Crown,
//   Sparkles,
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { useAuth } from '../context/AuthContext';
// import api from '../api/axios';

// // Color styles for different suggestion types
// const suggestionStyles = {
//   warning: {
//     bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
//     border: 'border-amber-200',
//     text: 'text-amber-800',
//     dot: 'bg-gradient-to-r from-amber-400 to-orange-400',
//     icon: 'text-amber-600',
//   },
//   alert: {
//     bg: 'bg-gradient-to-r from-red-50 to-red-50',
//     border: 'border-red-200',
//     text: 'text-red-700',
//     dot: 'bg-gradient-to-r from-red-400 to-pink-400',
//     icon: 'text-red-600',
//   },
//   tip: {
//     bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
//     border: 'border-green-200',
//     text: 'text-green-700',
//     dot: 'bg-gradient-to-r from-green-400 to-emerald-400',
//     icon: 'text-green-600',
//   },
//   info: {
//     bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
//     border: 'border-blue-200',
//     text: 'text-blue-700',
//     dot: 'bg-gradient-to-r from-blue-400 to-indigo-400',
//     icon: 'text-blue-600',
//   },crm: {
//     bg: 'bg-purple-50',
//     border: 'border-purple-200',
//     text: 'text-purple-700',
//     dot: 'bg-purple-400',
//   },
// };

// const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// export default function Dashboard() {
//   // Authentication and navigation hooks
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // Component state management
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showRestockModal, setShowRestockModal] = useState(false);

//   // Form state for modals
//   const [restockForm, setRestockForm] = useState({
//     productId: '',
//     quantity: '',
//   });

//   // Load dashboard data when component mounts
//   useEffect(() => {
//     fetchStats();
//   }, []);

//   // Fetch dashboard statistics from the API
//   const fetchStats = async () => {
//     try {
//       const res = await api.get('/dashboard/stats');
//       setStats(res.data);
//     } catch (error) {
//       toast.error('Failed to load dashboard data. Please try again.');
//       console.error('Dashboard fetch error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle AI suggestion actions (bundle creation or restocking)
//   const handleActionClick = (suggestion) => {
//     if (suggestion.message.includes('Restock')) {
//       setShowRestockModal(true);
//     }
//   };

//   // Quick action handlers for navigation and dashboard functions
//   const handleQuickActions = {
//     // Navigate to inventory page to add new products
//     addProduct: () => {
//       navigate('/inventory');
//       toast.success('Taking you to Inventory Management');
//     },

//     // Navigate to sales page to create new sales
//     newSale: () => {
//       navigate('/sales');
//       toast.success('Taking you to Sales Management');
//     },

//     // Navigate to customers page to add new customers
//     addCustomer: () => {
//       navigate('/customers');
//       toast.success('Taking you to Customer Management');
//     },

//     // Refresh dashboard data and scroll to top
//     viewReports: () => {
//       fetchStats();
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       toast.success('Dashboard refreshed with latest insights');
//     },
//   };

//   const handleRestockProduct = async (e) => {
//     e.preventDefault();
//     if (!restockForm.productId || !restockForm.quantity) {
//       toast.error('Please fill all fields');
//       return;
//     }
//     try {
//       await api.put(`/products/${restockForm.productId}`, {
//         stock: parseInt(restockForm.quantity),
//       });
//       toast.success('Product restocked successfully');
//       setShowRestockModal(false);
//       setRestockForm({ productId: '', quantity: '' });
//       fetchStats(); // Refresh dashboard
//     } catch (error) {
//       toast.error('Failed to restock product');
//       console.error('Restock error:', error);
//     }
//   };

//   // Show loading spinner while fetching data
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading your business insights...</p>
//         </div>
//       </div>
//     );
//   }

//   // Handle case where stats couldn't be loaded
//   if (!stats) return null;

//   // Destructure stats data for easier access
//   const { summary, last7Days, last6Months, topProducts, recommendedCombos = [], trendingProducts = [], suggestions } = stats;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
//       {/* Animated background elements for visual appeal */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-teal-200/30 rounded-full animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-100/20 to-pink-100/20 rounded-full animate-pulse delay-2000"></div>
//       </div>

//       <div className="relative z-10 p-6 space-y-8">

//         {/* Professional Header */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
//                   <Crown className="w-6 h-6 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
//                     SmartBMS Dashboard
//                   </h1>
//                   <p className="text-gray-600 text-sm">Intelligent Business Management System</p>
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h2>
//               <p className="text-gray-600">{user?.shopName}</p>
//               <div className="flex items-center gap-2 mt-2">
//                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
//                 <span className="text-sm text-gray-600">Live Data</span>
//               </div>
//             </div>
//           </div>

//           {/* Quick Stats Banner */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-blue-100 text-sm">Today's Revenue</p>
//                   <p className="text-2xl font-bold">₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
//                 </div>
//                 <IndianRupee className="w-8 h-8 opacity-80" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className=" from-blue-500 to-blue-600 text-sm">Total Profit</p>
//                   <p className="text-2xl font-bold">₹{summary.totalProfit.toLocaleString('en-IN')}</p>
//                 </div>
//                 <TrendingUp className="w-8 h-8 opacity-80" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-purple-100 text-sm">Products</p>
//                   <p className="text-2xl font-bold">{summary.totalProducts}</p>
//                 </div>
//                 <Package className="w-8 h-8 opacity-80" />
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-amber-100 text-sm">Low Stock Alert</p>
//                   <p className="text-2xl font-bold">{summary.lowStockProducts}</p>
//                 </div>
//                 <AlertTriangle className="w-8 h-8 opacity-80" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Dashboard Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//           {/* Charts Section - Takes 2 columns */}
//           <div className="lg:col-span-2 space-y-8">

//             {/* Sales Analytics */}
//             <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
//               <div className="flex items-center gap-3 mb-8">
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
//                   <BarChart3 className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">Sales Analytics</h2>
//                   <p className="text-gray-600 text-sm">Performance insights & trends</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 {/* Daily Sales Chart */}
//                 <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-100">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
//                     <Activity className="w-5 h-5 text-blue-600" />
//                     Last 7 Days Sales
//                   </h3>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <BarChart data={last7Days} barSize={32}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                       <XAxis
//                         dataKey="date"
//                         tick={{ fontSize: 12, fill: '#64748b' }}
//                         axisLine={false}
//                         tickLine={false}
//                       />
//                       <YAxis
//                         tick={{ fontSize: 12, fill: '#64748b' }}
//                         axisLine={false}
//                         tickLine={false}
//                         tickFormatter={(v) => `₹${v}`}
//                       />
//                       <Tooltip
//                         formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
//                         contentStyle={{
//                           borderRadius: '16px',
//                           border: '1px solid #e2e8f0',
//                           background: 'white',
//                           boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
//                           fontSize: '14px',
//                         }}
//                       />
//                       <Bar dataKey="revenue" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
//                       <defs>
//                         <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="0%" stopColor="#6366f1" />
//                           <stop offset="100%" stopColor="#8b5cf6" />
//                         </linearGradient>
//                       </defs>
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* Monthly Revenue Chart */}
//                 <div className="bg-gradient-to-br from-slate-50 to-green-50 rounded-2xl p-6 border border-slate-100">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
//                     <TrendingUp className="w-5 h-5 text-green-600" />
//                     Monthly Revenue Trend
//                   </h3>
//                   <ResponsiveContainer width="100%" height={250}>
//                     <LineChart data={last6Months}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                       <XAxis
//                         dataKey="month"
//                         tick={{ fontSize: 12, fill: '#64748b' }}
//                         axisLine={false}
//                         tickLine={false}
//                       />
//                       <YAxis
//                         tick={{ fontSize: 12, fill: '#64748b' }}
//                         axisLine={false}
//                         tickLine={false}
//                         tickFormatter={(v) => `₹${v}`}
//                       />
//                       <Tooltip
//                         formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
//                         contentStyle={{
//                           borderRadius: '16px',
//                           border: '1px solid #e2e8f0',
//                           background: 'white',
//                           boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
//                           fontSize: '14px',
//                         }}
//                       />
//                       <Line
//                         type="monotone"
//                         dataKey="revenue"
//                         stroke="#10b981"
//                         strokeWidth={3}
//                         dot={{ fill: '#10b981', r: 6, strokeWidth: 2, stroke: 'white' }}
//                         activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>

//             {/* Top Products & AI Insights */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

//               {/* Top Products */}
//               <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
//                 <div className="flex items-center gap-3 mb-8">
//                   <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
//                     <Award className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-900">Top Performers</h3>
//                     <p className="text-gray-600 text-sm">Your best-selling products</p>
//                   </div>
//                 </div>

//                 {topProducts.length === 0 ? (
//                   <div className="text-center py-12">
//                     <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-500">No sales data yet</p>
//                     <p className="text-sm text-gray-400 mt-1">Start making sales to see insights</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-6">
//                     {topProducts.slice(0, 5).map((product, index) => {
//                       const maxQty = topProducts[0].totalQty;
//                       const widthPercent = Math.round((product.totalQty / maxQty) * 100);

//                       return (
//                         <div key={product.name} className="group">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center gap-3">
//                               <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
//                                 index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
//                                 index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
//                                 index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
//                                 'bg-gradient-to-r from-slate-400 to-slate-500'
//                               }`}>
//                                 {index + 1}
//                               </div>
//                               <div>
//                                 <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
//                                   {product.name}
//                                 </p>
//                                 <p className="text-sm text-gray-500">{product.totalQty} units sold</p>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <p className="text-lg font-bold text-gray-900">
//                                 ₹{(product.totalQty * (product.price || 0)).toLocaleString('en-IN')}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
//                             <div
//                               className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
//                               style={{ width: `${widthPercent}%` }}
//                             />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {/* Recommended Bundles */}
//                 <div className="mt-8 pt-6 border-t border-gray-100">
//                   <div className="flex items-center gap-2 mb-4">
//                     <Sparkles className="w-5 h-5 text-purple-600" />
//                     <h4 className="font-semibold text-gray-900">Smart Bundles</h4>
//                   </div>

//                   {recommendedCombos.length === 0 ? (
//                     <p className="text-sm text-gray-500">More sales data needed for bundle recommendations</p>
//                   ) : (
//                     <div className="space-y-3">
//                       {recommendedCombos.slice(0, 3).map((combo, index) => (
//                         <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
//                           <div className="flex items-center gap-2 mb-2">
//                             <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
//                               <Plus className="w-3 h-3 text-white" />
//                             </div>
//                             <p className="font-medium text-gray-900">
//                               {combo.products[0]} + {combo.products[1]}
//                             </p>
//                           </div>
//                           <p className="text-sm text-gray-600">
//                             Sold together {combo.count} time{combo.count > 1 ? 's' : ''}
//                           </p>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* AI Insights */}
//               <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
//                 <div className="flex items-center gap-3 mb-8">
//                   <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
//                     <Lightbulb className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
//                     <p className="text-gray-600 text-sm">Smart recommendations for growth</p>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   {suggestions.map((suggestion, index) => {
//                     const style = suggestionStyles[suggestion.type] || suggestionStyles.info;
//                     const hasAction = suggestion.message.includes('Restock') ||
//                                      suggestion.message.includes('bundle') ||
//                                      suggestion.message.includes('buy');

//                     return (
//                       <div
//                         key={index}
//                         className={`p-4 rounded-2xl border ${style.bg} ${style.border} hover:shadow-lg transition-all duration-300`}
//                         style={{ animationDelay: `${index * 100}ms` }}
//                       >
//                         <div className="flex items-start gap-3">
//                           <div className={`w-3 h-3 rounded-full mt-1.5 ${style.dot} animate-pulse`} />
//                           <div className="flex-1">
//                             <p className={`text-sm font-medium ${style.text}`}>{suggestion.message}</p>
//                           </div>
//                           {hasAction && (
//                             <button
//                               onClick={() => handleActionClick(suggestion)}
//                               className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium border border-gray-200 transition-all duration-200 hover:shadow-md transform hover:scale-105"
//                             >
//                               <Zap className="w-4 h-4" />
//                               Take Action
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {/* AI Assistant Summary */}
//                 <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
//                       <Star className="w-4 h-4 text-white" />
//                     </div>
//                     <h4 className="font-bold text-gray-900">AI Business Assistant</h4>
//                   </div>

//                   {trendingProducts.length > 0 && (
//                     <div className="mb-4 p-3 bg-white/60 rounded-xl">
//                       <p className="text-sm text-gray-700">
//                         <span className="font-semibold text-indigo-600">Trending:</span> {trendingProducts[0].name}
//                         <span className="text-green-600 font-medium"> (+{Math.round(trendingProducts[0].growth * 100)}%)</span>
//                       </p>
//                     </div>
//                   )}

//                   {recommendedCombos.length > 0 && (
//                     <div className="p-3 bg-white/60 rounded-xl">
//                       <p className="text-sm text-gray-700">
//                         <span className="font-semibold text-purple-600">Bundle Opportunity:</span> {recommendedCombos[0].products[0]} + {recommendedCombos[0].products[1]}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//             </div>

//           </div>

//           {/* Sidebar - Takes 1 column */}
//           <div className="space-y-8">

//             {/* Quick Actions */}
//             <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
//                   <Target className="w-5 h-5 text-white" />
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
//               </div>

//               <div className="space-y-3">
//                 <button
//                   onClick={handleQuickActions.addProduct}
//                   className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                 >
//                   <Plus className="w-5 h-5" />
//                   <span className="font-medium">Add New Product</span>
//                 </button>

//                 <button
//                   onClick={handleQuickActions.newSale}
//                   className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                 >
//                   <ShoppingCart className="w-5 h-5" />
//                   <span className="font-medium">New Sale</span>
//                 </button>

//                 <button
//                   onClick={handleQuickActions.addCustomer}
//                   className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                 >
//                   <Users className="w-5 h-5" />
//                   <span className="font-medium">Add Customer</span>
//                 </button>

//                 <button
//                   onClick={handleQuickActions.viewReports}
//                   className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                 >
//                   <BarChart3 className="w-5 h-5" />
//                   <span className="font-medium">View Reports</span>
//                 </button>
//               </div>
//             </div>

//             {/* Performance Metrics */}
//             <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
//                   <Activity className="w-5 h-5 text-white" />
//                 </div>
//                 <h3 className="text-lg font-bold text-gray-900">Performance</h3>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
//                       <TrendingUp className="w-4 h-4 text-white" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Profit Margin</span>
//                   </div>
//                   <span className="text-lg font-bold text-green-600">
//                     {summary.totalRevenue > 0 ? Math.round((summary.totalProfit / summary.totalRevenue) * 100) : 0}%
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
//                       <ShoppingCart className="w-4 h-4 text-white" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Avg Order Value</span>
//                   </div>
//                   <span className="text-lg font-bold text-blue-600">
//                     ₹{summary.totalRevenue > 0 ? Math.round(summary.totalRevenue / (last7Days.reduce((sum, day) => sum + (day.sales || 0), 0) || 1)).toLocaleString('en-IN') : 0}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
//                       <Package className="w-4 h-4 text-white" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Stock Efficiency</span>
//                   </div>
//                   <span className="text-lg font-bold text-purple-600">
//                     {summary.totalProducts > 0 ? Math.round(((summary.totalProducts - summary.lowStockProducts) / summary.totalProducts) * 100) : 0}%
//                   </span>
//                 </div>
//               </div>
//             </div>

//           </div>

//         </div>

//         {/* Restock Product Modal */}
//         {showRestockModal && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
//             <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 animate-scaleIn">
//               <div className="p-8">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-3">
//                     <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
//                       <Package className="w-6 h-6 text-white" />
//                     </div>
//                     <div>
//                       <h2 className="text-2xl font-bold text-gray-900">Restock Product</h2>
//                       <p className="text-gray-600 text-sm">Update inventory levels</p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => setShowRestockModal(false)}
//                     className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
//                   >
//                     <X size={20} />
//                   </button>
//                 </div>

//                 <form onSubmit={handleRestockProduct} className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Select Product
//                     </label>
//                     <select
//                       value={restockForm.productId}
//                       onChange={(e) => setRestockForm({...restockForm, productId: e.target.value})}
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white transition-all duration-200"
//                       required
//                     >
//                       <option value="">Choose a product...</option>
//                       {stats?.products?.map((product) => (
//                         <option key={product._id} value={product._id}>
//                           {product.name} (Current: {product.stock})
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       New Stock Quantity
//                     </label>
//                     <input
//                       type="number"
//                       value={restockForm.quantity}
//                       onChange={(e) => setRestockForm({...restockForm, quantity: e.target.value})}
//                       placeholder="Enter new stock level"
//                       min="0"
//                       className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
//                       required
//                     />
//                   </div>

//                   <div className="flex gap-4 pt-4">
//                     <button
//                       type="button"
//                       onClick={() => setShowRestockModal(false)}
//                       className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all duration-200"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
//                     >
//                       Update Stock
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, Package, ShoppingCart,
  AlertTriangle, IndianRupee, Lightbulb,
  Users, ArrowUpRight, Calendar, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── Suggestion type styles ───────────────────────────────────────────────────
// Each suggestion type gets its own colour so the owner can
// tell at a glance what needs urgent attention vs what is just a tip
const suggestionStyles = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    dot: 'bg-amber-400',
    label: 'Stock Alert',
    labelBg: 'bg-amber-100 text-amber-600',
  },
  alert: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-400',
    label: 'Urgent',
    labelBg: 'bg-red-100 text-red-600',
  },
  tip: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-400',
    label: 'Tip',
    labelBg: 'bg-green-100 text-green-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
    label: 'Reminder',
    labelBg: 'bg-blue-100 text-blue-600',
  },
  crm: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
    label: 'CRM',
    labelBg: 'bg-purple-100 text-purple-600',
  },
};

// ── Custom tooltip for charts ────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-semibold">
          ₹{entry.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-100 rounded-2xl" />
          <div className="h-72 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const {
    summary,
    last7Days,
    last6Months,
    topProducts,
    suggestions,
  } = stats;

  // Get current time to personalise the greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="space-y-8">

      {/* ── Welcome header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here is what is happening with{' '}
            <span className="font-medium text-gray-700">{user?.shopName}</span> today
          </p>
        </div>

        {/* Today's quick snapshot */}
        <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Calendar size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Today's revenue</p>
            <p className="text-base font-bold text-gray-900">
              ₹{summary.todayRevenue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div>
            <p className="text-xs text-gray-400">Sales today</p>
            <p className="text-base font-bold text-gray-900">
              {summary.todaySalesCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Total revenue</p>
            <div className="p-2 bg-indigo-50 rounded-xl">
              <IndianRupee size={15} className="text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        {/* Total profit */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Total profit</p>
            <div className="p-2 bg-green-50 rounded-xl">
              <TrendingUp size={15} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₹{summary.totalProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-1">After cost deduction</p>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Products</p>
            <div className="p-2 bg-blue-50 rounded-xl">
              <Package size={15} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalProducts}
          </p>
          {summary.lowStockProducts > 0 ? (
            <p className="text-xs text-amber-500 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle size={11} />
              {summary.lowStockProducts} low stock
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">All stocked up</p>
          )}
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">Customers</p>
            <div className="p-2 bg-purple-50 rounded-xl">
              <Users size={15} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {summary.totalCustomers}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {summary.totalSales} total sales
          </p>
        </div>

      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Daily sales — bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Daily sales
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-indigo-50 px-3 py-1.5 rounded-xl">
              <Zap size={12} />
              Live data
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7Days} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                name="Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly revenue — line chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Monthly revenue
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-xl">
              <TrendingUp size={12} />
              Trend
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ── Bottom row — top products + AI suggestions ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top selling products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <ShoppingCart size={15} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Top selling products
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">By units sold</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-gray-300" />
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingCart size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No sales data yet</p>
              <p className="text-gray-300 text-xs mt-1">
                Record your first sale to see top products
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {topProducts.map((product, index) => {
                const maxQty = topProducts[0].totalQty;
                const widthPercent = Math.round((product.totalQty / maxQty) * 100);
                const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700'];

                return (
                  <div key={product.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-sm font-bold w-5 ${rankColors[index] || 'text-gray-300'}`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                          {product.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {product.totalQty} sold
                        </span>
                        <p className="text-xs text-gray-400">
                          ₹{product.totalRevenue.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-gray-100 rounded-full ml-7">
                      <div
                        className="h-2 bg-gradient-to-r from-indigo-400 to-primary rounded-full transition-all duration-700"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Smart Suggestions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Lightbulb size={15} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Smart suggestions
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  AI analysis of your business
                </p>
              </div>
            </div>
            <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2.5 py-1 rounded-xl">
              {suggestions.length} insight{suggestions.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const style =
                suggestionStyles[suggestion.type] || suggestionStyles.info;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border ${style.bg} ${style.border}`}
                >
                  {/* Coloured dot */}
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />

                  <div className="flex-1 min-w-0">
                    {/* Type label */}
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${style.labelBg}`}>
                      {style.label}
                    </span>
                    <p className={`text-sm leading-relaxed ${style.text}`}>
                      {suggestion.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}