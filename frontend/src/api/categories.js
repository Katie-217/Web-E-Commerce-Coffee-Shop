import { apiClient } from './client';

export const CategoriesApi = {
  list: () => apiClient.get('/categories'),
  get: (id) => apiClient.get(`/categories/${id}`),
};

export default CategoriesApi;




