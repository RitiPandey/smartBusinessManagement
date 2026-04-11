
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