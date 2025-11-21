import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ORDER_DETAILS, MOCK_ORDERS } from '../../constants';
import { OrderDetail as OrderDetailType, Order } from '../../types';
import OrderList from './OrderList';
import OrderDetailComponent from './OrderDetail';
import OrdersApi, { fetchOrderById } from '../../../../api/orders';
import { fetchCustomerById } from '../../../../api/customers';

interface OrdersProps {
  initialOrderId?: string | null;
  fromCustomer?: boolean;
  onOrderClose?: () => void;
  onBackToCustomer?: () => void;
}

// Helper function to create OrderDetail from Order
const createOrderDetailFromOrder = (order: Order): OrderDetailType => {
  return {
    ...order,
    items: [
      { id: 1, name: 'Product Item', variant: 'Default', price: order.payment, quantity: 1 },
    ],
    subtotal: order.payment,
    discount: 0,
    tax: Math.round(order.payment * 0.1 * 100) / 100,
    total: order.payment,
    shippingActivity: [
      { status: 'Order was placed', description: 'Your order has been placed successfully', completed: true },
      { status: 'Processing', description: 'Order is being processed', date: order.date.split(',')[0], time: order.date.split(',')[1]?.trim(), completed: order.status !== 'Pending' },
      { status: order.status === 'Delivered' ? 'Delivered' : 'Pending', description: order.status === 'Delivered' ? 'Order has been delivered' : 'Order is pending delivery', completed: order.status === 'Delivered' },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
  };
};

// Adapt backend order payload to OrderDetailType used by UI
const adaptOrderDetail = (o: any): OrderDetailType => {
  const normalizeAddress = (addr: any) => {
    if (!addr) return undefined;
    // If already normalized
    if (addr.street || addr.city || addr.state || addr.zip || addr.country) return addr;
    // Normalize from customer-style address
    const street = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ');
    const city = addr.city || '';
    const state = addr.district || '';
    const zip = addr.postalCode || '';
    const country = addr.country || '';
    if (street || city || state || zip || country) {
      return { street, city, state, zip, country };
    }
    return undefined;
  };
  const items = Array.isArray(o.items) ? o.items.map((it: any, idx: number) => ({
    id: it.id || it.productId || idx + 1,
    name: it.name || it.sku || 'Item',
    variant: it.variant || it.sku || undefined,
    price: Number(it.price || 0),
    quantity: Number(it.quantity || it.qty || 1),
  })) : [];
  const subtotal = items.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
  const discount = Number(o.discount || 0);
  const tax = Number(o.tax || 0);
  const total = Number(o.total != null ? o.total : subtotal - discount + tax);
  const paymentStatus = (o.status || '').toString().toLowerCase() === 'paid' ? 'Paid' : (o.status || 'Pending');
  const customer = {
    id: (o.customerId && (o.customerId._id || o.customerId)) || '',
    name: (o.customerName) || (o.customerEmail ? o.customerEmail.split('@')[0] : 'Customer'),
    email: o.customerEmail,
    phone: (o.customerPhone) || '',
    avatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(o.customerEmail || o.id)}`,
    totalOrders: undefined as any,
  } as any;
  return {
    id: String(o._id || o.id || ''),
    date: o.createdAt ? new Date(o.createdAt).toLocaleString() : '',
    paymentStatus,
    status: o.status ? (o.status[0].toUpperCase() + o.status.slice(1)) : 'Processing',
    items,
    subtotal,
    discount,
    tax,
    total,
    shippingActivity: (() => {
      const provided = Array.isArray(o.shippingActivity) ? o.shippingActivity : [];
      if (provided.length > 0) return provided;
      const created = o.createdAt ? new Date(o.createdAt) : new Date();
      const step = (days: number) => {
        const d = new Date(created);
        d.setDate(d.getDate() + days);
        const [weekday, time] = [d.toLocaleDateString(undefined, { weekday: 'long' }), d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })];
        return { date: weekday, time } as any;
      };
      const statusOrder = ['created','pending','processing','shipped','delivered','cancelled'];
      const s = String(o.status || 'processing').toLowerCase();
      const idx = Math.max(0, statusOrder.indexOf(s));
      const completed = (i: number) => (s === 'cancelled' ? i < 3 : i <= (s === 'delivered' ? 5 : 3));
      return [
        { status: `Order was placed (Order ID: #${String(o._id || o.id || '').slice(-5)})`, description: 'Your order has been placed successfully', ...step(0), completed: true },
        { status: 'Pick-up', description: 'Pick-up scheduled with courier', ...step(1), completed: completed(1) },
        { status: 'Dispatched', description: 'Item has been picked up by courier', ...step(2), completed: completed(2) },
        { status: 'Package arrived', description: 'Package arrived at an Amazon facility, NY', ...step(4), completed: completed(3) },
        { status: 'Dispatched for delivery', description: 'Package has left an Amazon facility, NY', ...step(6), completed: completed(4) },
        { status: 'Delivery', description: s === 'delivered' ? 'Package delivered' : 'Package will be delivered by tomorrow', ...step(7), completed: s === 'delivered' }
      ] as any;
    })(),
    shippingAddress: normalizeAddress(o.shippingAddress) || { street: '', city: '', state: '', zip: '', country: '' },
    billingAddress: normalizeAddress(o.billingAddress) || { street: '', city: '', state: '', zip: '', country: '' },
    paymentMethod: typeof o.paymentMethod === 'object' ? o.paymentMethod : { type: String(o.paymentMethod || 'CARD'), last4: '', brand: o.brand, provider: o.provider },
    paymentType: (o.paymentMethod && o.paymentMethod.type) || o.paymentType || undefined,
    customer,
  } as any;
};

