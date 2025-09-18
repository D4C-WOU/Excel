// Base API URL - Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth service functions
const authService = {
  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored user
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authService.getUser();
    return user && user.role === 'admin';
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // API request with auth header
  authRequest: async (endpoint, options = {}) => {
    const token = authService.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : ''
      }
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      // If unauthorized, logout
      if (response.status === 401) {
        authService.logout();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }
};

export default authService;