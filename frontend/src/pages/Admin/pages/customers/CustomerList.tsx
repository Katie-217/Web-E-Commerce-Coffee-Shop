import React, { useEffect, useState } from 'react';
import { fetchCustomers } from '../../../../api/customers';
import { OrdersApi } from '../../../../api/orders';
import { normalizeCountry } from './constants/countries';
import { parseDisplayDate } from './utils/helpers';
import CustomerListHeader from './components/list/CustomerListHeader';
import FilterSection from './components/list/FilterSection';
import CustomerTable from './components/list/CustomerTable';
import Pagination from './components/list/Pagination';

type CustomerListProps = {
  onSelectCustomer: (id: string) => void;
  setActivePage?: (page: string) => void;
};

const CustomerList: React.FC<CustomerListProps> = ({ onSelectCustomer, setActivePage }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [ordersMin, setOrdersMin] = useState('');
  const [ordersMax, setOrdersMax] = useState('');
  const [joinStart, setJoinStart] = useState('');
  const [joinEnd, setJoinEnd] = useState('');
  const [orderStats, setOrderStats] = useState<
    Record<string, { totalOrders: number; totalSpent: number; firstOrder?: string; country?: string }>
  >({});

  const allChecked = selectedIds.length === customers.length && customers.length > 0;
  const noneChecked = selectedIds.length === 0;

  function toggleAll() {
    if (allChecked) setSelectedIds([]);
    else setSelectedIds(customers.map((u: any) => String(u._id || u.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((selected) =>
      selected.includes(id)
        ? selected.filter((i) => i !== id)
        : [...selected, id]
    );
  }

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: Record<string, any> = { q, page: 1, limit: 50 };
        if (statusFilter) params.status = statusFilter;
        if (countryFilter) params.country = countryFilter;
        if (ordersMin) params.ordersMin = Number(ordersMin);
        if (ordersMax) params.ordersMax = Number(ordersMax);
        const startISO = parseDisplayDate(joinStart);
        const endISO = parseDisplayDate(joinEnd);
        if (startISO) params.joinDateFrom = startISO;
        if (endISO) params.joinDateTo = endISO;

        const res = await fetchCustomers(params);
        const items = res?.data || res?.items || [];

        let aggregated: Record<string, { totalOrders: number; totalSpent: number; firstOrder?: string; country?: string }> = {};
        try {
          const ordersRes = await OrdersApi.list({ page: 1, limit: 1000, includeItems: 'false' });
          const orderItems = Array.isArray(ordersRes?.data)
            ? ordersRes.data
            : Array.isArray(ordersRes?.items)
              ? ordersRes.items
              : [];
          aggregated = orderItems.reduce((acc, order) => {
            const email = String(order.customerEmail || order.customer?.email || '').toLowerCase();
            if (!email) return acc;
            const entry = acc[email] || { totalOrders: 0, totalSpent: 0, firstOrder: undefined, country: undefined };
            entry.totalOrders += 1;
            entry.totalSpent += Number(order.total) || 0;
            const createdAt = order.createdAt || order.created_at;
            if (createdAt && (!entry.firstOrder || createdAt < entry.firstOrder)) {
              entry.firstOrder = createdAt;
            }
            const shippingCountry =
              order.shippingAddress?.country ||
              order.shipping?.address?.country ||
              order.customer?.address?.country ||
              order.customer?.country ||
              order.address?.country;
            if (shippingCountry && !entry.country) {
              entry.country = normalizeCountry(shippingCountry);
            }
            acc[email] = entry;
            return acc;
          }, {} as Record<string, { totalOrders: number; totalSpent: number; firstOrder?: string; country?: string }>);
        } catch (err) {
        }

        if (!cancelled) {
          setCustomers(items);
          setOrderStats(aggregated);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load customers');
          setCustomers([]);
          setOrderStats({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [q, statusFilter, countryFilter, ordersMin, ordersMax, joinStart, joinEnd]);

  const handleResetFilters = () => {
    setStatusFilter('');
    setCountryFilter('');
    setOrdersMin('');
    setOrdersMax('');
    setJoinStart('');
    setJoinEnd('');
  };

  const handleExport = (type: 'csv' | 'excel' | 'pdf') => {
    // TODO: Implement export functionality
  };

  return (
    <div className="bg-background-light p-6 rounded-lg shadow-lg">
      <CustomerListHeader
        searchValue={q}
        onSearchChange={setQ}
        onAddCustomer={() => setActivePage && setActivePage('Add Customer')}
        exportDisabled={noneChecked}
        onExport={handleExport}
      />

      <FilterSection
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        countryFilter={countryFilter}
        onCountryFilterChange={setCountryFilter}
        ordersMin={ordersMin}
        onOrdersMinChange={setOrdersMin}
        ordersMax={ordersMax}
        onOrdersMaxChange={setOrdersMax}
        joinStart={joinStart}
        onJoinStartChange={setJoinStart}
        joinEnd={joinEnd}
        onJoinEndChange={setJoinEnd}
        onResetFilters={handleResetFilters}
      />

      <CustomerTable
        customers={customers}
        selectedIds={selectedIds}
        orderStats={orderStats}
        loading={loading}
        error={error}
        allChecked={allChecked}
        onToggleAll={toggleAll}
        onToggleOne={toggleOne}
        onSelectCustomer={onSelectCustomer}
      />

      <Pagination totalItems={customers.length} />
    </div>
  );
};

export default CustomerList;
