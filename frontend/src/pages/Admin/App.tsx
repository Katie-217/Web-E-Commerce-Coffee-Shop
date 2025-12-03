import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/dashboard/Dashboard';
import Products from './pages/products/Products';
import Orders from './pages/orders/Orders';
import Customers from './pages/customers/CustomerList';
import CustomerDetail from './pages/customers/CustomerDetail';
import AddCustomer from './pages/customers/AddCustomer';
import AddProduct from './pages/products/AddProduct/AddProductPage';
import CategoryList from './pages/products/category/CategoryList';
import ProductDetail from './pages/products/ProductDetail/ProductDetail';
import { Product } from './types';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Route protection: chỉ cho phép admin đã đăng nhập
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Chưa đăng nhập → redirect về login
        navigate('/login', { state: { from: { pathname: '/admin' } } });
      } else if (user.role !== 'admin') {
        // Đã đăng nhập nhưng không phải admin → redirect về home
        navigate('/');
      }
    }
  }, [user, loading, navigate]);
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderData, setSelectedOrderData] = useState<any | null>(null);
  const [orderDetailFromCustomer, setOrderDetailFromCustomer] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
  const [productsRefreshTrigger, setProductsRefreshTrigger] = useState(0);

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Product List':
        return (
          <Products
            setActivePage={setActivePage}
            selectedCategory={selectedCategoryFilter}
            onClearSelectedCategory={() => setSelectedCategoryFilter(null)}
            refreshTrigger={productsRefreshTrigger}
            onProductClick={(product) => {
              // Get product ID
              const derivedId =
                (product as any)?._id ??
                (product as any)?.id ??
                (product as any)?.productId ??
                product.id ??
                null;
              
              // Set product data and navigate
              setSelectedProduct(product);
              setSelectedProductId(derivedId);
              setActivePage('Product Detail');
            }}
          />
        );
      case 'Add Product':
        return (
          <AddProduct 
            onBack={() => {
              setProductsRefreshTrigger(prev => prev + 1); // Trigger refresh
              setActivePage('Product List');
            }} 
            setActivePage={(page) => {
              if (page === 'Product List') {
                setProductsRefreshTrigger(prev => prev + 1); // Trigger refresh
              }
              setActivePage(page);
            }} 
          />
        );
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
          initialOrderData={selectedOrderData}
          fromCustomer={orderDetailFromCustomer}
          onOrderClose={() => {
            setSelectedOrderId(null);
            setSelectedOrderData(null);
            setOrderDetailFromCustomer(false);
          }}
          onBackToCustomer={() => {
            setSelectedOrderId(null);
            setSelectedOrderData(null);
            setOrderDetailFromCustomer(false);
            setActivePage('Customer Detail');
          }}
        />;
      case 'Customers':
        return <Customers 
          onSelectCustomer={(id) => { 
            setSelectedCustomerId(id); 
            setActivePage('Customer Detail'); 
          }}
          setActivePage={setActivePage}
        />;
      case 'Add Customer':
        return <AddCustomer 
          onBack={() => setActivePage('Customers')} 
          setActivePage={setActivePage} 
        />;
      case 'Customer Detail':
        return <CustomerDetail 
          customerId={selectedCustomerId} 
          onBack={() => {
            setSelectedCustomerId(null);
            setActivePage('Customers');
          }} 
          onOrderClick={(orderId, orderData) => {
            // Set state ngay lập tức - pass orderData để tránh fetch lại
            setSelectedOrderId(orderId);
            setSelectedOrderData(orderData || null);
            setOrderDetailFromCustomer(true);
            setActivePage('Orders');
          }}
        />;
      case 'Product Detail':
        return (
          <ProductDetail
            productId={selectedProductId}
            initialProduct={
              selectedProduct
                ? {
                    id: selectedProductId || (selectedProduct as any).id || (selectedProduct as any)._id,
                    name: selectedProduct.name,
                    sku: (selectedProduct as any).sku,
                    description: (selectedProduct as any).description,
                    category: (selectedProduct as any).category,
                    price: (selectedProduct as any).price,
                    quantity: (selectedProduct as any).quantity,
                    status: (selectedProduct as any).status,
                    stock: (selectedProduct as any).stock,
                    imageUrl: (selectedProduct as any).imageUrl,
                  }
                : undefined
            }
            onBack={() => {
              setSelectedProduct(null);
              setSelectedProductId(null);
              setProductsRefreshTrigger(prev => prev + 1); // Trigger refresh
              setActivePage('Product List');
            }}
          />
        );
      default:
        return <Dashboard />;
    }
  };

  // Hiển thị loading hoặc không hiển thị gì khi đang kiểm tra auth
  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="admin-panel-root flex min-h-screen bg-background-dark text-text-primary items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-root flex min-h-screen bg-background-dark text-text-primary relative">
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
        }}
        // Mobile / tablet dùng isSidebarOpen, desktop (lg+) luôn hiển thị sidebar như layout gốc
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      {/* Row 1: Header with logo and controls */}
      <div className="fixed left-0 right-0 top-0 h-14 md:h-16 z-50">
        <Header
          logoUrl="/images/logo.png"
          onToggleSidebar={() => setIsSidebarOpen((o) => !o)}
        />
      </div>
      {/* Nút menu cố định dưới header, ngay trên menu option khi full màn (desktop) – tăng khoảng cách với header */}
      <button
        className="hidden lg:flex fixed z-40 p-2 md:p-3 rounded-md bg-background-light border border-gray-700 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors
          top-16 md:top-20 left-4"
        aria-label="Toggle sidebar"
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen((o) => !o);
        }}
      >
        <span className="sr-only">Toggle menu</span>
        <svg
          className="w-4 h-4 md:w-5 md:h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      {/* Overlay khi sidebar mở - chỉ hiển thị trên mobile/tablet, desktop vẫn thấy nội dung bên phải */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Main content - có padding trên desktop, không có padding trên mobile */}
      <div className={`flex-1 flex flex-col pt-14 md:pt-16 pb-4 md:pb-8 lg:pl-72 overflow-x-hidden max-w-full`}>
        <div className="flex-1 p-3 md:p-4 lg:p-6 xl:p-8 min-w-0 max-w-full overflow-x-hidden">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default App;