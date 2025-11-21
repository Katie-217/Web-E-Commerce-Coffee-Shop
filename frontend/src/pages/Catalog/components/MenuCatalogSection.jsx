import React, { useState } from "react";
import OrderModal from "./OrderModal";
import "../../Menu/styles/menu-modal.css";

export default function MenuCatalogSection({ breadcrumbLabel = "Home / Coffee Menu", initialProducts = [] }) {
  const [products] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempSize, setTempSize] = useState("M");

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setTempQty(1);
    setTempSize("");
    setShowModal(true);
  };

  const addToCart = (item) => {
    const exist = cart.find((c) => c.id === item.id);
    if (exist) {
      setCart(
        cart.map((c) => (c.id === item.id ? { ...c, qty: (c.qty || 0) + 1 } : c))
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // Derive facets from current products
  const productTypes = Array.from(
    new Set(products.map((p) => p.type).filter(Boolean))
  );
  const productBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean))
  );

  return (
    <div className="catalog-wrapper">
      {/* Filter sidebar bên trái */}
      <div className="filter-sidebar">
        <div className="filter-topbar">
          <h3>Filters</h3>
          <button className="filter-reset" title="Reset all" aria-label="Reset all filters" onClick={() => {}}>
            {/* reset icon (circular arrow) */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12a9 9 0 1 1-3.04-6.72" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 3v6h-6" stroke="#ddd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* AVAILABILITY Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>AVAILABILITY</h4>
            <span>0 selected</span>
          </div>
          <div className="filter-options">
            <label>
              <input type="checkbox" />
              In stock (4)
            </label>
            <label>
              <input type="checkbox" />
              Out of stock (1)
            </label>
          </div>
        </div>

        {/* PRICE Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>PRICE</h4>
          </div>
          <p className="price-info">The highest price is 59,000đ</p>
          <div className="price-inputs">
            <div>
              <label>Min price:</label>
              <input type="number" placeholder="0" />
            </div>
            <div>
              <label>Max price:</label>
              <input type="number" placeholder="59000" />
            </div>
          </div>
        </div>

        {/* PRODUCT TYPE Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>PRODUCT TYPE</h4>
            <span>{productTypes.length} types</span>
          </div>
          <div className="filter-options">
            {productTypes.length === 0 && (
              <div className="empty-facet">No type data</div>
            )}
            {productTypes.map((t) => (
              <label key={t}>
                <input type="checkbox" />
                {t} ({products.filter((p) => p.type === t).length})
              </label>
            ))}
          </div>
        </div>

        {/* BRAND Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>BRAND</h4>
            <span>{productBrands.length} brands</span>
          </div>
          <div className="filter-options">
            {productBrands.length === 0 && (
              <div className="empty-facet">No brand data</div>
            )}
            {productBrands.map((b) => (
              <label key={b}>
                <input type="checkbox" />
                {b} ({products.filter((p) => p.brand === b).length})
              </label>
            ))}
          </div>
        </div>

        {/* SIZE Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>SIZE</h4>
            <span>0 selected</span>
          </div>
          <div className="filter-options">
            <label>
              <input type="checkbox" />
              Small (2)
            </label>
            <label>
              <input type="checkbox" />
              Medium (4)
            </label>
            <label>
              <input type="checkbox" />
              Large (2)
            </label>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Breadcrumb và Sort */}
        <div className="catalog-header">
          <div className="breadcrumb">
            <span>{breadcrumbLabel}</span>
          </div>
          <div className="sort-section">
            <span>Sort by:</span>
            <select className="sort-select">
              <option>Best selling</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-image">
                <img src={p.img || "/images/coffee1.jpg"} alt={p.name} />
                <div className="product-badges">
                  <span className="discount-badge">-20%</span>
                  <span className="new-badge">New</span>
                </div>
                <div className="product-actions">
                  <button className="action-btn">♡</button>
                  <button className="action-btn">⇄</button>
                  <button className="action-btn">👁</button>
                </div>
              </div>
              <div className="product-info">
                <h3 className="product-title">{p.name}</h3>
                <p className="product-desc">{p.desc}</p>
                <select className="variant-select">
                  <option>Medium</option>
                  <option>Large</option>
                </select>
                <div className="product-price">
                  <span className="current-price">{p.price ? p.price.toLocaleString() + "đ" : "Liên hệ"}</span>
                  {p.price && <span className="old-price">75,000đ</span>}
                </div>
                <div className="product-cta">
                  <button className="add-to-cart" onClick={() => handleOpenModal(p)}>
                     ADD TO CART
                  </button>
                  <button className="buy-now" onClick={() => handleOpenModal(p)}>
                    BUY NOW
                  </button>
                </div>
              </div>
              {showModal && (
                <OrderModal
                  selectedProduct={selectedProduct}
                  tempQty={tempQty}
                  setTempQty={setTempQty}
                  tempSize={tempSize}
                  setTempSize={setTempSize}
                  onAdd={() => {
                    setCart([...cart, { ...selectedProduct, size: tempSize, qty: tempQty }]);
                    setShowModal(false);
                  }}
                  onClose={() => setShowModal(false)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


