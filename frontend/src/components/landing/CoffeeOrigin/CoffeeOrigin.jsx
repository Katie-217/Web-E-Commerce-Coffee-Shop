import React, { useState } from 'react';
import './coffee-origin.css';

const CoffeeOrigin = () => {
  const [selectedOrigin, setSelectedOrigin] = useState('Trung Nguyen');

  const origins = ['Trung Nguyen', 'Highlands', 'Phuc Long', 'The Coffee House'];

  return (
    <section
      className="coffee-origin"
      style={{
        backgroundImage: `url('/images/origin-bg.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
      }}
    >
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
                Since 1857, coffee has become an integral part of Vietnamese culture. We proudly
                inherit the <strong>160-year tradition</strong> of Vietnamese coffee industry,
                bringing you coffee beans carefully selected from the most fertile regions.
              </p>
              <p>
                Each coffee bean is <strong>hand-roasted</strong> using traditional methods,
                combined with modern technology to create unique flavors, rich in Vietnamese
                identity.
              </p>
              <ul className="heritage-list">
                <li>✓ 160 years of experience</li>
                <li>✓ Traditional roasting methods</li>
                <li>✓ Preserving Vietnamese coffee culture</li>
                <li>✓ International quality certification</li>
              </ul>
            </div>
            <footer>
              <a href="/about" className="show-products" aria-label="Learn more about coffee history">
                Discover Our History
              </a>
            </footer>
          </article>

          {/* Middle Column - Interactive Brand Selection */}
          <section className="origin-column">
            <header>
              <h3>Discover Vietnamese Coffee Brands</h3>
              <p className="origin-description">
                From heritage roasters to modern specialty chains, each brand brings its own
                signature roasting style and flavor profile.
              </p>
            </header>
            <nav className="origin-navigation" aria-label="Select coffee brand">
              <p className="origin-prompt">Choose your coffee brand:</p>
              <div className="origin-list" role="tablist">
                {origins.map((origin) => (
                  <button
                    key={origin}
                    className={`origin-item ${selectedOrigin === origin ? 'selected' : ''}`}
                    onClick={() => setSelectedOrigin(origin)}
                    role="tab"
                    aria-selected={selectedOrigin === origin}
                    aria-label={`Coffee from ${origin} brand`}
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
                  {selectedOrigin === 'Trung Nguyen' && 'Trung Nguyen Legend'}
                  {selectedOrigin === 'Highlands' && 'Highlands Coffee'}
                  {selectedOrigin === 'Phuc Long' && 'Phuc Long Coffee & Tea'}
                  {selectedOrigin === 'The Coffee House' && 'The Coffee House'}
                </h4>
                <p className="selected-origin-description">
                  {selectedOrigin === 'Trung Nguyen' &&
                    'The pioneering Vietnamese coffee brand with bold, multi-layered blends that represent the spirit of Vietnamese coffee around the world.'}
                  {selectedOrigin === 'Highlands' &&
                    'Urban coffee chain inspired by the Central Highlands, offering balanced flavors and familiar drinks for everyday enjoyment.'}
                  {selectedOrigin === 'Phuc Long' &&
                    'Famous for strong coffee and fragrant tea, delivering a rich, memorable cup that reflects Saigon’s vibrant lifestyle.'}
                  {selectedOrigin === 'The Coffee House' &&
                    'Modern coffee space focusing on smooth, easy-to-drink flavors and a cozy atmosphere for working, meeting and relaxing.'}
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
            <p>
              We are committed to delivering the perfect coffee experience with professional and
              dedicated service.
            </p>
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
