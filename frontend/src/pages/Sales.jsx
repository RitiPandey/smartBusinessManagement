import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  TrendingUp,
  IndianRupee,
  X,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const initialForm = {
  productId: '',
  quantity: 1,
};

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSalesAndProducts();
  }, []);

  const fetchSalesAndProducts = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
      ]);
      setSales(salesRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Sales page load failed:', error);
      toast.error('Unable to load sales data.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm(initialForm);
    setPreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPreview(null);
  };

  const handleProductChange = (event) => {
    const productId = event.target.value;
    setForm((current) => ({ ...current, productId }));
    const product = products.find((item) => item._id === productId);
    setPreview(product || null);
  };

  const handleQuantityChange = (event) => {
    const quantity = Number(event.target.value || 1);
    setForm((current) => ({ ...current, quantity }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.productId) {
      toast.error('Please select a product.');
      return;
    }

    if (form.quantity < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }

    const selected = products.find((item) => item._id === form.productId);
    if (!selected) {
      toast.error('Selected product is not available');
      return;
    }

    if (selected.stock < form.quantity) {
      toast.error(`Only ${selected.stock} units available in stock.`);
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/sales', {
        productId: selected._id,
        quantity: form.quantity,
      });

      setSales((current) => [res.data, ...current]);
      setProducts((current) =>
        current.map((item) =>
          item._id === selected._id
            ? { ...item, stock: Number(item.stock) - form.quantity }
            : item
        )
      );
      toast.success('Sale recorded successfully');
      closeModal();
    } catch (error) {
      console.error('Sale save failed:', error);
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm('Delete this sale? Stock will be restored.')) return;

    const deletedSale = sales.find((sale) => sale._id === saleId);
    if (!deletedSale) {
      toast.error('Sale record not found');
      return;
    }

    try {
      await api.delete(`/sales/${saleId}`);
      setSales((current) => current.filter((sale) => sale._id !== saleId));
      setProducts((current) =>
        current.map((product) =>
          product._id === deletedSale.productId
            ? { ...product, stock: Number(product.stock) + deletedSale.quantity }
            : product
        )
      );
      toast.success('Sale deleted and stock restored');
    } catch (error) {
      console.error('Delete sale failed:', error);
      toast.error('Failed to delete sale');
    }
  };

  const filteredSales = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sales;

    return sales.filter((sale) =>
      sale.productName.toLowerCase().includes(query) ||
      sale.quantity.toString().includes(query) ||
      new Date(sale.date).toLocaleDateString('en-IN').includes(query)
    );
  }, [sales, searchQuery]);

  const summary = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
    const totalProfit = sales.reduce((sum, sale) => sum + Number(sale.profit || 0), 0);
    const totalSold = sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0);
    return { totalRevenue, totalProfit, totalSold };
  }, [sales]);

  const formatDate = (value) =>
    new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-white/30 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-3xl">
                  <ShoppingCart size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Sales Summary</h1>
                  <p className="text-indigo-100 text-base sm:text-lg">Track business revenue, profit and inventory movement.</p>
                </div>
              </div>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-3xl bg-white/20 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-white/30"
              >
                <Plus size={18} />
                Record Sale
              </button>
            </div>
          </div>

          <div className="p-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <div className="rounded-2xl bg-indigo-50 p-2">
                  <IndianRupee size={18} className="text-indigo-600" />
                </div>
                <span className="text-sm">Total revenue</span>
              </div>
              <p className="text-3xl font-semibold text-slate-900">₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <div className="rounded-2xl bg-emerald-50 p-2">
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <span className="text-sm">Total profit</span>
              </div>
              <p className="text-3xl font-semibold text-emerald-600">₹{summary.totalProfit.toLocaleString('en-IN')}</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500 mb-3">
                <div className="rounded-2xl bg-blue-50 p-2">
                  <ShoppingCart size={18} className="text-blue-600" />
                </div>
                <span className="text-sm">Items sold</span>
              </div>
              <p className="text-3xl font-semibold text-slate-900">{summary.totalSold}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Sales history</h2>
            <p className="text-slate-500">Recent transactions with revenue and profit details.</p>
          </div>
          <div className="flex items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search sales by product, quantity, or date"
                className="w-full rounded-3xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white/90 p-10 text-center shadow-sm">
            <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No sales match your search</h3>
            <p className="text-slate-500">Try another search term or record a new sale.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Product</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Qty</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Sale price</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Total</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Profit</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Date</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-[0.08em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{sale.productName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{sale.quantity}</td>
                    <td className="px-6 py-4 text-slate-700">₹{sale.salePrice}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{Number(sale.totalAmount).toLocaleString('en-IN')}</td>
                    <td className={`px-6 py-4 font-semibold ${sale.profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {sale.profit >= 0 ? '+' : ''}₹{Number(sale.profit).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(sale.date)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(sale._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-6 text-white">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Record a new sale</h2>
                    <p className="text-sm text-slate-100">Sell fast and keep inventory synced automatically.</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-white/15 transition hover:bg-white/25"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 p-8">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Product</label>
                    <select
                      value={form.productId}
                      onChange={handleProductChange}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">Choose a product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} — {product.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={handleQuantityChange}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                </div>

                {preview ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Unit price</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">₹{preview.price}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Stock left</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{preview.stock}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Estimated total</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">₹{Number(preview.price) * form.quantity}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-4xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    Select a product to preview pricing details.
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Confirm sale'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
