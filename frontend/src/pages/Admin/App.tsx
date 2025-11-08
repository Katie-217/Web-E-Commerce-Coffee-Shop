import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Orders from './pages/orders/Orders';
import Customers from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import AddProduct from './pages/products/AddProduct';
import CategoryList from './pages/products/CategoryList';
import Settings from './pages/settings/Settings';
import StoreDetails from './pages/settings/StoreDetails';
import Payments from './pages/settings/Payments';
import Checkout from './pages/settings/Checkout';
import ShippingDelivery from './pages/settings/ShippingDelivery';
import Locations from './pages/settings/Locations';
import Notifications from './pages/settings/Notifications';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetailFromCustomer, setOrderDetailFromCustomer] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Product List':
        return <Products 
          setActivePage={setActivePage} 
          selectedCategory={selectedCategoryFilter}
          onClearSelectedCategory={() => setSelectedCategoryFilter(null)}
        />;
      case 'Add Product':
        return <AddProduct onBack={() => setActivePage('Product List')} setActivePage={setActivePage} />;
      case 'Category List':
        return <CategoryList 
          setActivePage={setActivePage}
          onCategoryClick={(categoryName) => {
            setSelectedCategoryFilter(categoryName);
            setActivePage('Product List');
          }}
        />;
      case 'Orders':
        return <Orders 
          initialOrderId={selectedOrderId} 
          fromCustomer={orderDetailFromCustomer}
          onOrderClose={() => {
            setSelectedOrderId(null);
            setOrderDetailFromCustomer(false);
          }}
          onBackToCustomer={() => {
            setSelectedOrderId(null);
            setOrderDetailFromCustomer(false);
            setActivePage('Customer Detail');
          }}
        />;
      case 'Customers':
        return <Customers onSelectCustomer={(id) => { setSelectedCustomerId(id); setActivePage('Customer Detail'); }} />;
      case 'Customer Detail':
        return <CustomerDetail 
          customerId={selectedCustomerId} 
          onBack={() => setActivePage('Customers')} 
          onOrderClick={(orderId) => {
            setSelectedOrderId(orderId);
            setOrderDetailFromCustomer(true);
            setActivePage('Orders');
          }}
        />;
      case 'Store Details':
        return <StoreDetails />;
      case 'Payments':
        return <Payments />;
      case 'Checkout':
        return <Checkout />;
      case 'Shipping & Delivery':
        return <ShippingDelivery />;
      case 'Locations':
        return <Locations />;
      case 'Notifications':
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background-dark text-text-primary relative">
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Row 1: Header with logo and controls */}
      <div className="fixed left-0 right-0 top-0 h-16 z-20">
        <Header logoUrl="/images/logo.png" />
      </div>
      {/* Compact menu button under header */}
      <button
        className="fixed top-20 left-4 z-50 p-3 rounded-md bg-background-light border border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white"
        aria-label="Toggle sidebar"
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen((o) => !o);
        }}
      >
        <span className="sr-only">Toggle menu</span>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-y-auto pt-16 pl-72 pb-8`}>
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;