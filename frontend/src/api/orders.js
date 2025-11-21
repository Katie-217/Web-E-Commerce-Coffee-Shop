import { apiClient } from './client';

export function fetchOrders({ q, status, email, page = 1, limit = 20 } = {}) {
  return apiClient.get('/orders', { params: { q, status, email, page, limit } });
}

export function fetchOrderById(id) {
  return apiClient.get(`/orders/${encodeURIComponent(id)}`);
}

export const OrdersApi = {
  list: (params) => apiClient.get('/orders', { params }),
  get: (id) => apiClient.get(`/orders/${encodeURIComponent(id)}`),
  create: (payload) => apiClient.post('/orders', payload),
  updateStatus: (id, status) => apiClient.patch(`/orders/${encodeURIComponent(id)}`, { status }),
};

export default OrdersApi;



