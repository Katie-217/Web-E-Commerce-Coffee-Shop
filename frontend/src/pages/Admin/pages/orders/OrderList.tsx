import React, { useEffect, useState, useMemo, useRef } from 'react';
import { fetchOrders } from '../../../../api/orders';
import { OrderStatus } from '../../types';
import Badge from '../../components/Badge';
import { MoreVertical, Calendar, CheckCircle, Wallet, AlertCircle, ChevronDown, FileDown, FileSpreadsheet, FileText, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { formatVND } from '../../../../utils/currency';

interface OrderListProps {
  onOrderClick: (orderId: string, orderData?: any) => void;
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExport, setShowExport] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: OrderStatus | string) => {
    if (!status) return 'gray';
    const s = String(status).toLowerCase();
    
    // Completed/Delivered statuses - Green
    if (s.includes('delivered') || s === 'delivered') {
      return 'green';
    }
    
    // Ready/Shipped statuses - Green/Blue
    if (s.includes('ready to pickup') || s.includes('readytopickup') || s.includes('ready')) {
      return 'green';
    }
    if (s.includes('shipped') || s === 'shipped') {
      return 'blue';
    }
    
    // In progress statuses - Blue/Yellow
    if (s.includes('processing') || s === 'processing') {
      return 'blue';
    }
    if (s.includes('dispatched') || s === 'dispatched') {
      return 'blue';
    }
    if (s.includes('out for delivery') || s.includes('outfordelivery')) {
      return 'blue';
    }
    
    // Pending statuses - Yellow
    if (s.includes('pending') || s === 'pending') {
      return 'yellow';
    }
    
    // Cancelled/Refunded/Returned - Red
    if (s.includes('cancelled') || s.includes('canceled') || s === 'cancelled') {
      return 'red';
    }
    if (s.includes('refunded') || s === 'refunded') {
      return 'red';
    }
    if (s.includes('returned') || s === 'returned') {
      return 'red';
    }
    
    return 'gray';
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'Pending':
        return 'yellow';
      case 'Paid':
        return 'green';
      case 'Failed':
        return 'red';
      case 'Refunded':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPaymentMethodIcon = (paymentMethod: any) => {
    if (!paymentMethod) return Wallet;
    
    let methodType = '';
    if (typeof paymentMethod === 'string') {
      methodType = paymentMethod.toLowerCase();
    } else if (paymentMethod?.type) {
      methodType = String(paymentMethod.type).toLowerCase();
    }
    
    switch (methodType) {
      case 'cod':
      case 'cash':
        return Banknote;
      case 'card':
      case 'credit':
      case 'debit':
        return CreditCard;
      case 'vnpay':
      case 'momo':
      case 'zalopay':
      case 'paypal':
        return Smartphone;
      case 'bank':
      case 'banking':
      case 'transfer':
        return Building2;
      default:
        return Wallet;
    }
  };

  const getPaymentMethodColor = (paymentMethod: any) => {
    if (!paymentMethod) return 'text-gray-400';
    
    let methodType = '';
    if (typeof paymentMethod === 'string') {
      methodType = paymentMethod.toLowerCase();
    } else if (paymentMethod?.type) {
      methodType = String(paymentMethod.type).toLowerCase();
    }
    
    switch (methodType) {
      case 'cod':
      case 'cash':
        return 'text-green-400';
      case 'card':
      case 'credit':
      case 'debit':
        return 'text-blue-400';
      case 'vnpay':
        return 'text-blue-500';
      case 'momo':
        return 'text-pink-400';
      case 'zalopay':
        return 'text-cyan-400';
      case 'paypal':
        return 'text-indigo-400';
      case 'bank':
      case 'banking':
      case 'transfer':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPaymentMethodLabel = (paymentMethod: any) => {
    if (!paymentMethod) return 'COD';
    
    if (typeof paymentMethod === 'string') {
      const methodMap: { [key: string]: string } = {
        'cod': 'COD',
        'vnpay': 'VNPay',
        'momo': 'MoMo',
        'zalopay': 'ZaloPay',
        'card': 'Card',
        'bank': 'Bank',
        'cash': 'Cash'
      };
      return methodMap[paymentMethod.toLowerCase()] || paymentMethod.toUpperCase();
    }
    
    if (paymentMethod?.type) {
      return String(paymentMethod.type).toUpperCase();
    }
    
    return 'COD';
  };

  const getDisplayCode = (val: string | number | undefined | null) => {
    const s = String(val || '');
    if (!s) return '';
    const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
    const last4 = hex.slice(-4).padStart(4, '0');
    return `#${last4}`;
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExport(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchOrders({ page: currentPage, limit: itemsPerPage });
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

  // Paginate filtered rows
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  // Calculate selection state based on paginated rows
  const pageOrderIds = paginatedRows.map((order) => String(order.id || order._id)).filter(Boolean);
  const allChecked = pageOrderIds.length > 0 && pageOrderIds.every((id) => selectedIds.includes(id));
  const noneChecked = selectedIds.length === 0;

  // Toggle all orders on current page
  const toggleAll = () => {
    setSelectedIds((prev) =>
      allChecked
        ? prev.filter((id) => !pageOrderIds.includes(id))
        : [...prev, ...pageOrderIds.filter((id) => !prev.includes(id))]
    );
  };

  // Toggle single order
  const toggleOne = (orderId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Calculate stats from all rows (not just filtered)
  const pendingCount = rows.filter(o => paymentStatusFrom(o.status) === 'Pending').length;
  const completedCount = rows.filter(o => paymentStatusFrom(o.status) === 'Paid').length;
  const refundedCount = rows.filter(o => paymentStatusFrom(o.status) === 'Refunded').length;
  const failedCount = rows.filter(o => paymentStatusFrom(o.status) === 'Failed').length;

  const displayTotalPages = Math.ceil(total / itemsPerPage);
  const displayStartIndex = (currentPage - 1) * itemsPerPage + 1;
  const displayEndIndex = Math.min(currentPage * itemsPerPage, total);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= displayTotalPages) {
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
            <div className="relative" ref={exportRef}>
              <button 
                type="button" 
                disabled={noneChecked} 
                onClick={() => !noneChecked && setShowExport(v => !v)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition font-semibold ${noneChecked ? 'bg-background-light border border-gray-700 text-text-secondary opacity-50 cursor-not-allowed' : 'bg-primary text-white border border-primary hover:bg-primary/90 cursor-pointer shadow-md'}`}
              >
                <span>Export</span>
                <ChevronDown size={16} />
              </button>
              {showExport && !noneChecked && (
                <div className="absolute right-0 mt-2 w-44 bg-background-light border border-gray-700 rounded-lg shadow-xl z-10 p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileDown size={16}/> Csv</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileSpreadsheet size={16}/> Excel</button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-background-dark text-text-primary"><FileText size={16}/> Pdf</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b border-gray-700 text-sm text-text-secondary">
                <th className="p-3 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={allChecked} 
                    onChange={toggleAll} 
                    aria-label="Select all orders"
                    className="rounded border-gray-600 bg-background-dark cursor-pointer"
                  />
                </th>
                <th className="p-3 w-32 text-center">ORDER</th>
                <th className="p-3 w-48 text-left pl-4">DATE</th>
                <th className="p-3 w-72 text-left pl-4 pr-4">CUSTOMERS</th>
                <th className="p-3 w-36 text-center">ORDER STATUS</th>
                <th className="p-3 w-36 text-center">PAYMENT STATUS</th>
                <th className="p-3 w-32 text-center">METHOD</th>
                <th className="p-3 w-40 text-center">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="p-3 text-text-secondary text-center" colSpan={8}>Loading...</td></tr>
              )}
              {error && !loading && (
                <tr><td className="p-3 text-red-300 text-center" colSpan={8}>{error}</td></tr>
              )}
              {!loading && paginatedRows.length === 0 && (
                <tr><td className="p-3 text-text-secondary text-center" colSpan={8}>No orders found</td></tr>
              )}
              {!loading && paginatedRows.map((order) => {
                const orderId = order.id || order._id;
                if (!orderId) {
                  return null;
                }
                const orderIdStr = String(orderId);
                const isChecked = selectedIds.includes(orderIdStr);
                return (
                <tr
                  key={orderIdStr}
                  className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (orderIdStr) {
                      onOrderClick(orderIdStr, order);
                    }
                  }}
                >
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => toggleOne(orderIdStr)}
                      className="rounded border-gray-600 bg-background-dark cursor-pointer"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-semibold text-primary">
                      {getDisplayCode(orderId)}
                    </span>
                  </td>
                  <td className="p-3 w-48 text-left pl-4 text-text-secondary">
                    <span className="text-xs whitespace-nowrap">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                    </span>
                  </td>
                  <td className="p-3 w-72 text-left pl-4 pr-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        <img
                          src={`https://i.pravatar.cc/40?u=${encodeURIComponent(order.customerEmail || order.id)}`}
                          alt={order.customerEmail || 'Customer'}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="font-medium text-text-primary truncate">{order.customerName || order.customerEmail?.split('@')[0]?.replace(/\./g, ' ') || 'Customer'}</p>
                        <p className="text-xs text-text-secondary truncate">{order.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center">
                      <Badge color={getStatusColor((order.status || 'Processing') as any)}>
                        {(() => {
                          const status = order.status || 'Processing';
                          // Format status text: capitalize first letter of each word
                          return String(status)
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                            .join(' ');
                        })()}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center">
                      <Badge color={getPaymentStatusColor(paymentStatusFrom(order.paymentStatus || order.status)) as any}>
                        {paymentStatusFrom(order.paymentStatus || order.status)}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center relative group">
                      {(() => {
                        const Icon = getPaymentMethodIcon(order.paymentMethod);
                        const colorClass = getPaymentMethodColor(order.paymentMethod);
                        const label = getPaymentMethodLabel(order.paymentMethod);
                        return (
                          <>
                            <Icon size={20} className={colorClass} />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 border border-gray-700">
                              {label}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                <div className="border-4 border-transparent border-t-gray-800"></div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm font-semibold text-text-primary">
                      {formatVND(Number(order.total) || 0)}
                    </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 text-sm text-text-secondary">
            <p>Showing {displayStartIndex} to {displayEndIndex} of {total} entries</p>
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
