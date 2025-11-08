import { apiClient } from './client';

/**
 * @typedef {Object} FetchCustomersParams
 * @property {string=} q
 * @property {number=} page
 * @property {number=} limit
 */

/**
 * @param {FetchCustomersParams=} opts
 */
export function fetchCustomers(opts = {}) {
  const { q, page = 1, limit = 20 } = opts;
  return apiClient.get('/customers', { params: { q, page, limit } });
}

export function fetchCustomerById(idOrEmail) {
  return apiClient.get(`/customers/${encodeURIComponent(idOrEmail)}`);
}

export function fetchCustomerOrders(id, { page = 1, limit = 20 } = {}) {
  return apiClient.get(`/customers/${encodeURIComponent(id)}/orders`, { params: { page, limit } });
}

export default {
  fetchCustomers,
  fetchCustomerById,
  fetchCustomerOrders,
};


