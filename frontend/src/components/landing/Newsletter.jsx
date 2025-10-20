import React from "react";
import "../../styles/newsletter.css";

const Newsletter = () => {
  return (
    <section className="newsletter">
      <div className="newsletter-container">
        <div className="newsletter-text">
          <h2>ĐĂNG KÝ NHẬN KHUYẾN MÃI</h2>
          <p>Đừng bỏ lỡ những sản phẩm và chương trình khuyến mãi hấp dẫn</p>
        </div>

        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Email của bạn"
            aria-label="Email của bạn"
            required
          />
          <button type="submit">ĐĂNG KÝ</button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
