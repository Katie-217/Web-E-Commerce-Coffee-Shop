import React from "react";
import "../../styles/newsletter.css";

const Newsletter = () => {
  return (
    <section className="newsletter">
      <div className="newsletter-container">
        <div className="newsletter-text">
          <h2>Get the Latest Deals & Updates!</h2>
          <p>We are committed to keeping your information safe and secure.</p>
          <p>
           Enjoy an instant <strong>5% discount</strong>when you subscribe today.
          </p>
        </div>

        <form className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email address..."
            required
          />
          <button type="submit">SUBSCRIBE NOW</button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
