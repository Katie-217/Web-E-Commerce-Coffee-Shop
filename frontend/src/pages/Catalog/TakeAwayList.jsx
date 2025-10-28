import React, { useState } from "react";
import "../../styles/takeaway.css";
import "../../styles/takeaway/modal.css";
import "../../styles/takeaway/cart.css";
import OrderModal from "./components/OrderModal";
import Cart from "./components/Cart";

const products = [
{ id: 1, name: "Mocha Recipe", desc: "Mocha is a blend of espresso and steamed milk with a touch of chocolate flavor.", price: 49000 },
{ id: 2, name: "Vanilla Latte", desc: "A smooth latte with a hint of sweet vanilla for a comforting taste.", price: null },
{ id: 3, name: "Latte", desc: "A creamy balance of espresso and steamed milk, perfect for any time of the day.", price: 49000 },
{ id: 4, name: "Americano", desc: "Bold espresso diluted with hot water for a strong yet smooth coffee.", price: 46000 },
{ id: 5, name: "Iced Espresso", desc: "A chilled shot of espresso served over ice for a refreshing kick.", price: null },
{ id: 6, name: "Caramel Latte", desc: "Espresso mixed with steamed milk and rich caramel syrup for a sweet delight.", price: 54000 },
{ id: 7, name: "Cafe Cappuccino", desc: "A classic mix of espresso, steamed milk, and milk foam in perfect harmony.", price: 54000 },
{ id: 8, name: "Espresso", desc: "A rich, concentrated shot of coffee with a bold and intense flavor.", price: 59000 },
];

const TakeAwayList = () => {
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

    // tìm sản phẩm trong giỏ
  const findInCart = (id) => cart.find((c) => c.id === id);

  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

    // trailing action (kéo sang phải)
  // trailing actions moved inside Cart component

  // thêm sản phẩm (mặc định qty = 1 nếu chưa có)
  const addToCart = (item) => {
    const exist = findInCart(item.id);
    if (exist) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]); 
    }
  };

  // tăng số lượng
  const increaseQty = (item) => {
    setCart(
      cart.map((c) =>
        c.id === item.id ? { ...c, qty: c.qty + 1 } : c
      )
    );
  };

  // giảm số lượng
  const decreaseQty = (id) => {
    const exist = findInCart(id);
    if (!exist) return;
    if (exist.qty <= 1) {
      setCart(cart.filter((c) => c.id !== id));
    } else {
      setCart(
        cart.map((c) =>
          c.id === id ? { ...c, qty: c.qty - 1 } : c
        )
      );
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.qty || 0)),0);
    
  return (
    <div className="order-container">
       <section className="takeaway-hero"
         style={{ 
         backgroundImage: "url('/images/takeaway-hero.png')",
         backgroundRepeat: 'no-repeat',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
        }}>
         <div className="container">
          <div className="hero-content">
             <h1>About Our Coffee Journey</h1>
             <p>From the highlands of Vietnam to your cup, we bring you the finest coffee experience</p>
           </div>
         </div>
       </section>

      <div className="catalog-wrapper">
        {/* Filter sidebar bên trái */}
        <div className="filter-sidebar">
          <h3>Filters</h3>
          
          {/* AVAILABILITY Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>AVAILABILITY</h4>
              <span>0 selected</span>
              <button className="reset-btn">Reset</button>
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
              <button className="reset-btn">Reset</button>
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
              <span>0 selected</span>
              <button className="reset-btn">Reset</button>
            </div>
            <div className="filter-options">
              <label>
                <input type="checkbox" />
                Coffee (8)
              </label>
            </div>
          </div>

          {/* BRAND Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>BRAND</h4>
              <span>0 selected</span>
              <button className="reset-btn">Reset</button>
            </div>
            <div className="filter-options">
              <label>
                <input type="checkbox" />
                Coffee Shop (8)
              </label>
            </div>
          </div>

          {/* SIZE Filter */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>SIZE</h4>
              <span>0 selected</span>
              <button className="reset-btn">Reset</button>
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
              <span>Home / Coffee Menu</span>
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
                  <img src="/images/coffee1.jpg" alt={p.name} />
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
                  <button className="add-to-cart" onClick={() => handleOpenModal(p)}>
                    + ADD TO CART
                  </button>
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
    </div>

  )};
export default TakeAwayList;
