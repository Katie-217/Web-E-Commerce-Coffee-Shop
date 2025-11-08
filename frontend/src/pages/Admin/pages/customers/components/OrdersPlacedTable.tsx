import React from 'react';
import Badge from '../../../components/Badge';
import { Trash2 } from 'lucide-react';
import { formatVND } from '../../../../../utils/currency';

const getDisplayCode = (val: string | number | undefined | null) => {
  const s = String(val || '');
  if (!s) return '';
  const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
  const last4 = hex.slice(-4).padStart(4, '0');
  return `#${last4}`;
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusColor = (status: string): 'green' | 'red' | 'yellow' | 'blue' | 'gray' => {
  const s = (status || '').toLowerCase();
  if (s === 'delivered') return 'green';
  if (s === 'out for delivery') return 'blue';
  if (s === 'ready to pickup') return 'blue';
  if (s === 'dispatched') return 'yellow';
  if (s === 'cancelled') return 'red';
  return 'yellow';
};

type OrdersPlacedTableProps = {
  orders: any[];
  searchOrder: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderClick?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
};

const OrdersPlacedTable: React.FC<OrdersPlacedTableProps> = ({
  orders,
  searchOrder,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  onOrderClick,
  onDeleteOrder,
}) => {
  const ITEMS_PER_PAGE = 6;

  const handleDelete = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete order ${getDisplayCode(orderId)}?`)) {
      if (onDeleteOrder) {
        onDeleteOrder(orderId);
      }
    }
  };

  return (
    <div className="bg-background-light p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-text-primary">Orders placed</h4>
        <input
          type="text"
          placeholder="Search order"
          value={searchOrder}
          onChange={(e) => {
            onSearchChange(e.target.value);
            onPageChange(1);
          }}
          className="bg-background-dark border border-gray-600 rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700 text-sm text-text-secondary">
              <th className="p-3">ORDER</th>
              <th className="p-3">DATE</th>
              <th className="p-3">STATUS</th>
              <th className="p-3">SPENT</th>
              <th className="p-3 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-text-secondary">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id || o._id}
                  className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (onOrderClick) {
                      onOrderClick(String(o.id || o._id));
                    }
                  }}
                >
                  <td className="p-3">
                    <span className="text-primary font-semibold">
                      {getDisplayCode(o.id || o._id)}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">{formatDate(o.createdAt)}</td>
                  <td className="p-3">
                    <Badge color={getStatusColor(o.status)}>
                      {(o.status || '').toString().replace(/^./, (c: string) => c.toUpperCase())}
                    </Badge>
                  </td>
                  <td className="p-3 text-text-primary font-medium">{formatVND(Number(o.total) || 0)}</td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="text-text-secondary hover:text-accent-red transition-colors"
                      onClick={(e) => handleDelete(o.id || o._id, e)}
                      aria-label="Delete order"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, orders.length)} of {orders.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 text-text-secondary">...</span>
            )}
            {totalPages > 5 && (
              <button
                onClick={() => onPageChange(totalPages)}
                className="px-3 py-1 rounded text-text-secondary hover:text-text-primary"
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ›
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPlacedTable;

