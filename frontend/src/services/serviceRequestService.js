import api from './api';

export const serviceRequestService = {
  getCategories: async () => {
    const response = await api.get('/service-categories/');
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post('/service-categories/', data);
    return response.data;
  },

  getRequests: async (params = {}) => {
    const response = await api.get('/service-requests/', { params });
    return response.data;
  },

  getRequestById: async (id) => {
    const response = await api.get(`/service-requests/${id}/`);
    return response.data;
  },

  createRequest: async (data) => {
    const response = await api.post('/service-requests/', data);
    return response.data;
  },

  cancelRequest: async (id, remarks = '') => {
    const response = await api.put(`/service-requests/${id}/cancel/`, { remarks });
    return response.data;
  },

  // Admin Assignment
  assignEngineer: async (id, { engineer_id, estimated_cost, remarks }) => {
    const response = await api.put(`/admin/service-requests/${id}/assign/`, {
      engineer_id,
      estimated_cost,
      remarks,
    });
    return response.data;
  },

  updateCosts: async (id, { estimated_cost, final_cost }) => {
    const response = await api.put(`/admin/service-requests/${id}/costs/`, {
      estimated_cost,
      final_cost,
    });
    return response.data;
  },

  // Engineer methods
  getEngineerServices: async (params = {}) => {
    const response = await api.get('/engineer/services/', { params });
    return response.data;
  },

  updateEngineerStatus: async (id, { status, remarks, final_cost }) => {
    const response = await api.put(`/engineer/services/${id}/status/`, {
      status,
      remarks,
      final_cost,
    });
    return response.data;
  },

  addEngineerNotes: async (id, notes) => {
    const response = await api.post(`/engineer/services/${id}/notes/`, { notes });
    return response.data;
  },

  getHistory: async (serviceRequestId) => {
    const response = await api.get('/service-history/', {
      params: { service_request_id: serviceRequestId },
    });
    return response.data;
  },
};
