import React from "react";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer" 
    style={{
      backgroundImage: "url('/images/footer.png')",
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="footer-container">
        {/* Opening Hours */}
        <div className="footer-column">
          <h3>OPENING HOURS</h3>
          <ul>
            <li><span>MONDAY</span> <span className="closed">CLOSED</span></li>
            <li><span>TUESDAY</span> <span>9:00 - 22:00</span></li>
            <li><span>WEDNESDAY</span> <span>9:00 - 22:00</span></li>
            <li><span>THURSDAY</span> <span>9:00 - 22:00</span></li>
            <li><span>FRIDAY *</span> <span>9:00 - 1:00</span></li>
            <li><span>SATURDAY *</span> <span>12:00 - 1:00</span></li>
            <li><span>SUNDAY</span> <span>9:00 - 22:00</span></li>
          </ul>
        </div>

        {/* Latest Posts */}
        <div className="footer-column">
          <h3>LATEST POSTS</h3>
          <ul>
            <li>
              <p>EXPAND YOUR MIND, CHANGE EVERYTHING</p>
              <span>14.02.2017</span>
            </li>
            <li>
              <p>PLACES TO GET LOST</p>
              <span>14.02.2017</span>
            </li>
            <li>
              <p>LEWIS HOWES</p>
              <span>14.02.2017</span>
            </li>
            <li>
              <p>ELEVATE YOUR EXPECTATIONS</p>
              <span>14.02.2017</span>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-column">
          <h3>CONTACT US</h3>
          <p>barista@qodeinteractive.com</p>
          <p>1-444-123-4559</p>
          <p>Raymond Boulevard 224,<br />New York</p>

          <h3>THE LAST STANDARD POST</h3>
          <div className="subscribe-box">
            <input type="email" placeholder="Your E-Mail" />
            <button>&gt;</button>
          </div>
        </div>

        {/* Other Locations */}
        <div className="footer-column">
          <h3>OTHER LOCATIONS</h3>
          <p className="location-title">BARISTA COFFEE SHOP</p>
          <p>2606 Saints Alley<br />Tampa, FL 33602</p>

          <p className="location-title">BARISTA CAFE</p>
          <p>3497 Watson Street<br />Camden, NJ 08102</p>
        </div>
      </div>

      {/* Bottom Bar */}
      {/* <div className="footer-bottom">
        <p>© Qode Interactive</p>
        <div className="footer-icons">
          <FaInstagram />
          <FaTwitter />
          <FaFacebookF />
          <FaVimeoV />
          <FaLinkedinIn />
        </div>
        <p>2017 All Rights Reserved</p>
      </div> */}
    </footer>
  );
};

export default Footer;
