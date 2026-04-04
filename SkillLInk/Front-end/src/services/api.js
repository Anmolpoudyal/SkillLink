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

  // Get provider availability
  getProviderAvailability: async (providerId, date = null) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/providers/${providerId}/availability?${params}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get my availability (for provider dashboard)
  getMyAvailability: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/my-availability`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Save availability schedule
  saveAvailability: async (schedule) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ schedule }),
    });
    
    return handleResponse(response);
  },

  // Add time off
  addTimeOff: async (timeOffData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/time-off`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(timeOffData),
    });
    
    return handleResponse(response);
  },

  // Delete time off
  deleteTimeOff: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/time-off/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // ============================================
  // BOOKING API CALLS
  // ============================================

  // Create a booking (customer)
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(bookingData),
    });
    
    return handleResponse(response);
  },

  // Get provider's bookings
  getProviderBookings: async (status = null) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/provider/bookings?${params}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get customer's bookings
  getCustomerBookings: async (status = null) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/api/auth/customer/bookings?${params}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get single booking details
  getBookingDetails: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/bookings/${bookingId}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Update booking status (provider: accept, reject, start, complete)
  updateBookingStatus: async (bookingId, statusData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(statusData),
    });
    
    return handleResponse(response);
  },

  // Cancel booking (customer)
  cancelBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      credentials: 'include',
    });
    
    return handleResponse(response);
  },

  // Get provider's own reviews
  getMyReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/my-reviews`, {
      method: 'GET',
      credentials: 'include',
    });
    return handleResponse(response);
  },

  // Submit a review
  submitReview: async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reviewData),
    });
    
    return handleResponse(response);
  },

  // Submit a report
  submitReport: async (reportData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reportData),
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

    // Get all reports
    getReports: async (status = 'all') => {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      const response = await fetch(`${API_BASE_URL}/api/admin/reports?${params}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Update report status
    updateReport: async (reportId, data) => {
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      return handleResponse(response);
    },
  },

  // ============================================
  // NOTIFICATION API CALLS
  // ============================================

  notifications: {
    // Get all notifications
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'GET',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    // Get unread count
    getUnreadCount: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        method: 'GET',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    // Mark one as read
    markAsRead: async (notificationId) => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    // Mark all as read
    markAllAsRead: async () => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    // Delete a notification
    delete: async (notificationId) => {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return handleResponse(response);
    },
  },

  // ============================================
  // CHAT API CALLS
  // ============================================

  chat: {
    // Get chat messages for a booking (customer/provider only)
    getBookingMessages: async (bookingId, limit = 100) => {
      const params = new URLSearchParams({ limit: String(limit) });
      const response = await fetch(`${API_BASE_URL}/api/chat/bookings/${bookingId}/messages?${params}`, {
        method: 'GET',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    // Get direct chat conversations for current user
    getDirectConversations: async () => {
      const response = await fetch(`${API_BASE_URL}/api/chat/direct/conversations`, {
        method: 'GET',
        credentials: 'include',
      });
      return handleResponse(response);
    },

    // Get direct messages with a peer user
    getDirectMessages: async (peerId, limit = 100) => {
      const params = new URLSearchParams({ limit: String(limit) });
      const response = await fetch(`${API_BASE_URL}/api/chat/direct/${peerId}/messages?${params}`, {
        method: 'GET',
        credentials: 'include',
      });
      return handleResponse(response);
    },
  },

  // ============================================
  // KHALTI PAYMENT API CALLS
  // ============================================

  payments: {
    // Initiate Khalti payment
    initiatePayment: async (bookingId, amount, returnUrl = null) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          bookingId, 
          amount,
          returnUrl: returnUrl || `${window.location.origin}/payment/verify`,
          websiteUrl: window.location.origin
        }),
      });
      
      return handleResponse(response);
    },

    // Verify payment after Khalti redirect
    verifyPayment: async (pidx) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ pidx }),
      });
      
      return handleResponse(response);
    },

    // Get payment status by pidx
    getPaymentStatus: async (pidx) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/status/${pidx}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Get payment details for a booking
    getPaymentByBooking: async (bookingId) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/booking/${bookingId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Get payment history
    getPaymentHistory: async () => {
      const response = await fetch(`${API_BASE_URL}/api/payments/history`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Request refund
    requestRefund: async (bookingId, reason) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ bookingId, reason }),
      });
      
      return handleResponse(response);
    },

    // Get completion OTP for customer
    getCompletionOtp: async (bookingId) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/completion-otp/${bookingId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      return handleResponse(response);
    },

    // Verify completion OTP (provider)
    verifyCompletionOtp: async (bookingId, otp) => {
      const response = await fetch(`${API_BASE_URL}/api/payments/verify-completion-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ bookingId, otp }),
      });
      
      return handleResponse(response);
    },
  },
};

export default api;
