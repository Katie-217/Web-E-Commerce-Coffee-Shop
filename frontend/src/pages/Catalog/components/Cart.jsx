import React from "react";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from "react-swipeable-list";
import "react-swipeable-list/dist/styles.css";

const Cart = ({ cart, removeFromCart, decreaseQty, increaseQty, total }) => {
  return (
    <div className="order-cart">
      <h3>CHI TIẾT ĐƠN HÀNG</h3>
      <SwipeableList>
        {cart.map((c) => (
          <SwipeableListItem
            key={c.id}
            trailingActions={
              <TrailingActions>
                <SwipeAction destructive={true} onClick={() => removeFromCart(c.id)}>
                  Xóa
                </SwipeAction>
              </TrailingActions>
            }
          >
            <div className="cart-item">
              <span>{c.name}</span>
              <span>
                {c.price ? (c.price * c.qty).toLocaleString() + "đ" : "0đ"}
              </span>
              <div className="cart-actions">
                <button onClick={() => decreaseQty(c.id)}>-</button>
                <span className="qty">{c.qty}</span>
                <button onClick={() => increaseQty(c)}>+</button>
              </div>
            </div>
          </SwipeableListItem>
        ))}
      </SwipeableList>

      <hr />
      <div className="total">
        <p>Tổng cộng:</p>
        <p>{total.toLocaleString()}đ</p>
      </div>
      <button className="order-btn">ĐẶT HÀNG</button>
      
      {/* Note box moved here */}
      <div className="note-box">
        <p>◆ Sau khi đặt hàng sẽ có nhân viên liên hệ xác nhận</p>
        <p>◆ Tùy vào số lượng đơn hàng mà thời gian chuẩn bị có thể khác nhau</p>
        <p>◆ Quý khách vui lòng kiểm tra sản phẩm trước khi nhận</p>
      </div>
    </div>
  );
};

export default Cart;













