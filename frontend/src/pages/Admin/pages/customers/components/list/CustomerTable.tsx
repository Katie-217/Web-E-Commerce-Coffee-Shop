import React from 'react';
import Badge from '../../../../components/Badge';
import { formatVND } from '../../../../../../utils/currency';
import { getDisplayCode, getCustomerCountry } from '../../utils/helpers';
import { normalizeCountry } from '../../constants/countries';

type CustomerTableProps = {
  customers: any[];
  selectedIds: string[];
  orderStats: Record<string, { totalOrders: number; totalSpent: number; firstOrder?: string; country?: string }>;
  loading: boolean;
  error: string | null;
  allChecked: boolean;
  onToggleAll: () => void;
  onToggleOne: (id: string) => void;
  onSelectCustomer: (id: string) => void;
};

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  selectedIds,
  orderStats,
  loading,
  error,
  allChecked,
  onToggleAll,
  onToggleOne,
  onSelectCustomer,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700 text-sm text-text-secondary">
            <th className="p-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={onToggleAll}
                aria-label="Select all customers"
              />
            </th>
            <th className="p-3">Customer</th>
            <th className="p-3 whitespace-nowrap">Customer ID</th>
            <th className="p-3 whitespace-nowrap">Country</th>
            <th className="p-3 whitespace-nowrap">Status</th>
            <th className="p-3 text-center whitespace-nowrap">Total Orders</th>
            <th className="p-3 text-right whitespace-nowrap pl-8">Total Spent</th>
            <th className="p-3 whitespace-nowrap pl-8">Member Since</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className="p-3 text-text-secondary" colSpan={8}>
                Loading...
              </td>
            </tr>
          )}
          {error && !loading && (
            <tr>
              <td className="p-3 text-red-300" colSpan={8}>
                {error}
              </td>
            </tr>
          )}
          {!loading &&
            !error &&
            customers.map((customer: any) => {
              const id = String(customer.id || customer._id);
              const stats = orderStats[(customer.email || '').toLowerCase()];
              const totalOrders = stats?.totalOrders ?? customer.totalOrders ?? customer.orderCount ?? 0;
              const totalSpent = stats?.totalSpent ?? Number(customer.totalSpent ?? customer.totalPayment ?? 0);
              const memberSince = stats?.firstOrder || customer.createdAt || customer.joinedAt;
              const countryDisplay = getCustomerCountry(customer, stats?.country, normalizeCountry) || '—';
              return (
                <tr
                  key={id}
                  className="border-b border-gray-700 hover:bg-gray-800/40 transition-colors cursor-pointer"
                  onClick={() => onSelectCustomer(id)}
                >
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={() => onToggleOne(id)}
                      aria-label={`Select customer ${customer.fullName || customer.name}`}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={customer.avatarUrl || customer.avatar}
                        alt={customer.fullName || customer.name}
                        className="w-9 h-9 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-text-primary">{customer.fullName || customer.name}</p>
                        <p className="text-xs text-text-secondary">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary">{getDisplayCode(id)}</td>
                  <td className="p-3 text-text-secondary whitespace-nowrap">{countryDisplay}</td>
                  <td className="p-3">
                    <Badge
                      color={
                        customer.status === 'inactive'
                          ? 'yellow'
                          : customer.status === 'banned'
                            ? 'red'
                            : 'green'
                      }
                    >
                      {(customer.status || 'active').toString()}
                    </Badge>
                  </td>
                  <td className="p-3 text-center text-text-secondary whitespace-nowrap">{totalOrders}</td>
                  <td className="p-3 text-right text-text-secondary whitespace-nowrap pl-8">
                    {formatVND(totalSpent)}
                  </td>
                  <td className="p-3 text-text-secondary whitespace-nowrap pl-8">
                    {memberSince
                      ? new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                        }).format(new Date(memberSince))
                      : '—'}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;

