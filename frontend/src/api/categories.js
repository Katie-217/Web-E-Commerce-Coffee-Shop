import { apiClient } from './client';

export const CategoriesApi = {
  list: () => apiClient.get('/categories'),
  get: (id) => apiClient.get(`/categories/${id}`),
  update: (name, payload) => apiClient.patch(`/categories/${encodeURIComponent(name)}`, payload),
  remove: (name) => apiClient.delete(`/categories/${encodeURIComponent(name)}`),
};

export default CategoriesApi;




