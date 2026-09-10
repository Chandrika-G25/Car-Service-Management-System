import api from './api';

export const adminService = {
  getCustomers: async (params = {}) => {
    const response = await api.get('/admin/customers/', { params });
    return response.data;
  },

  getCustomerDetails: async (id) => {
    const response = await api.get(`/admin/customers/${id}/`);
    return response.data;
  },

  toggleCustomerActive: async (id) => {
    const response = await api.put(`/admin/customers/${id}/toggle-active/`);
    return response.data;
  },

  getEngineers: async (params = {}) => {
    const response = await api.get('/admin/engineers/', { params });
    return response.data;
  },

  getEngineerDetails: async (id) => {
    const response = await api.get(`/admin/engineers/${id}/`);
    return response.data;
  },

  createEngineer: async (data) => {
    const response = await api.post('/admin/engineers/', data);
    return response.data;
  },

  updateEngineer: async (id, data) => {
    const response = await api.put(`/admin/engineers/${id}/`, data);
    return response.data;
  },

  getAdminVehicles: async (params = {}) => {
    const response = await api.get('/admin/vehicles/', { params });
    return response.data;
  },

  getAdminAnalytics: async () => {
    const response = await api.get('/analytics/admin/');
    return response.data;
  },

  getCustomerAnalytics: async () => {
    const response = await api.get('/analytics/customer/');
    return response.data;
  },

  getEngineerAnalytics: async () => {
    const response = await api.get('/analytics/engineer/');
    return response.data;
  },
};
