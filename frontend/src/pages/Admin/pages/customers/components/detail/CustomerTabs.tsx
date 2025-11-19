import React from 'react';
import { User, Lock, MapPin, Bell } from 'lucide-react';
import OverviewCards from './OverviewCards';
import OrdersPlacedTable from './OrdersPlacedTable';
import SecurityTab from './SecurityTab';
import NotificationsTab from './NotificationsTab';
import AddressBillingTab from './AddressBillingTab';

type CustomerTabsProps = {
  activeTab: 'Overview' | 'Security' | 'Address & Billing' | 'Notifications';
  onTabChange: (tab: 'Overview' | 'Security' | 'Address & Billing' | 'Notifications') => void;
  orders: any[];
  searchOrder: string;
  onSearchChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOrderClick?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  customer?: any;
};

const CustomerTabs: React.FC<CustomerTabsProps> = ({
  activeTab,
  onTabChange,
  orders,
  searchOrder,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  onOrderClick,
  onDeleteOrder,
  onUpdateOrderStatus,
  customer,
}) => {
  return (
    <>
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        {(['Overview', 'Security', 'Address & Billing', 'Notifications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab === 'Overview' && <User size={16} />}
              {tab === 'Security' && <Lock size={16} />}
              {tab === 'Address & Billing' && <MapPin size={16} />}
              {tab === 'Notifications' && <Bell size={16} />}
              {tab}
            </div>
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <OverviewCards />
          <OrdersPlacedTable
            orders={orders}
            searchOrder={searchOrder}
            onSearchChange={onSearchChange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onOrderClick={onOrderClick}
            onDeleteOrder={onDeleteOrder}
            onUpdateOrderStatus={onUpdateOrderStatus}
          />
        </>
      )}

      {activeTab === 'Security' && <SecurityTab customer={customer} />}

      {activeTab === 'Address & Billing' && <AddressBillingTab customer={customer} />}

      {activeTab === 'Notifications' && <NotificationsTab />}
    </>
  );
};

export default CustomerTabs;

