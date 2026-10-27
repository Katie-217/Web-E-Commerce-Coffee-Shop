import { apiClient } from './client';

export const ProductsApi = {
  list: (params) => apiClient.get('/products', { headers: {}, ...(params ? { params } : {}) }),
  get: (id) => apiClient.get(`/products/${id}`),
  create: (payload) => apiClient.post('/products', payload),
  update: (id, payload) => apiClient.put(`/products/${id}`, payload),
  remove: (id) => apiClient.delete(`/products/${id}`),
};

export default ProductsApi;



