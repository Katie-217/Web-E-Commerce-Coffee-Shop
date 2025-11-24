// src/services/orders.js (hoặc đúng path của m)
import { apiClient } from './client';

export function fetchOrders(params = {}) {
  const {
    q,
    status,
    email,
    page = 1,
    limit = 20,
  } = params;

  return apiClient.get('/orders', {
    params: { q, status, email, page, limit, includeItems: true },
  });
}

export function fetchOrderById(id) {
  return apiClient.get(`/orders/${encodeURIComponent(id)}`);
}

export const OrdersApi = {
  list: (params) => apiClient.get('/orders', { params }),
  get: (id) => apiClient.get(`/orders/${encodeURIComponent(id)}`),
  create: (payload) => apiClient.post('/orders', payload),
  updateStatus: (id, status, additionalData = {}) => {
    const payload = { status, ...additionalData };
    return apiClient.patch(`/orders/${encodeURIComponent(id)}`, payload);
  },
  update: (id, data) => apiClient.patch(`/orders/${encodeURIComponent(id)}`, data),
};

export default OrdersApi;
