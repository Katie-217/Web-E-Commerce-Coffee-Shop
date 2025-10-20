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

      <div className=" wrapper">
        {/* Menu bên trái */}
        <div className="order-menu">
          <ul className="links">
            <li className="active">◆ Take Away</li>
            <li><a>◆ Beans</a></li>
            <li><a>◆ Roast</a></li>
          </ul>

          <div className="note-box">
            <p>◆ Sau khi đặt hàng sẽ có nhân viên liên hệ xác nhận</p>
            <p>◆ Tùy vào số lượng đơn hàng mà thời gian chuẩn bị có thể khác nhau</p>
            <p>◆ Quý khách vui lòng kiểm tra sản phẩm trước khi nhận</p>
          </div>
        </div>

        {/* Danh sách món */}
        <div className="order-list">
          
          {products.map((p) => (
            <div key={p.id} className="order-item">
              <div className="item-info">
                <h4>{p.name}</h4>
                <p>{p.desc}</p>
              </div>
              <span>{p.price ? p.price.toLocaleString() + "đ" : "Liên hệ"}</span>
              <button onClick={() => handleOpenModal(p)}>+</button>
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

        {/* Giỏ hàng */}
        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          decreaseQty={decreaseQty}
          increaseQty={increaseQty}
          total={total}
        />
      </div>
    </div>

  )};
export default TakeAwayList;
