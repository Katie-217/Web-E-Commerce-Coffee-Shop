import React, { useState, useEffect, useMemo } from 'react';
import { fetchCustomerById } from '../../../../api/customers';
import { fetchCustomerOrders } from '../../../../api/customers';
import BackButton from '../../components/BackButton';
import CustomerProfileCard from './components/CustomerProfileCard';
import UpgradeToPremiumCard from './components/UpgradeToPremiumCard';
import CustomerTabs from './components/CustomerTabs';

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
        String(o.id || '').toLowerCase().includes(searchOrder.toLowerCase())
      );
    }
    return filtered;
  }, [orders, searchOrder]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!customerId && customerId !== 0) return;
      try {
        setLoading(true);
        setError(null);
        const idStr = String(customerId);
        const res = await fetchCustomerById(idStr);
        if (!cancelled) {
          const cust = res?.data || res;
          setCustomer(cust);
          // Load orders
          try {
            const o = await fetchCustomerOrders(idStr, { page: 1, limit: 100 });
            setOrders(o?.data || o?.items || []);
          } catch (e) {
            // ignore order fetch errors here
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load customer');
          setCustomer(null);
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
    console.log('Edit details for customer:', customer?._id || customer?.id);
  };

  const handleUpgrade = () => {
    // TODO: Implement upgrade functionality
    console.log('Upgrade customer:', customer?._id || customer?.id);
  };

  const handleDeleteOrder = (orderId: string) => {
    // TODO: Implement delete order functionality
    console.log('Delete order:', orderId);
    // Remove from local state
    setOrders(prev => prev.filter(o => String(o.id || o._id) !== orderId));
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
        <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          Delete Customer
        </button>
      </div>

      {loading && (
        <div className="p-4 rounded-md bg-background-dark border border-gray-700 text-text-secondary">Loading customer...</div>
      )}
      {error && (
        <div className="p-4 rounded-md bg-red-900/30 border border-red-700 text-red-200">{error}</div>
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
            <UpgradeToPremiumCard onUpgrade={handleUpgrade} />
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
              customer={customer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;
