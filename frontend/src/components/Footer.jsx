import React from "react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-left">
          <div className="brand">
            <img src="/images/logo.png" alt="Monster Coffee" />
          </div>
          <p>
            Monster Coffee mong rằng chúng tôi luôn mang đến cho khách hàng những trải
            nghiệm tốt nhất, tạo ra những khoảnh khắc khó quên khi đến với Monster.
          </p>
          <div className="footer-socials">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-block">
            <h3>HỆ THỐNG CỬA HÀNG</h3>
            <ul>
              <li>CN1: Tầng 6 tòa nhà Ladeco, 266 Đội Cấn, phường Liễu Giai, Hà Nội, Việt Nam</li>
              <li>CN2: Tòa nhà Lữ Gia, 70 Lữ Gia, phường 15, quận 11, TP. HCM, Việt Nam</li>
            </ul>
          </div>
          <div className="footer-block">
            <h3>LIÊN HỆ</h3>
            <ul>
              <li>Hotline đặt hàng: 19006750</li>
              <li>Email: support@sapo.vn</li>
              <li>Thứ 2 - Thứ 6: 7am - 10pm</li>
              <li>Thứ 7 - Chủ nhật: 8am - 9pm</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>@ Bản quyền thuộc về Awesome Team | Cung cấp bởi <a href="https://www.sapo.vn" target="_blank" rel="noreferrer">Sapo</a></p>
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          ↑
        </button>
      </div>
    </footer>
  );
};

export default Footer;
