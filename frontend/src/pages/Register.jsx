import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { User, Store, Mail, Lock, UserPlus } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Show loading screen while checking auth status
  if (loading) {
    return null;
  }

  // Handle input changes for all form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.shopName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8 animate-fadeIn relative z-10">

        {/* Header with icon */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600 text-sm">
            Start managing your business smarter
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Riti Pandey"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shop name
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Pandey General Store"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="riti@example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-4 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:text-green-700 transition-colors duration-200 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}