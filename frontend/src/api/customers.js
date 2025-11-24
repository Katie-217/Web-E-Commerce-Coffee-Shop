
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
  const {
    q,
    page = 1,
    limit = 20,
    status,
    country,
    joinStart,
    joinEnd,
    ordersMin,
    ordersMax,
  } = opts;
  return apiClient.get('/customers', {
    params: {
      q,
      page,
      limit,
      status,
      country,
      joinStart,
      joinEnd,
      ordersMin,
      ordersMax,
    },
  });
}

export function fetchCustomerById(idOrEmail) {
  return apiClient.get(`/customers/${encodeURIComponent(idOrEmail)}`);
}

export function fetchCustomerOrders(id, { page = 1, limit = 20 } = {}) {
  return apiClient.get(`/customers/${encodeURIComponent(id)}/orders`, { params: { page, limit } });
}

export function createCustomer(customerData) {
  return apiClient.post('/customers', customerData);
}

export function updateCustomer(idOrEmail, customerData) {
  return apiClient.patch(`/customers/${encodeURIComponent(idOrEmail)}`, customerData);
}

export default {
  fetchCustomers,
  fetchCustomerById,
  fetchCustomerOrders,
  createCustomer,
  updateCustomer,
};


