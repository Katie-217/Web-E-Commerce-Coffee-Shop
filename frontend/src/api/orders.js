import { apiClient } from './client';

export const OrdersApi = {
  list: (params) => apiClient.get('/orders', { params }),
  get: (id) => apiClient.get(`/orders/${id}`),
  create: (payload) => apiClient.post('/orders', payload),
  updateStatus: (id, status) => apiClient.patch(`/orders/${id}`, { status }),
};

export default OrdersApi;



