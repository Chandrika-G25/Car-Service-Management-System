import api from './api';

export const carService = {
  getCars: async (params = {}) => {
    const response = await api.get('/cars/', { params });
    return response.data;
  },

  getCarById: async (id) => {
    const response = await api.get(`/cars/${id}/`);
    return response.data;
  },

  createCar: async (carData) => {
    const isFormData = carData instanceof FormData;
    const response = await api.post('/cars/', carData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateCar: async (id, carData) => {
    const isFormData = carData instanceof FormData;
    const response = await api.put(`/cars/${id}/`, carData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteCar: async (id) => {
    const response = await api.delete(`/cars/${id}/`);
    return response.data;
  },
};
