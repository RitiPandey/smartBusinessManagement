import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Mail, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-200 to-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8 animate-fadeIn relative z-10">

        {/* Header with icon */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600 text-sm">
            Sign in to your SmartBMS account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

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
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
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
                placeholder="Your password"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-4 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200 hover:underline">
            Create one
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