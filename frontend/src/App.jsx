import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/style.css';
// Public pages
import CategoryList from './pages/Catalog/CategoryList';
import ProductList from './pages/Catalog/ProductList';
import ProductDetail from './pages/Catalog/ProductDetail';
import CartPage from './pages/Cart/CartPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AccountPage from './pages/Account/AccountPage';
import OrderHistory from './pages/Orders/OrderHistory';
import OrderDetail from './pages/Orders/OrderDetail';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Users from './pages/Admin/Users';
import NotFound from './pages/NotFound';
import AboutPage from './pages/AboutPage';
// Landing sections
import Menu from './components/landing/Menu';
import SalePoints from './components/landing/SalePoints';
import Partners from './components/landing/Partners';
import Discount from './components/landing/Discount';
import RecentPosts from './components/landing/RecentPosts';
import Newsletter from './components/landing/Newsletter';
import ProductCarousel from './components/landing/ProductCarousel';
import Footer from './components/Footer';
import Process from './components/landing/Process';
import Navbar from './components/NavBar';
import HeroBanner from './components/HeroBanner';
import TestimonialFooterSection from './components/landing/TestimonialFooterSection';
import WhyChooseUs from './components/landing/Whychooseus';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Catalog */}
        <Route path="/" element={
          <>
            <HeroBanner />
            <SalePoints />
            <WhyChooseUs/>
            
            <ProductCarousel />
            <Menu />
            
           
            <TestimonialFooterSection />
            {/* <Partners />
            <Discount /> */}
            <Process />
           
            <RecentPosts />
            <Newsletter />
            <Footer />
          </>
        } />
        <Route path="/category/:categoryId" element={<ProductList />} />
        <Route path="/product/:productId" element={<ProductDetail />} />

        {/* Cart & Checkout */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Auth & Account */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Orders */}
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />

        {/* Admin */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/users" element={<Users />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
