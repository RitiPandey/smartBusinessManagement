import { useState, useEffect, useRef } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Search,
  ScanLine,
  TrendingUp,
  CheckCircle,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import BarcodeScanner from '../components/BarcodeScanner';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  costPrice: '',
  stock: '',
  lowStockLimit: '5',
  barcode: '',
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannerMode, setScannerMode] = useState('add'); // 'add' or 'search'
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Focus search input when it opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      lowStockLimit: product.lowStockLimit,
      barcode: product.barcode || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Called when scanner reads a barcode while adding a product
  const handleScanForAdd = (code) => {
    setShowScanner(false);
    setForm((prev) => ({ ...prev, barcode: code }));
    toast.success(`Barcode scanned: ${code}`);
  };

  // Called when scanner reads a barcode for searching a product
  const handleScanForSearch = async (code) => {
    setShowScanner(false);
    try {
      const res = await api.get(`/products/barcode/${code}`);
      // Open that product for editing directly
      openEditModal(res.data);
      toast.success(`Found: ${res.data.name}`);
    } catch (err) {
      console.error('Product not found for barcode:', code, err);
      toast.error('Product not found. Add it manually.');
      // Pre-fill barcode and open add modal
      setForm({ ...emptyForm, barcode: code });
      setShowModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.price || !form.costPrice) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        costPrice: Number(form.costPrice),
        stock: Number(form.stock),
        lowStockLimit: Number(form.lowStockLimit),
        barcode: form.barcode,
      };

      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        setProducts(products.map((p) =>
          p._id === editingProduct._id ? res.data : p
        ));
        toast.success('Product updated');
      } else {
        const res = await api.post('/products', payload);
        setProducts([res.data, ...products]);
        toast.success('Product added');
      }
      closeModal();
    } catch (err) {
      console.error('Failed to add/update product:', err);
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter((p) => p._id !== productId));
      toast.success('Product deleted');
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product');
    }
  };

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockLimit);

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.barcode?.includes(q)
    );
  });

  const getStockStats = () => {
    const total = products.length;
    const lowStock = products.filter(p => p.stock <= p.lowStockLimit).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const inStock = total - lowStock - outOfStock;

    return { total, lowStock, outOfStock, inStock };
  };

  const stats = getStockStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Professional Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Package size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Inventory Management</h1>
                  <p className="text-indigo-100 text-lg">Track and manage your product inventory</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Package size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-indigo-100 text-sm">Total Products</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-xl">
                      <CheckCircle size={20} className="text-green-300" />
                    </div>
                    <div>
                      <p className="text-indigo-100 text-sm">In Stock</p>
                      <p className="text-2xl font-bold text-white">{stats.inStock}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-xl">
                      <AlertTriangle size={20} className="text-yellow-300" />
                    </div>
                    <div>
                      <p className="text-indigo-100 text-sm">Low Stock</p>
                      <p className="text-2xl font-bold text-white">{stats.lowStock}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-xl">
                      <TrendingUp size={20} className="text-red-300" />
                    </div>
                    <div>
                      <p className="text-indigo-100 text-sm">Out of Stock</p>
                      <p className="text-2xl font-bold text-white">{stats.outOfStock}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  {searchOpen ? (
                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl px-3 py-3">
                      <Search size={18} className="text-gray-400" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className="flex-1 text-sm outline-none bg-transparent"
                      />
                      <button
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 text-gray-700"
                    >
                      <Search size={18} />
                      <span>Search products...</span>
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <button className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 text-gray-700">
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filter</span>
                </button>
              </div>

              <div className="flex gap-3">
                {/* Import/Export Buttons */}
                <button className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 text-gray-700">
                  <Download size={18} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button className="px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 text-gray-700">
                  <Upload size={18} />
                  <span className="hidden sm:inline">Import</span>
                </button>

                {/* Scan Button */}
                <button
                  onClick={() => {
                    setScannerMode('search');
                    setShowScanner(true);
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-indigo-700 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 border border-indigo-200/50"
                >
                  <ScanLine size={18} />
                  <span className="hidden sm:inline">Scan</span>
                </button>

                {/* Add Product Button */}
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Plus size={18} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-xl">
                <AlertTriangle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-amber-800">
                  {lowStockProducts.length} item(s) running low on stock
                </p>
                <p className="text-amber-600 text-sm">Consider restocking these products</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {lowStockProducts.map((p) => (
                <span
                  key={p._id}
                  className="text-sm bg-amber-100 text-amber-700 px-4 py-2 rounded-full font-medium border border-amber-200/50"
                >
                  {p.name} — {p.stock} left
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="max-w-7xl mx-auto">
        {products.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-12">
            <div className="text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first product or scanning a barcode
              </p>
              <button
                onClick={openAddModal}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Add Your First Product
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-12">
            <div className="text-center">
              <Search size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
              <p className="text-gray-500">
                Try adjusting your search terms or add a new product
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table — hidden on small screens */}
            <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-indigo-50/50">
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Price</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Cost</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Stock</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Barcode</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-8 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                          {product.name}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium border border-indigo-200/50">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-semibold text-gray-700">₹{product.price}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm text-gray-600">₹{product.costPrice}</p>
                      </td>
                      <td className="px-8 py-5">
                        {product.stock <= product.lowStockLimit ? (
                          <span className="text-xs bg-gradient-to-r from-red-100 to-pink-100 text-red-600 px-3 py-1.5 rounded-full font-medium border border-red-200/50">
                            {product.stock} — low
                          </span>
                        ) : (
                          <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 px-3 py-1.5 rounded-full font-medium border border-green-100/50">
                            {product.stock} in stock
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg">
                          {product.barcode || '—'}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group-hover:shadow-md"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:shadow-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards — shown only on small screens */}
            <div className="md:hidden space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg mb-2">
                        {product.name}
                      </p>
                      <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-200/50">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 text-center border border-blue-100/50">
                      <p className="text-xs text-gray-500 font-medium mb-1">Price</p>
                      <p className="text-lg font-bold text-gray-800">
                        ₹{product.price}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-3 text-center border border-purple-100/50">
                      <p className="text-xs text-gray-500 font-medium mb-1">Cost</p>
                      <p className="text-lg font-bold text-gray-800">
                        ₹{product.costPrice}
                      </p>
                    </div>
                    <div className={`rounded-2xl p-3 text-center border ${
                      product.stock <= product.lowStockLimit
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-100/50'
                        : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100/50'
                    }`}>
                      <p className="text-xs text-gray-500 font-medium mb-1">Stock</p>
                      <p className={`text-lg font-bold ${
                        product.stock <= product.lowStockLimit
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  {product.barcode && (
                    <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100/50">
                      <p className="text-xs text-gray-500 font-medium mb-1">Barcode</p>
                      <p className="text-sm text-gray-700 font-mono bg-white px-2 py-1 rounded-lg border">
                        {product.barcode}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Enhanced Add / Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-lg shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      {editingProduct ? <Pencil size={20} /> : <Plus size={20} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h2>
                      <p className="text-indigo-100 text-sm">
                        {editingProduct ? 'Update product details' : 'Add a new item to your inventory'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Premium Basmati Rice"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="e.g. Groceries"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Barcode
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="barcode"
                        value={form.barcode}
                        onChange={handleChange}
                        placeholder="Scan or type manually"
                        className="flex-1 px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScannerMode('add');
                          setShowScanner(true);
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 rounded-2xl transition-all duration-200 border border-indigo-200/50"
                        title="Scan barcode"
                      >
                        <ScanLine size={18} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cost Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="costPrice"
                      value={form.costPrice}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Low Stock Alert At
                    </label>
                    <input
                      type="number"
                      name="lowStockLimit"
                      value={form.lowStockLimit}
                      onChange={handleChange}
                      placeholder="5"
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100/50">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-sm font-semibold transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {saving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      editingProduct ? 'Update Product' : 'Add Product'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Barcode Scanner */}
        {showScanner && (
          <BarcodeScanner
            onScan={scannerMode === 'add' ? handleScanForAdd : handleScanForSearch}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>
    </div>
  );
}