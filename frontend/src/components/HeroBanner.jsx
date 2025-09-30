import React from 'react';
import '../styles/hero.css';

const HeroBanner = () => {
  return (
    // <section className="hero-banner" style={{ background: `url('/images/banner.png') no-repeat center center/cover` }}>

    //     <div className="btn-container">
    //       <button className="shop-btn">
    //         <span className="span">Shop Now</span>
    //       </button>
    //     </div>
    

    // </section>
    <section className="hero" style={{ background: `url('/images/coffee-bg.png') no-repeat center center/cover` }}>
  <div className="hero-content">
    <p className="subtitle">NOW YOU CAN FEEL THE ENERGY</p>
    <h1>Start your day with <br/> a black Coffee</h1>
    <button className="btn-buy">BUY NOW</button>
  </div>

  <div className="hero-image">
    <img src="/images/coffee-cup.png" alt="Coffee Cup" />
  </div>
</section>

  );
};

export default HeroBanner;
