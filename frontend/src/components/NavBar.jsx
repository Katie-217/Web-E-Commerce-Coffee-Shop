import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Nav left */}
        <nav className="nav nav-left">
          <ul className="nav-links">
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/about">ABOUT US</Link></li>
            <li><a href="#services">SERVICES</a></li>
            <li><a href="#portfolio">MENU</a></li>
            <li><a href="#contact">CONTACT US</a></li>
            <li><a href="#blog">PROFILE</a></li>           
          </ul>
        </nav>

        {/* Logo center */}
        <div className="logo">
          <Link to="/">
            <img src="/images/logo.png" alt="logo" />
          </Link>
        </div>

        {/* Nav right: Phone + Search + Cart + CTA */}
        <nav className="nav nav-right">
          <a href="tel:+8774850700" className="phone-link">+ 877 . 485 . 0700</a>
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
          <button className="icon-btn" aria-label="Cart">
            <svg viewBox="0 0 24 24" className="cart-icon" aria-hidden="true">
              <path d="M7 4h-2l-1 2h2l3.6 7.59-1.35 2.45A1.99 1.99 0 0 0 10 19h9v-2h-8.42c-.14 0-.25-.11-.25-.25l.03-.12L11.1 14h6.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 22 5h-15V4zM7 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
            </svg>
            <span className="cart-badge">0</span>
          </button>
          
        </nav>




      </div>
    </header>
  );
};

export default Navbar;
