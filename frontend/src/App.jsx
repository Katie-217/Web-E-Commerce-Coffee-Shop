import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Public pages
import HomePage from './pages/HomePage';
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
import ContactPage from './pages/ContactPage';
import Menu from './pages/Menu';
import Navbar from './components/NavBar';
import TakeAwayList from './pages/Catalog/TakeAwayList';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />
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
        {/* <Route path="/menu" element={<Menu/>} /> */}
        <Route path = "/menu/takeaway" element={<TakeAwayList/>}/>
        <Route path="/contact" element={<ContactPage />} />

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
