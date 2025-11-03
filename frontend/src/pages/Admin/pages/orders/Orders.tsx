import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_ORDER_DETAILS, MOCK_ORDERS } from '../../constants';
import { OrderDetail as OrderDetailType, Order } from '../../types';
import OrderList from './OrderList';
import OrderDetailComponent from './OrderDetail';

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
    if (initialOrderId) {
      // First try to get from MOCK_ORDER_DETAILS
      let orderDetail = MOCK_ORDER_DETAILS[initialOrderId];
      if (!orderDetail) {
        // If not found, try to create from MOCK_ORDERS
        const order = MOCK_ORDERS.find(o => o.id === initialOrderId);
        if (order) {
          orderDetail = createOrderDetailFromOrder(order);
        }
      }
      
      if (orderDetail) {
        setSelectedOrder(orderDetail);
        setSelectedOrderId(initialOrderId);
      } else {
        console.warn(`Order not found for ${initialOrderId}`);
        setSelectedOrder(null);
        setSelectedOrderId(null);
      }
    } else {
      // Reset when initialOrderId is cleared
      setSelectedOrder(null);
      setSelectedOrderId(null);
    }
  }, [initialOrderId]);

  const handleOrderClick = (orderId: string) => {
    // First try to get from MOCK_ORDER_DETAILS
    let orderDetail = MOCK_ORDER_DETAILS[orderId];
    if (!orderDetail) {
      // If not found, try to create from MOCK_ORDERS
      const order = MOCK_ORDERS.find(o => o.id === orderId);
      if (order) {
        orderDetail = createOrderDetailFromOrder(order);
      }
    }
    
    if (orderDetail) {
      setSelectedOrder(orderDetail);
      setSelectedOrderId(orderId);
    } else {
      console.warn(`Order not found for ${orderId}`);
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

