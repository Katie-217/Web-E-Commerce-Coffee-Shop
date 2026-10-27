import React from 'react';
import { MOCK_ORDERS } from '../../constants';
import { OrderStatus } from '../../types';
import Badge from '../../components/Badge';
import { MoreVertical, Calendar, CheckCircle, Wallet, AlertCircle, ChevronDown } from 'lucide-react';

interface OrderListProps {
  onOrderClick: (orderId: string) => void;
}

const OrderList: React.FC<OrderListProps> = ({ onOrderClick }) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered:
        return 'green';
      case OrderStatus.Pending:
        return 'yellow';
      case OrderStatus.Processing:
        return 'blue';
      case OrderStatus.Cancelled:
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending Payment':
        return 'yellow';
      case 'Paid':
        return 'green';
      case 'Failed':
        return 'red';
      case 'Refunded':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const pendingCount = MOCK_ORDERS.filter(o => o.paymentStatus === 'Pending').length;
  const completedCount = MOCK_ORDERS.filter(o => o.paymentStatus === 'Paid').length;
  const refundedCount = MOCK_ORDERS.filter(o => o.paymentStatus === 'Refunded').length;
  const failedCount = MOCK_ORDERS.filter(o => o.paymentStatus === 'Failed').length;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background-light p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-yellow-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{pendingCount}</p>
            <p className="text-sm text-text-secondary">Pending Payment</p>
          </div>
        </div>
        <div className="bg-background-light p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{completedCount}</p>
            <p className="text-sm text-text-secondary">Completed</p>
          </div>
        </div>
        <div className="bg-background-light p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-gray-500/20 rounded-lg">
            <Wallet className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{refundedCount}</p>
            <p className="text-sm text-text-secondary">Refunded</p>
          </div>
        </div>
        <div className="bg-background-light p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{failedCount}</p>
            <p className="text-sm text-text-secondary">Failed</p>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="bg-background-light p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input 
            type="text" 
            placeholder="Search Order" 
            className="bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-auto"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background-dark border border-gray-600 rounded-lg px-3 py-2">
              <span className="text-sm text-text-secondary">10</span>
              <ChevronDown size={16} className="text-text-secondary" />
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
              Export <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700 text-sm text-text-secondary">
                <th className="p-3">
                  <input type="checkbox" className="rounded border-gray-600 bg-background-dark" />
                </th>
                <th className="p-3">ORDER</th>
                <th className="p-3">DATE</th>
                <th className="p-3">CUSTOMERS</th>
                <th className="p-3">PAYMENT</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">METHOD</th>
                <th className="p-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" className="rounded border-gray-600 bg-background-dark" />
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => onOrderClick(order.id)}
                      className="font-semibold text-primary hover:underline"
                    >
                      {order.id}
                    </button>
                  </td>
                  <td className="p-3 text-text-secondary">{order.date}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={order.customer.avatar} alt={order.customer.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-text-primary">{order.customer.name}</p>
                        <p className="text-xs text-text-secondary">{order.customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        order.paymentStatus === 'Pending' ? 'bg-yellow-400' :
                        order.paymentStatus === 'Paid' ? 'bg-green-400' :
                        order.paymentStatus === 'Failed' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-text-primary">{order.paymentStatus || 'Pending'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">{order.paymentMethod.type}</span>
                      <span className="text-text-secondary">****{order.paymentMethod.last4}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button className="text-text-secondary hover:text-white">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
          <p>Showing 1 to {MOCK_ORDERS.length} of 100 entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">{"<<"}</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">{"<"}</button>
            <button className="px-3 py-1 rounded-md bg-primary text-white">1</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">2</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">3</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">4</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">5</button>
            <span className="px-2">...</span>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">10</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">{">"}</button>
            <button className="px-3 py-1 rounded-md hover:bg-gray-700">{">>"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
