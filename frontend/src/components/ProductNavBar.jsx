import React, { useState } from 'react';
import '../styles/product-navbar.css';

const ProductNavBar = ({ onCategoryChange, activeCategory = 'all' }) => {
  const categories = [
    { id: 'all', name: 'All products' },
    { id: 'roasted', name: 'Roasted coffee' },
    { id: 'sets', name: 'Coffee sets' },
    { id: 'cups', name: 'Cups & Mugs' },
    { id: 'makers', name: 'Coffee makers and grinders' }
  ];

  const handleCategoryClick = (categoryId) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  return (
    <nav className="product-navbar">
      <div className="product-navbar-container">
        <ul className="product-navbar-list">
          {categories.map((category) => (
            <li key={category.id} className="product-navbar-item">
              <button
                className={`product-navbar-link ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ProductNavBar;
