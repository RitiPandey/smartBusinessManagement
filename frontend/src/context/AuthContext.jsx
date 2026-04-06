import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Track current user
  const [user, setUser] = useState(null);

  // Track loading state (true while checking auth)
  const [loading, setLoading] = useState(true);

  // Check if user is still logged in when app starts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // This function checks if the user has a valid token
  const checkAuthStatus = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // If no token, user is not logged in
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // If token exists, verify it with the backend
      const res = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If verification successful, set user data
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // If verification fails, token is invalid or expired
      // Clear everything and logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      // Stop loading after check is complete
      setLoading(false);
    }
  };

  // Function to login user
  const login = (userData, token) => {
    // Save token and user data to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Update state
    setUser(userData);
  };

  // Function to logout user
  const logout = () => {
    // Remove token and user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear user from state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use authentication anywhere in the app
export function useAuth() {
  return useContext(AuthContext);
}