const Orders: React.FC<OrdersProps> = ({ initialOrderId = null, fromCustomer = false, onOrderClose, onBackToCustomer }) => {
  // Use useMemo to compute selectedOrder from initialOrderId
  const initialOrder = useMemo(() => {
    if (initialOrderId) {
      // First try to get from MOCK_ORDER_DETAILS
      const detail = MOCK_ORDER_DETAILS[initialOrderId];
      if (detail) {
        return detail;
      }
      // If not found, try to create from MOCK_ORDERS
      const order = MOCK_ORDERS.find(o => o.id === initialOrderId);
      if (order) {
        return createOrderDetailFromOrder(order);
      }
    }
    return null;
  }, [initialOrderId]);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrderId);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailType | null>(initialOrder);

  useEffect(() => {
    const run = async () => {
      if (initialOrderId) {
    try {
      const res = await fetchOrderById(initialOrderId);
      const data = res?.data || res;
      if (data) {
          const detail: any = adaptOrderDetail(data) as any;
        // Hydrate customer from DB by id or email
        try {
          const cid = (data.customerId && (data.customerId._id || data.customerId)) || null;
          const key = cid || data.customerEmail;
          if (key) {
            const cres = await fetchCustomerById(String(key));
            const c = cres?.data || cres;
            if (c) {
              detail.customer = {
                id: c.id || c._id,
                name: c.fullName || detail.customer?.name,
                email: c.email || detail.customer?.email,
                phone: c.phone || detail.customer?.phone,
                avatar: c.avatarUrl || detail.customer?.avatar,
                totalOrders: detail.customer?.totalOrders,
              } as any;

              // Hydrate addresses if order lacks them
              const pickAddress = (arr: any[], type: string) => {
                if (!Array.isArray(arr)) return null;
                const def = arr.find((a: any) => (a.type || '').toLowerCase() === type && a.isDefault);
                const first = arr.find((a: any) => (a.type || '').toLowerCase() === type) || arr[0];
                const a = def || first;
                if (!a) return null;
                return {
                  street: [a.addressLine1, a.addressLine2].filter(Boolean).join(', '),
                  city: a.city || '',
                  state: a.district || '',
                  zip: a.postalCode || '',
                  country: a.country || '',
                };
              };
              if (!detail.shippingAddress || !detail.shippingAddress.street) {
                const addr = pickAddress(c.addresses, 'shipping');
                if (addr) detail.shippingAddress = addr as any;
              }
              if (!detail.billingAddress || !detail.billingAddress.street) {
                const addr = pickAddress(c.addresses, 'billing');
                if (addr) detail.billingAddress = addr as any;
              }

              // Hydrate payment method/type from customer default paymentMethods
              if (!detail.paymentType || !detail.paymentMethod || !detail.paymentMethod.type) {
                const pms: any[] = c.paymentMethods || [];
                const def = pms.find(pm => pm.isDefault) || pms[0];
                if (def) {
                  detail.paymentType = def.type;
                  if (def.type === 'card') {
                    detail.paymentMethod = { type: 'card', brand: def.brand, last4: def.last4 } as any;
                  } else if (def.type === 'bank') {
                    detail.paymentMethod = { type: 'bank', provider: def.provider, last4: def.card?.last4, brand: def.card?.brand } as any;
                  } else if (def.type === 'cash') {
                    detail.paymentMethod = { type: 'cash' } as any;
                  }
                }
              }
            }
          }
        } catch {}
        setSelectedOrder(detail);
        setSelectedOrderId(String(data._id || data.id));
        return;
      }
    } catch (e) {
          // ignore, try mocks
        }
        // Fallback to mocks
        let orderDetail = MOCK_ORDER_DETAILS[initialOrderId];
        if (!orderDetail) {
          const order = MOCK_ORDERS.find(o => o.id === initialOrderId);
          if (order) orderDetail = createOrderDetailFromOrder(order);
        }
        if (orderDetail) {
          setSelectedOrder(orderDetail);
          setSelectedOrderId(initialOrderId);
        } else {
          setSelectedOrder(null);
          setSelectedOrderId(null);
        }
      } else {
        setSelectedOrder(null);
        setSelectedOrderId(null);
      }
    };
    run();
  }, [initialOrderId]);

  const handleOrderClick = async (orderId: string) => {
    try {
      const res = await fetchOrderById(orderId);
      const data = res?.data || res;
      if (data) {
        const detail: any = adaptOrderDetail(data) as any;
        try {
          const cid = (data.customerId && (data.customerId._id || data.customerId)) || null;
          const key = cid || data.customerEmail;
          if (key) {
            const cres = await fetchCustomerById(String(key));
            const c = cres?.data || cres;
            if (c) {
              detail.customer = {
                id: c.id || c._id,
                name: c.fullName || detail.customer?.name,
                email: c.email || detail.customer?.email,
                phone: c.phone || detail.customer?.phone,
                avatar: c.avatarUrl || detail.customer?.avatar,
                totalOrders: detail.customer?.totalOrders,
              } as any;
            }
          }
        } catch {}
        setSelectedOrder(detail);
        setSelectedOrderId(String(data._id || data.id));
        return;
      }
    } catch {}
    // Fallback to mock if API misses
    let orderDetail = MOCK_ORDER_DETAILS[orderId];
    if (!orderDetail) {
      const order = MOCK_ORDERS.find(o => o.id === orderId);
      if (order) orderDetail = createOrderDetailFromOrder(order);
    }
    if (orderDetail) {
      setSelectedOrder(orderDetail);
      setSelectedOrderId(orderId);
    }
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setSelectedOrderId(null);
    if (fromCustomer && onBackToCustomer) {
      // If came from customer, go back to customer detail
      onBackToCustomer();
    } else if (onOrderClose) {
      // Otherwise, go back to order list
      onOrderClose();
    }
  };

  // Update selectedOrder when initialOrder changes
  useEffect(() => {
    if (initialOrder && initialOrderId) {
      setSelectedOrder(initialOrder);
      setSelectedOrderId(initialOrderId);
    }
  }, [initialOrder, initialOrderId]);

  // Check initialOrder first, then fallback to state
  const orderToShow = initialOrder || selectedOrder;
  const orderIdToShow = initialOrderId || selectedOrderId;

  if (orderToShow && orderIdToShow) {
    return <OrderDetailComponent order={orderToShow} onBack={handleBack} />;
  }

  return <OrderList onOrderClick={handleOrderClick} />;
};

export default Orders;

