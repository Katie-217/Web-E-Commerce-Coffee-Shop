import React from 'react';
import { OrderDetail as OrderDetailType } from '../../types';
import Badge from '../../components/Badge';
import { Edit, ShoppingCart, CheckCircle2, Circle, ChevronLeft } from 'lucide-react';

interface OrderDetailProps {
  order: OrderDetailType;
  onBack: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, onBack }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'green';
      case 'Pending Payment':
        return 'yellow';
      case 'Failed':
        return 'red';
      case 'Refunded':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getOrderStatusColor = (status: string): 'green' | 'yellow' | 'red' | 'gray' | 'blue' => {
    switch (status) {
      case 'Ready to Pickup':
        return 'green';
      case 'Delivered':
        return 'green';
      case 'Processing':
        return 'blue';
      case 'Pending':
        return 'yellow';
      case 'Cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-background-light p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-gray-700 text-text-secondary hover:text-white transition-colors mt-1"
              aria-label="Back to orders list"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text-primary">Order {order.id}</h1>
                <Badge color={getStatusColor(order.paymentStatus || 'Pending')}>
                  {order.paymentStatus || 'Pending'}
                </Badge>
                <Badge color={getOrderStatusColor(order.status)}>
                  {order.status === 'Processing' ? 'Ready to Pickup' : order.status}
                </Badge>
              </div>
              <p className="text-sm text-text-secondary">{order.date}</p>
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Delete Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Order details</h2>
              <button className="text-primary hover:text-primary/80 flex items-center gap-2">
                <Edit size={16} />
                Edit
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-sm text-text-secondary">
                    <th className="p-3">
                      <input type="checkbox" className="rounded border-gray-600 bg-background-dark" />
                    </th>
                    <th className="p-3">PRODUCTS</th>
                    <th className="p-3">PRICE</th>
                    <th className="p-3">QTY</th>
                    <th className="p-3">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-700">
                      <td className="p-3">
                        <input type="checkbox" className="rounded border-gray-600 bg-background-dark" />
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-text-primary">{item.name}</p>
                          {item.variant && (
                            <p className="text-sm text-text-secondary">{item.variant}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-text-secondary">${item.price}</td>
                      <td className="p-3 text-text-secondary">{item.quantity}</td>
                      <td className="p-3 font-semibold text-text-primary">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal:</span>
                <span className="text-text-primary font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Discount:</span>
                <span className="text-text-primary font-medium">-${order.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tax:</span>
                <span className="text-text-primary font-medium">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-700 font-bold text-lg">
                <span className="text-text-primary">Total:</span>
                <span className="text-text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Activity */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Shipping activity</h2>
            <div className="relative pl-6">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              
              {order.shippingActivity.map((activity, index) => (
                <div key={index} className="relative mb-6 last:mb-0">
                  {/* Circle marker */}
                  <div className={`absolute -left-7 top-1 w-4 h-4 rounded-full border-2 ${
                    activity.completed 
                      ? 'bg-primary border-primary' 
                      : 'bg-gray-700 border-gray-700'
                  }`}>
                    {activity.completed && (
                      <CheckCircle2 size={12} className="text-white absolute top-0.5 left-0.5" />
                    )}
                  </div>
                  
                  <div className="pb-4">
                    <p className="font-semibold text-text-primary">{activity.status}</p>
                    <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
                    {(activity.date || activity.time) && (
                      <p className="text-xs text-text-secondary mt-1">
                        {activity.date} {activity.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">Customer details</h2>
            <div className="flex flex-col items-center mb-4">
              <img 
                src={order.customer.avatar} 
                alt={order.customer.name} 
                className="w-20 h-20 rounded-xl mb-3"
              />
              <p className="font-bold text-text-primary">{order.customer.name}</p>
              <p className="text-sm text-text-secondary">Customer ID: {order.customer.id}</p>
              <div className="flex items-center gap-2 mt-2 text-text-secondary">
                <ShoppingCart size={16} />
                <span className="text-sm">{order.customer.totalOrders} Orders</span>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-text-secondary mb-1">Email:</p>
                <p className="text-text-primary">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-text-secondary mb-1">Mobile:</p>
                <p className="text-text-primary">{order.customer.phone}</p>
              </div>
            </div>
            <button className="mt-4 w-full text-primary hover:text-primary/80 flex items-center justify-center gap-2 border border-primary rounded-lg py-2">
              <Edit size={16} />
              Edit
            </button>
          </div>

          {/* Shipping Address */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Shipping address</h2>
              <button className="text-primary hover:text-primary/80">
                <Edit size={16} />
              </button>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
            </p>
          </div>

          {/* Billing Address */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text-primary">Billing address</h2>
              <button className="text-primary hover:text-primary/80">
                <Edit size={16} />
              </button>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {order.billingAddress.street}, {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}, {order.billingAddress.country}
            </p>
          </div>

          {/* Payment Method */}
          <div className="bg-background-light p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-text-primary mb-4">{order.paymentMethod.type}</h2>
            <p className="text-sm text-text-secondary">
              Card Number: <span className="text-text-primary">******{order.paymentMethod.last4}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
