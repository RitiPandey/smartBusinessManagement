
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Layout from './components/Layout';

// This component protects routes that need login
// It waits for auth check to complete, then allows or redirects
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  // Still checking authentication - show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Auth check complete - if user exists, show page. Otherwise redirect to login
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { loading } = useAuth();

  // While checking auth on app start, show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public pages - anyone can access */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected pages - only logged in users can access */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="sales" element={<Sales />} />
        <Route path="customers" element={<Customers />} />
      </Route>
    </Routes>
  );
}