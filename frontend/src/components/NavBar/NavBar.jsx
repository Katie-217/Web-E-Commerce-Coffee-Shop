import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../NavBar/navbar.css';
import { useCart } from '../../contexts/CartContext';


const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(false);           // desktop dropdown (MENU)
  const [openAccount, setOpenAccount] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);       // NEW: mobile drawer
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false); // NEW: submenu in drawer
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 992px)').matches
  ); // NEW: track breakpoint

  const { user, loading, logout } = useAuth();
  const { items } = useCart();

  // tổng số lượng trong giỏ
  const cartCount = (items || []).reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );



  const navigate = useNavigate();
  const accountRef = useRef(null);
  const closeBtnRef = useRef(null);                          // NEW: focus vào nút Close khi mở drawer

  // Close account dropdown when clicking outside
  useEffect(() => {
    const onClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setOpenAccount(false);
      }
    };

    window.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  // NEW: cập nhật isDesktop theo resize (>= 992px)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 992px)');
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // NEW: khi chuyển qua desktop thì tự đóng drawer
  useEffect(() => {
    if (isDesktop && drawerOpen) setDrawerOpen(false);
  }, [isDesktop, drawerOpen]);

  // NEW: khóa scroll khi mở drawer + ESC để đóng
  useEffect(() => {
    const html = document.documentElement;
    if (drawerOpen) {
      html.style.overflow = 'hidden';
      // đẩy focus vào nút close để hỗ trợ keyboard
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    } else {
      html.style.overflow = '';
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setOpenAccount(false);
        setOpenMenu(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    setOpenAccount(false);
    navigate('/');
  };

  const closeDrawer = () => setDrawerOpen(false);            // NEW
const avatarUrl = user?.avatar || user?.avatarUrl || null;

  return (
    <header className="header">
      <div className="header-container">
        {/* NEW: Hamburger chỉ hiện ở mobile */}
        <button
          className="hamburger"
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-controls="mobile-drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(v => !v)}
        >
          <span></span><span></span><span></span>
        </button>

        {/* Nav left (Desktop) */}
        <nav className="nav nav-left">
          <ul className="nav-links">
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/about">ABOUT US</Link></li>

            <li
              className="dropdown"
              onMouseEnter={() => isDesktop && setOpenMenu(true)}
              onMouseLeave={() => isDesktop && setOpenMenu(false)}
            >
              {/* với desktop mở bằng hover; mobile dùng drawer bên dưới */}
              <a href="#" onClick={(e) => e.preventDefault()}>MENU ▾</a>
              {openMenu && isDesktop && (
                <ul className="dropdown-menu">
                  <li>Coffee Sets</li>
                  <li>Cup & Mugs</li>
                  <li><Link to="/menu/takeaway">Roast Coffee</Link></li>
                  <li>Coffee Makers & Grinders</li>
                </ul>
              )}
            </li>

            <li><Link to="/contact">CONTACT US</Link></li>
          </ul>
        </nav>

        {/* Logo center */}
        <div className="logo">
          <Link to="/">
            <img src="/images/logo.png" alt="logo" />
          </Link>
        </div>

        {/* Nav right: Phone + Search + Notification + Cart + Account */}
        <nav className="nav nav-right">

          <div className="searchBox">
            <input className="searchInput" type="text" placeholder="Search..." />
            <button className="searchButton" aria-label="Search">
              <img src="/images/search-icon.svg" alt="Search" />
            </button>
          </div>

          <div className="notification">
            <button className="notifi-btn" aria-label="Notifications">
              <svg viewBox="0 0 448 512" className="bell" aria-hidden="true">
                <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"></path>
              </svg>
              <span className="cart-badge">0</span>

            </button>
          </div>

          <Link to="/cart" className="icon-btn" aria-label="Cart">
            <svg viewBox="0 0 24 24" className="cart-icon" aria-hidden="true">
              <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45A1.99 1.99 0 0 0 10 19h9v-2h-8.42c-.14 0-.25-.11-.25-.25l.03-.12L11.1 14h6.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 22 5h-15V4zM7 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
            </svg>
            <span className="cart-badge">{cartCount}</span>
          </Link>


          {/* Account dropdown */}
          <div className="dropdown account" ref={accountRef}>
            <button
              type="button"
              className="account-link"
              onClick={() => setOpenAccount(v => !v)}
              aria-haspopup="menu"
              aria-expanded={openAccount}
              title={user ? (user.name || 'Account') : 'Sign in'}
            >
              {loading ? (
                <span style={{ padding: '0 8px', fontSize: 12 }}>…</span>
              ) : avatarUrl ? (
                <img className="account-avatar" src={avatarUrl} alt="User avatar" />
              ) : (
                <svg className="account-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z" />
                </svg>
              )}
              <span className="caret">▾</span>
            </button>

            {openAccount && (
              <ul className="dropdown-menu-right" role="menu">
                {!loading && user ? (
                  <>
                    <li>
                      <Link className="user-item" to="/account" onClick={() => setOpenAccount(false)}>
                        My account
                      </Link>
                    </li>
                    <li>
    <Link to="/orders">Order history</Link>
  </li>
                    <li>
                      <Link type="button" className="user-item" onClick={handleLogout}>
                        Sign out
                      </Link>
                    </li>
                  </>

                ) : (

                  <li>
                    <Link className="user-item" to="/login" onClick={() => setOpenAccount(false)}>
                      Sign in
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>
        </nav>
      </div>

      {/* NEW: Backdrop + Drawer cho mobile */}
      <div
        className={`backdrop ${drawerOpen ? 'show' : ''}`}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      />
      <aside
        id="mobile-drawer"
        className={`nav-drawer ${drawerOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="drawer-header">
          <strong>Menu</strong>
          <button
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Close"
            ref={closeBtnRef}
          >
            ×
          </button>
        </div>
        <ul className="drawer-links" role="menu">
          <li role="none"><Link role="menuitem" to="/" onClick={closeDrawer}>HOME</Link></li>
          <li role="none"><Link role="menuitem" to="/about" onClick={closeDrawer}>ABOUT US</Link></li>

          <li className={`accordion ${mobileSubmenuOpen ? 'open' : ''}`}>
            <button
              className="accordion-toggle"
              onClick={() => setMobileSubmenuOpen(v => !v)}
              aria-expanded={mobileSubmenuOpen}
              aria-controls="drawer-submenu"
            >
              MENU <span className="caret">▾</span>
            </button>
            <ul id="drawer-submenu" className="accordion-panel">
              <li>Coffee Sets</li>
              <li>Cup & Mugs</li>
              <li><Link to="/menu/takeaway" onClick={closeDrawer}>Roast Coffee</Link></li>
              <li>Coffee Makers & Grinders</li>
            </ul>
          </li>

          <li role="none"><Link role="menuitem" to="/contact" onClick={closeDrawer}>CONTACT US</Link></li>
        </ul>
      </aside>
    </header>
  );
};

export default Navbar;
