import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Campaign API calls
export const campaignAPI = {
  // Get all campaigns with optional filters
  getCampaigns: (params = {}) => api.get('/api/campaigns', { params }),
  
  // Get single campaign
  getCampaign: (id) => api.get(`/api/campaigns/${id}`),
  
  // Create new campaign (NGO only)
  createCampaign: (data) => api.post('/api/campaigns', data),
  
  // Update campaign (NGO only)
  updateCampaign: (id, data) => api.put(`/api/campaigns/${id}`, data),
  
  // Delete campaign (NGO only)
  deleteCampaign: (id) => api.delete(`/api/campaigns/${id}`),
  
  // Get campaigns by NGO
  getCampaignsByNGO: (userId) => api.get(`/api/campaigns/ngo/${userId}`)
};

// Donation API calls
export const donationAPI = {
  // Make a donation (Donor only)
  makeDonation: (data) => api.post('/api/donations', data),
  
  // Get donation history (Donor only)
  getDonationHistory: () => api.get('/api/donations/history'),
  
  // Get donations for campaign (NGO only)
  getDonationsForCampaign: (campaignId) => api.get(`/api/donations/campaign/${campaignId}`),
  
  // Get donation statistics (NGO only)
  getDonationStats: () => api.get('/api/donations/stats')
};

// Auth API calls
export const authAPI = {
  // Login
  login: (data) => api.post('/api/auth/login', data),
  
  // Register
  register: (data) => api.post('/api/auth/register', data),
  
  // Get current user
  getMe: () => api.get('/api/auth/me')
};

export default api;

