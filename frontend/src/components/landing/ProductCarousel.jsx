import React, { useEffect, useRef } from 'react';
import '../../styles/product-carousel.css';

const sampleProducts = [
  { id: 1, name: 'The Acacia Hills Blend', price: '$29.00', oldPrice: '$39.00', img: '/images/Arabica-coffee.png', rating: 4, sale: true },
  { id: 2, name: 'Blend of Strong Coffee', price: '$45.00', img: '/images/Ethiopia-coffee.png', rating: 5, sale: false },
  { id: 3, name: 'Space Coffee Blend', price: '$72.00', oldPrice: '$85.00', img: '/images/Robusta-coffee.jpg', rating: 3, sale: true },
  { id: 4, name: 'Ethiopian Roast', price: '$39.00', img: '/images/Roasted-coffee.jpg', rating: 4 },
  { id: 5, name: 'Kenya AA', price: '$49.00', oldPrice: '$59.00', img: '/images/Valse-coffee.jpg', rating: 5, sale: true },
  { id: 6, name: 'Colombian Medium', price: '$32.00', img: '/images/Classic-coffee.png', rating: 4 },
  { id: 7, name: 'Sumatra Dark', price: '$34.00', img: '/images/SpecialEdition-coffee.png', rating: 3 },
  { id: 8, name: 'Guatemala Huehuetenango', price: '$36.00', img: '/images/ArabicaViet-coffee.png', rating: 4 },
  { id: 9, name: 'Robusta Honey', price: '$36.00', oldPrice: '$45.00', img: '/images/RobustaHoney-coffee.png', rating: 5, sale: true }
];

const AUTO_SCROLL_INTERVAL_MS = 2500;
const SCROLL_ITEMS_PER_STEP = 1;

const ProductCarousel = ({ products = sampleProducts }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const itemWidth = () => {
      const first = container.querySelector('.pc-item');
      return first ? first.clientWidth : 0;
    };

    let timer = setInterval(() => {
      const width = itemWidth();
      if (width === 0) return;
      const step = width * SCROLL_ITEMS_PER_STEP;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + step >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pc-section">
      <div className="pc-head">
          <h1 className="bg-text">Products</h1>
          <span className="pc-eyebrow">Our Service</span>
          <h2>Coffee Blends and Roasts for Discerning Tastes</h2>
      </div>
      <div className="container">
        <div className="pc-row" ref={containerRef}>
          {products.map(p => (
            <article key={p.id} className="pc-item">
              <div className="pc-thumb">
                {p.sale && <span className="pc-sale">SALE</span>}
                <img src={p.img} alt={p.name} />
              </div>
              <div className="pc-meta">
                <h3 className="pc-title">{p.name}</h3>

                {/* Rating sao */}
                <div className="pc-rating">
                  {'★'.repeat(p.rating || 0)}{'☆'.repeat(5 - (p.rating || 0))}
                </div>

                {/* Giá gốc + giá giảm */}
                <div className="pc-price-wrap">
                  {p.oldPrice && <span className="pc-old-price">{p.oldPrice}</span>}
                  <span className="pc-price">{p.price}</span>
                </div>

                {/* Nút Add to cart */}
                <button className="pc-cart-btn">Add to Cart</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
