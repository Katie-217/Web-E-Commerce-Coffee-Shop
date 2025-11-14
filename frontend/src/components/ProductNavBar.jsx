// src/components/ProductNavBar.jsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import '../styles/product-navbar.css';

/**
 * Props:
 * - activeCategory: string ('all' | ...)
 * - onCategoryChange: (id:string) => void
 * - categories?: Array<{ id: string, name: string, count?: number, disabled?: boolean }>
 *
 * Nếu không truyền categories, sẽ dùng default.
 */
const DEFAULT_CATEGORIES = [
  { id: 'all',     name: 'All products' },
  { id: 'roasted', name: 'Roasted coffee' },
  { id: 'sets',    name: 'Coffee sets' },
  { id: 'cups',    name: 'Cups & Mugs' },
  { id: 'makers',  name: 'Coffee makers and grinders' },
];

export default function ProductNavBar({
  activeCategory = 'all',
  onCategoryChange,
  categories = DEFAULT_CATEGORIES,
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = (id) => {
    if (onCategoryChange) onCategoryChange(id);

    // Sync URL: /?category=roasted (all => xóa param)
    const next = new URLSearchParams(searchParams);
    if (id && id !== 'all') {
      next.set('category', id);
    } else {
      next.delete('category');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <nav className="product-navbar" aria-label="Product categories">
      <div className="product-navbar-container">
        <ul className="product-navbar-list" role="tablist">
          {categories.map((c) => {
            const isActive = activeCategory === c.id;
            const isDisabled = !!c.disabled;
            return (
              <li key={c.id} className="product-navbar-item" role="presentation">
                <button
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                  className={`product-navbar-link ${isActive ? 'active' : ''}`}
                  onClick={() => !isDisabled && handleClick(c.id)}
                  disabled={isDisabled}
                >
                  <span>{c.name}</span>
                  {typeof c.count === 'number' && (
                    <span className="badge">{c.count}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
