import React, { useState, useEffect, useMemo } from 'react';
import { fetchCustomerById } from '../../../../api/customers';
import { fetchCustomerOrders } from '../../../../api/customers';
import { OrdersApi } from '../../../../api/orders';
import BackButton from '../../components/BackButton';
import CustomerProfileCard from './components/detail/CustomerProfileCard';
import CustomerTabs from './components/detail/CustomerTabs';

const getDisplayCode = (val: string | number | undefined | null) => {
  const s = String(val || '');
  if (!s) return '';
  const hex = s.replace(/[^a-fA-F0-9]/g, '') || s;
  const last4 = hex.slice(-4).padStart(4, '0');
  return `#${last4}`;
};

type Props = {
  customerId: string | number | null;
  onBack: () => void;
  onOrderClick?: (orderId: string) => void;
};

const CustomerDetail: React.FC<Props> = ({ customerId, onBack, onOrderClick }) => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Security' | 'Address & Billing' | 'Notifications'>('Overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOrder, setSearchOrder] = useState('');
  const ITEMS_PER_PAGE = 6;

  const primaryAddress = useMemo(() => {
    const arr: any[] = customer?.addresses || [];
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const pick = (type: string) => arr.find((a: any) => (a.type || '').toLowerCase() === type && a.isDefault)
      || arr.find((a: any) => (a.type || '').toLowerCase() === type);
    const a = pick('shipping') || arr[0];
    if (!a) return null;
    return {
      street: [a.addressLine1, a.addressLine2].filter(Boolean).join(', '),
      city: a.city || '',
      state: a.district || '',
      zip: a.postalCode || '',
      country: a.country || ''
    };
  }, [customer]);

  // Calculate stats from orders
  const stats = useMemo(() => {
    const ordersCount = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    return { ordersCount, totalSpent };
  }, [orders]);

  // Filter and paginate orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;
    if (searchOrder) {
      filtered = orders.filter(o =>
        String(o.id || o._id || '').toLowerCase().includes(searchOrder.toLowerCase()) ||
        String(o.orderNumber || '').toLowerCase().includes(searchOrder.toLowerCase())
      );
    }
    return filtered;
  }, [orders, searchOrder]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchOrder]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!customerId && customerId !== 0) {
        setError('No customer ID provided');
        setCustomer(null);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Clean and validate customer ID
        const idStr = String(customerId).trim();
        if (!idStr) {
          throw new Error('Invalid customer ID');
        }
        
        const res = await fetchCustomerById(idStr);
        
        if (!cancelled) {
          // Check if response indicates success
          if (res?.success === false) {
            throw new Error(res?.message || 'Customer not found');
          }
          
          const cust = res?.data || res;
          if (!cust || (!cust._id && !cust.id)) {
            throw new Error('Customer not found');
          }
          
          setCustomer(cust);
          
          // Load orders
          try {
            const o = await fetchCustomerOrders(idStr, { page: 1, limit: 100 });
            const orderList = o?.data || o?.items || [];
            const ordersArray = Array.isArray(orderList) ? orderList : [];
            setOrders(ordersArray);
          } catch (e: any) {
            setOrders([]);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load customer';
          setError(errorMessage);
          setCustomer(null);
          setOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [customerId]);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleEditDetails = () => {
    // TODO: Implement edit details functionality
  };


  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${getDisplayCode(orderId)}?`)) {
      return;
    }
    try {
      // TODO: Implement delete order API call
      // await deleteOrder(orderId);
      // Remove from local state
      setOrders(prev => prev.filter(o => String(o.id || o._id) !== orderId));
    } catch (error: any) {
      alert(error?.message || 'Failed to delete order');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await OrdersApi.updateStatus(orderId, newStatus);
      // Update local state
      setOrders(prev => prev.map(o => {
        const id = String(o.id || o._id);
        if (id === orderId) {
          return { ...o, status: newStatus };
        }
        return o;
      }));
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={onBack} className="w-fit" />
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              {customer?._id ? `Customer ID ${getDisplayCode(customer._id)}` : 'Customer'}
            </h2>
            <p className="text-sm text-text-secondary">
              {customer?.createdAt ? formatDate(customer.createdAt) : 'Aug 17, 2020, 5:48 (ET)'}
            </p>
          </div>
        </div>
        <button 
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete customer ${getDisplayCode(customer?._id || customer?.id)}?`)) {
              // TODO: Implement delete customer functionality
            }
          }}
        >
          Delete Customer
        </button>
      </div>

      {loading && (
        <div className="p-6 rounded-lg bg-background-light border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <p className="text-text-secondary">Loading customer...</p>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="p-6 rounded-lg bg-red-900/20 border border-red-700/50">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-200 mb-2">Customer not found</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Customers
            </button>
          </div>
        </div>
      )}

      {customer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Customer Profile */}
          <div className="space-y-6">
            <CustomerProfileCard
              customer={customer}
              stats={stats}
              primaryAddress={primaryAddress}
              onEditDetails={handleEditDetails}
            />
          </div>

          {/* Right Section - Overview and Orders */}
          <div className="lg:col-span-2 space-y-6">
            <CustomerTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              orders={paginatedOrders}
              searchOrder={searchOrder}
              onSearchChange={setSearchOrder}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onOrderClick={onOrderClick}
              onDeleteOrder={handleDeleteOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              customer={customer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
