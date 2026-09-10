import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  logout: async (refreshToken) => {
    try {
      await api.post('/auth/logout/', { refresh: refreshToken });
    } catch {
      // Ignored for clean logout
    }
  },

  getProfile: async () => {
    const response = await api.get('/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.put('/profile/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.put('/profile/password/', passwords);
    return response.data;
  },
};
