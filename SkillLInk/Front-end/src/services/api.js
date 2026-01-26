// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// API service object
const api = {
  // Customer Signup
  customerSignup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/CustomerSignup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(userData),
    });
    
    return handleResponse(response);
  },

  // Provider Signup
  providerSignup: async (providerData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/ProviderSignup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(providerData),
    });
    
    return handleResponse(response);
  },

  // Login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    
    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(profileData),
    });
    
    return handleResponse(response);
  },

  // Get providers with search/filter
  getProviders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.service) params.append('service', filters.service);
    if (filters.maxRate) params.append('maxRate', filters.maxRate);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/providers?${params}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get single provider details
  getProviderDetails: async (providerId) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/providers/${providerId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get service categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/categories`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get available locations
  getLocations: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/locations`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Admin API calls
  admin: {
    // Get all users
    getUsers: async (filters = {}) => {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Get specific user details
    getUserDetails: async (userId) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Get provider certificate
    getProviderCertificate: async (providerId) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/providers/${providerId}/certificate`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Suspend or activate user
    updateUserStatus: async (userId, isActive) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: isActive }),
      });
      
      return handleResponse(response);
    },

    // Get statistics
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },
  },
};

export default api;
