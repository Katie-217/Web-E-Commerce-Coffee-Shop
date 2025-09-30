import React from "react";
import "../../styles/whychooseus.css";

const WhyChooseUs = () => {
  return (
    <section className="why-container">
      <div className="why-content">
        <div className="why-text">
          <p className="subtitle">WHY CHOOSE US</p>
          <h2 className="title">Best in taste, best in coffee</h2>
          <p className="desc">
            Vietnamese coffee is world-famous for its bold taste, lingering sweetness and unique phin brewing style.
            Grown on the fertile basalt highlands, our coffee delivers a pure, authentic experience that stands out from the rest.
          </p>

          <div className="features">
            <div className="feature-item">
              <span className="icon">
                <img src="/images/check-circle.svg" alt="check" />
              </span>
              <div>
                <h4>Sourced from the Highlands</h4>
                <p>
                  Carefully selected from renowned coffee regions like Buon Ma Thuot and Lam Dong 
                  – the coffee capital of Vietnam.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span className="icon">
                <img src="/images/check-circle.svg" alt="check" />
              </span>
              <div>
                <h4>Bold Flavor</h4>
                <p>
                  Rich in caffeine and strong in character, 
                  Vietnamese's coffee offers a signature taste you’ll never forget.
                </p>
              </div>
            </div>

            <div className="feature-item">
              <span className="icon">
                <img src="/images/check-circle.svg" alt="check" />
              </span>
              <div>
                <h4>100% Organic</h4>
                <p>
                  No blends, no artificial flavors – only clean,
                  high-quality coffee beans roasted to perfection.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="why-image">
          <img
            src="/images/coffee-bags.png"
            alt="Coffee bags"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
