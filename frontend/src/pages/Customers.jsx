import { useState, useEffect } from 'react';
import {
  Users, Plus, Pencil, Trash2, X,
  Phone, Mail, FileText, IndianRupee,
  ShoppingBag, ChevronRight, ArrowLeft,
  Package, Calendar, TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  notes: '',
};

// Avatar colours based on first letter of name
const avatarColors = [
  'bg-indigo-100 text-indigo-600',
  'bg-green-100 text-green-600',
  'bg-amber-100 text-amber-600',
  'bg-pink-100 text-pink-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-red-100 text-red-600',
  'bg-teal-100 text-teal-600',
];

const getAvatarColor = (name) =>
  avatarColors[name.charCodeAt(0) % avatarColors.length];

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Which customer's detail page we're viewing (null = list view)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [purchaseForm, setPurchaseForm] = useState({ productId: '', quantity: 1 });
  const [purchasePreview, setPurchasePreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/products'),
      ]);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Open customer detail view and load their purchase history
  const openCustomerDetail = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingPurchases(true);
    try {
      const res = await api.get(`/customers/${customer._id}/purchases`);
      setPurchases(res.data.purchases);
    } catch (err) {
      toast.error('Failed to load purchase history');
    } finally {
      setLoadingPurchases(false);
    }
  };

  const backToList = () => {
    setSelectedCustomer(null);
    setPurchases([]);
  };

  // ── Customer modal ──────────────────────────────────────
  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setShowCustomerModal(true);
  };

  const openEditModal = (customer, e) => {
    e.stopPropagation(); // don't open detail view when clicking edit
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      notes: customer.notes || '',
    });
    setShowCustomerModal(true);
  };

  const closeCustomerModal = () => {
    setShowCustomerModal(false);
    setEditingCustomer(null);
    setForm(emptyForm);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCustomer) {
        const res = await api.put(`/customers/${editingCustomer._id}`, form);
        setCustomers(customers.map((c) =>
          c._id === editingCustomer._id ? res.data : c
        ));
        // Update selected customer if we're in detail view
        if (selectedCustomer?._id === editingCustomer._id) {
          setSelectedCustomer(res.data);
        }
        toast.success('Customer updated');
      } else {
        const res = await api.post('/customers', form);
        setCustomers([res.data, ...customers]);
        toast.success('Customer added');
      }
      closeCustomerModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (customerId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this customer and all their purchase history?')) return;

    try {
      await api.delete(`/customers/${customerId}`);
      setCustomers(customers.filter((c) => c._id !== customerId));
      if (selectedCustomer?._id === customerId) backToList();
      toast.success('Customer deleted');
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  // ── Purchase modal ──────────────────────────────────────
  const openPurchaseModal = () => {
    setPurchaseForm({ productId: '', quantity: 1 });
    setPurchasePreview(null);
    setShowPurchaseModal(true);
  };

  const closePurchaseModal = () => {
    setShowPurchaseModal(false);
    setPurchasePreview(null);
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    setPurchaseForm({ ...purchaseForm, productId });
    setPurchasePreview(products.find((p) => p._id === productId) || null);
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();

    if (!purchaseForm.productId) {
      toast.error('Please select a product');
      return;
    }
    if (purchaseForm.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(
        `/customers/${selectedCustomer._id}/purchases`,
        purchaseForm
      );

      // Add new purchase to history list
      setPurchases([res.data.purchase, ...purchases]);

      // Update customer total in list and detail view
      setCustomers(customers.map((c) =>
        c._id === selectedCustomer._id ? res.data.customer : c
      ));
      setSelectedCustomer(res.data.customer);

      // Update local product stock
      setProducts(products.map((p) =>
        p._id === purchaseForm.productId
          ? { ...p, stock: p.stock - purchaseForm.quantity }
          : p
      ));

      toast.success('Purchase recorded');
      closePurchaseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm('Delete this purchase? Stock will be restored.')) return;

    try {
      await api.delete(
        `/customers/${selectedCustomer._id}/purchases/${purchaseId}`
      );

      const deleted = purchases.find((p) => p._id === purchaseId);

      // Remove from purchases list
      setPurchases(purchases.filter((p) => p._id !== purchaseId));

      // Restore stock locally
      setProducts(products.map((p) =>
        p._id === deleted.productId
          ? { ...p, stock: p.stock + deleted.quantity }
          : p
      ));

      // Update customer total locally
      const updatedCustomer = {
        ...selectedCustomer,
        totalPurchases: selectedCustomer.totalPurchases - deleted.totalAmount,
      };
      setSelectedCustomer(updatedCustomer);
      setCustomers(customers.map((c) =>
        c._id === selectedCustomer._id ? updatedCustomer : c
      ));

      toast.success('Purchase deleted, stock restored');
    } catch (err) {
      toast.error('Failed to delete purchase');
    }
  };

  // ── Derived data ────────────────────────────────────────
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const totalValue = customers.reduce((s, c) => s + c.totalPurchases, 0);

  // Top customer by spend
  const topCustomer = customers.length
    ? customers.reduce((a, b) =>
        a.totalPurchases > b.totalPurchases ? a : b
      )
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  // ── Customer Detail View ────────────────────────────────
  if (selectedCustomer) {
    // Group purchases by product name to show a summary
    const productSummary = {};
    purchases.forEach((p) => {
      if (!productSummary[p.productName]) {
        productSummary[p.productName] = { qty: 0, total: 0 };
      }
      productSummary[p.productName].qty += p.quantity;
      productSummary[p.productName].total += p.totalAmount;
    });

    return (
      <div>
        {/* Back button */}
        <button
          onClick={backToList}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to customers
        </button>

        {/* Customer profile header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 ${getAvatarColor(selectedCustomer.name)}`}
              >
                {getInitials(selectedCustomer.name)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedCustomer.name}
                </h1>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Phone size={13} />
                      {selectedCustomer.phone}
                    </div>
                  )}
                  {selectedCustomer.email && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail size={13} />
                      {selectedCustomer.email}
                    </div>
                  )}
                </div>
                {selectedCustomer.notes && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-400 italic mt-1">
                    <FileText size={13} />
                    {selectedCustomer.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => openEditModal(selectedCustomer, e)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 hover:text-primary hover:border-primary rounded-xl text-sm font-medium transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={openPurchaseModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors"
              >
                <Plus size={14} />
                Add purchase
              </button>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-50 rounded-lg">
                <IndianRupee size={14} className="text-green-500" />
              </div>
              <p className="text-xs text-gray-500">Total spent</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ₹{selectedCustomer.totalPurchases.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <ShoppingBag size={14} className="text-primary" />
              </div>
              <p className="text-xs text-gray-500">Purchases</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {purchases.length}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Package size={14} className="text-purple-500" />
              </div>
              <p className="text-xs text-gray-500">Products bought</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {Object.keys(productSummary).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Purchase history — takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Purchase history
                  </h2>
                </div>
                <span className="text-xs text-gray-400">
                  {purchases.length} transactions
                </span>
              </div>

              {loadingPurchases ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">Loading history...</p>
                </div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={36} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No purchases yet</p>
                  <p className="text-gray-300 text-xs mt-1">
                    Click "Add purchase" to record one
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase._id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Product icon */}
                        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={15} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {purchase.productName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {purchase.quantity} × ₹{purchase.pricePerUnit} &nbsp;·&nbsp;{' '}
                            {formatDate(purchase.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-sm font-bold text-gray-900">
                          ₹{purchase.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <button
                          onClick={() => handleDeletePurchase(purchase._id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product summary — takes 1/3 width on large screens */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Favourite products
                </h2>
              </div>

              {Object.keys(productSummary).length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-300 text-xs">No data yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {Object.entries(productSummary)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([name, data]) => (
                      <div key={name} className="px-6 py-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-800 truncate pr-2">
                            {name}
                          </p>
                          <p className="text-xs text-gray-400 flex-shrink-0">
                            ×{data.qty}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full mr-3">
                            <div
                              className="h-1.5 bg-primary rounded-full"
                              style={{
                                width: `${Math.round(
                                  (data.total /
                                    selectedCustomer.totalPurchases) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs font-semibold text-gray-700 flex-shrink-0">
                            ₹{data.total.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Add Purchase Modal */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Record purchase
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    for {selectedCustomer.name}
                  </p>
                </div>
                <button
                  onClick={closePurchaseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select product
                  </label>
                  <select
                    value={purchaseForm.productId}
                    onChange={handleProductSelect}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="">Choose a product...</option>
                    {products.map((p) => (
                      <option
                        key={p._id}
                        value={p._id}
                        disabled={p.stock === 0}
                      >
                        {p.name} — {p.stock} in stock
                        {p.stock === 0 ? ' (out of stock)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={purchaseForm.quantity}
                    onChange={(e) =>
                      setPurchaseForm({
                        ...purchaseForm,
                        quantity: Number(e.target.value),
                      })
                    }
                    min="1"
                    max={purchasePreview?.stock || 999}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Live purchase preview */}
                {purchasePreview && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 mb-3">
                      Purchase preview
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Product</span>
                      <span className="font-medium">{purchasePreview.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Unit price</span>
                      <span className="font-medium">₹{purchasePreview.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity</span>
                      <span className="font-medium">{purchaseForm.quantity}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Total amount
                        </span>
                        <span className="font-bold text-gray-900">
                          ₹{(
                            purchasePreview.price * purchaseForm.quantity
                          ).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">New customer total</span>
                        <span className="font-medium text-green-600">
                          ₹{(
                            selectedCustomer.totalPurchases +
                            purchasePreview.price * purchaseForm.quantity
                          ).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closePurchaseModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Record purchase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {showCustomerModal && (
          <CustomerModal
            form={form}
            setForm={setForm}
            editing={editingCustomer}
            saving={saving}
            onSubmit={handleCustomerSubmit}
            onClose={closeCustomerModal}
          />
        )}
      </div>
    );
  }

  // ── Customer List View ──────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Customers
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {customers.length} customers
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add customer</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <Users size={14} className="text-primary" />
            </div>
            <p className="text-xs text-gray-500">Total customers</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <IndianRupee size={14} className="text-green-500" />
            </div>
            <p className="text-xs text-gray-500">Total value</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalValue.toLocaleString('en-IN')}
          </p>
        </div>

        {topCustomer && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <TrendingUp size={14} className="text-amber-500" />
              </div>
              <p className="text-xs text-gray-500">Top customer</p>
            </div>
            <p className="text-base font-bold text-gray-900 truncate">
              {topCustomer.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              ₹{topCustomer.totalPurchases.toLocaleString('en-IN')} spent
            </p>
          </div>
        )}
      </div>

      {/* Search */}
      {customers.length > 0 && (
        <div className="mb-5">
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )}

      {/* Empty state */}
      {customers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Users size={44} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No customers yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Click "Add customer" to get started
          </p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No customers match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              onClick={() => openCustomerDetail(customer)}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(customer.name)}`}
                  >
                    {getInitials(customer.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {customer.name}
                    </p>
                    {customer.phone && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-gray-400" />
                        <p className="text-xs text-gray-400">{customer.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow + action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => openEditModal(customer, e)}
                    className="p-1.5 text-gray-300 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCustomer(customer._id, e)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-primary transition-colors ml-1"
                  />
                </div>
              </div>

              {/* Email and notes */}
              {customer.email && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Mail size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                </div>
              )}
              {customer.notes && (
                <div className="flex items-center gap-1.5 mb-3">
                  <FileText size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-400 italic truncate">
                    {customer.notes}
                  </p>
                </div>
              )}

              {/* Total spend badge */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">Total spent</span>
                <span className="text-sm font-bold text-gray-900">
                  ₹{customer.totalPurchases.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showCustomerModal && (
        <CustomerModal
          form={form}
          setForm={setForm}
          editing={editingCustomer}
          saving={saving}
          onSubmit={handleCustomerSubmit}
          onClose={closeCustomerModal}
        />
      )}
    </div>
  );
}

// Extracted modal component so it can be used in both list and detail view
function CustomerModal({ form, setForm, editing, saving, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? 'Edit customer' : 'Add new customer'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Ramesh Sharma"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. ramesh@gmail.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. VIP customer, pays on time"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}