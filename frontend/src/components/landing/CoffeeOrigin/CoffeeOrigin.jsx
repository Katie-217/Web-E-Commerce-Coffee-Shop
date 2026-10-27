import React, { useState } from 'react';
import './coffee-origin.css';

const CoffeeOrigin = () => {
  const [selectedOrigin, setSelectedOrigin] = useState('Highlands');

  const origins = ['Highlands', 'Bui Van Ngo', 'La Viet', 'Trung Nguyen', 'Cong'];


  return (
    <section className="coffee-origin"
    style={{ 
        backgroundImage: `url('/images/origin-bg.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center'
      }}>
      <div className="container">
        <div className="origin-layout">
          {/* Left Column - Brand Story & Heritage */}
          <article className="promo-column">
            <header>
              <h2>Vietnamese Coffee Heritage</h2>
              <p className="subtitle">Tradition and passion in every coffee bean</p>
            </header>
            <div className="content-body">
              <p>
                Since 1857, coffee has become an integral part of Vietnamese culture. 
                We proudly inherit the <strong>160-year tradition</strong> of Vietnamese coffee industry, 
                bringing you coffee beans carefully selected from the most fertile regions.
              </p>
              <p>
                Each coffee bean is <strong>hand-roasted</strong> using traditional methods, 
                combined with modern technology to create unique flavors, 
                rich in Vietnamese identity.
              </p>
              <ul className="heritage-list">
                <li>✓ 160 years of experience</li>
                <li>✓ Traditional roasting methods</li>
                <li>✓ Preserving Vietnamese coffee culture</li>
                <li>✓ International quality certification</li>
              </ul>
            </div>
            <footer>
              <a href="/about" className="show-products" aria-label="Learn more about coffee history">Discover Our History</a>
            </footer>
          </article>

          {/* Middle Column - Interactive Origin Selection */}
          <section className="origin-column">
            <header>
              <h3>Discover Coffee Regions</h3>
              <p className="origin-description">
                Each region brings unique coffee flavors and characteristics. 
                Choose your favorite region to explore its distinctive features.
              </p>
            </header>
            <nav className="origin-navigation" aria-label="Select coffee growing region">
              <p className="origin-prompt">Choose your coffee region:</p>
              <div className="origin-list" role="tablist">
                {origins.map((origin) => (
                  <button
                    key={origin}
                    className={`origin-item ${selectedOrigin === origin ? 'selected' : ''}`}
                    onClick={() => setSelectedOrigin(origin)}
                    role="tab"
                    aria-selected={selectedOrigin === origin}
                    aria-label={`Coffee from ${origin} region`}
                    type="button"
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </nav>
            <div className="origin-info" aria-live="polite">
              <div className="origin-details">
                <h4 className="origin-title">
                  {selectedOrigin === 'Highlands' && 'Central Highlands Region'}
                  {selectedOrigin === 'Bui Van Ngo' && 'Bui Van Ngo Coffee'}
                  {selectedOrigin === 'La Viet' && 'La Viet Coffee'}
                  {selectedOrigin === 'Trung Nguyen' && 'Trung Nguyen Coffee'}
                  {selectedOrigin === 'Cong' && 'Cong Coffee'}
                </h4>
                <p className="selected-origin-description">
                  {selectedOrigin === 'Highlands' && 'Fertile red basalt soil and cool climate create rich, aromatic coffee flavors characteristic of the Central Highlands.'}
                  {selectedOrigin === 'Bui Van Ngo' && 'Traditional coffee brand with secret roasting formula, delivering rich flavors that embody Vietnamese identity.'}
                  {selectedOrigin === 'La Viet' && 'Modern style with refined flavors suitable for specialty coffee trends, popular among young people.'}
                  {selectedOrigin === 'Trung Nguyen' && 'National brand with distinctive rich flavors, representing Vietnamese coffee excellence worldwide.'}
                  {selectedOrigin === 'Cong' && 'Classic style with retro atmosphere, traditional flavors loved by multiple generations.'}
                </p>
                <div className="origin-stats">
                  <span className="stat-item">🌡️ Temperature: 18-25°C</span>
                  <span className="stat-item">🌱 Altitude: 800-1500m</span>
                  <span className="stat-item">☕ Types: Arabica & Robusta</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column - Service & Experience */}
          <div className="cta-column">
            <h3>Service & Experience</h3>
            <p>We are committed to delivering the perfect coffee experience with professional and dedicated service.</p>
            <div className="service-features">
              <div className="service-item">
                <span className="service-icon">🚚</span>
                <div className="service-content">
                  <h4>Fast Delivery</h4>
                  <p>Free delivery within 24h for orders from $25</p>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">☕</span>
                <div className="service-content">
                  <h4>Custom Roasting</h4>
                  <p>Fresh roasting on order, ensuring maximum freshness and quality</p>
                </div>
              </div>
              <div className="service-item">
                <span className="service-icon">🎁</span>
                <div className="service-content">
                  <h4>Special Gifts</h4>
                  <p>Complimentary brewing guide and premium coffee accessories</p>
                </div>
              </div>
            </div>
            <div className="cta-actions">
              <button className="cta-button primary">Order Now</button>
              <button className="cta-button secondary">Free Consultation</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoffeeOrigin;



