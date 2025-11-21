import React, { useEffect, useState, useMemo } from 'react';
import { fetchOrders } from '../../../../api/orders';
import { OrderStatus } from '../../types';
import Badge from '../../components/Badge';
import { MoreVertical, Calendar, CheckCircle, Wallet, AlertCircle, ChevronDown, ArrowUp } from 'lucide-react';

interface OrderListProps {
  onOrderClick: (orderId: string) => void;
}

const ITEMS_PER_PAGE = 10;

const OrderList: React.FC<OrderListProps> = ({ onOrderClick }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);

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

  const getDisplayCode = (val: string | number | undefined | null) => {
    const s = String(val || '');
    if (!s) return '';
    const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
    const last4 = hex.slice(-4).padStart(4, '0');
    return `#${last4}`;
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchOrders({
  q: '',
  status: '',
  email: '',
  page: currentPage,
  limit: itemsPerPage,
});

        const items = res?.data || res?.items || [];
        const totalCount = res?.pagination?.total ?? items.length;
        if (!cancelled) {
          setRows(items);
          setTotal(totalCount);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [currentPage, itemsPerPage]);

  const paymentStatusFrom = (status?: string) => {
    if (!status) return 'Pending';
    const s = status.toLowerCase();
    if (['paid', 'delivered', 'shipped', 'processing'].includes(s)) return 'Paid';
    if (['pending', 'created'].includes(s)) return 'Pending';
    if (['refunded'].includes(s)) return 'Refunded';
    if (['failed', 'cancelled', 'canceled'].includes(s)) return 'Failed';
    return 'Pending';
  };

  // Filter orders by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter(order =>
      getDisplayCode(order.id).toLowerCase().includes(query) ||
      order.customerEmail?.toLowerCase().includes(query) ||
      order.customerName?.toLowerCase().includes(query)
    );
  }, [rows, searchQuery]);

  // Calculate stats from all rows (not just filtered)
  const pendingCount = rows.filter(o => paymentStatusFrom(o.status) === 'Pending').length;
  const completedCount = rows.filter(o => paymentStatusFrom(o.status) === 'Paid').length;
  const refundedCount = rows.filter(o => paymentStatusFrom(o.status) === 'Refunded').length;
  const failedCount = rows.filter(o => paymentStatusFrom(o.status) === 'Failed').length;

  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-background-dark border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-text-primary w-full md:w-auto"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background-dark border border-gray-600 rounded-lg px-3 py-2">
              <span className="text-sm text-text-secondary">{itemsPerPage}</span>
              <ChevronDown size={16} className="text-text-secondary" />
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
              <ArrowUp size={16} />
              Export
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
              {loading && (
                <tr><td className="p-3 text-text-secondary" colSpan={8}>Loading...</td></tr>
              )}
              {error && !loading && (
                <tr><td className="p-3 text-red-300" colSpan={8}>{error}</td></tr>
              )}
              {!loading && filteredRows.length === 0 && (
                <tr><td className="p-3 text-text-secondary" colSpan={8}>No orders found</td></tr>
              )}
              {!loading && filteredRows.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => onOrderClick(String(order.id))}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-gray-600 bg-background-dark" />
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-primary">
                      {getDisplayCode(order.id)}
                    </span>
                  </td>
                  <td className="p-3 text-text-secondary">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://i.pravatar.cc/40?u=${encodeURIComponent(order.customerEmail || order.id)}`}
                        alt={order.customerEmail || 'Customer'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-text-primary">
                          {order.customerEmail?.split('@')[0]?.replace(/\./g, ' ') || 'Customer'}
                        </p>
                        <p className="text-xs text-text-secondary">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        paymentStatusFrom(order.status) === 'Pending' ? 'bg-yellow-400' :
                        paymentStatusFrom(order.status) === 'Paid' ? 'bg-green-400' :
                        paymentStatusFrom(order.status) === 'Failed' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-text-primary">{paymentStatusFrom(order.status)}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge color={getStatusColor((order.status || 'Processing') as any)}>
                      {order.status || 'Processing'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-secondary">
                        {(order.paymentMethod && order.paymentMethod.type) || (order.paymentMethod || '').toString().toUpperCase() || 'CARD'}
                      </span>
                      <span className="text-text-secondary">
                        {order.paymentMethod?.last4 ? `****${order.paymentMethod.last4}` : ''}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
            <p>Showing {startIndex} to {endIndex} of {total} entries</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2">...</span>
              )}
              {totalPages > 5 && (
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="px-3 py-1 rounded-md hover:bg-gray-700"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;
