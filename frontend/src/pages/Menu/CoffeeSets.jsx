import React from 'react';
import './styles/menu.css';
import MenuCatalogSection from '../Catalog/components/MenuCatalogSection';

const items = [
  { id: 101, name: 'Classic Coffee Set', type: 'Set', brand: 'Bundle', desc: '2 beans + 2 cups bundle', price: 129000, img: '/images/coffee-bags.png' },
  { id: 102, name: 'Home Barista Kit', type: 'Set', brand: 'Bundle', desc: 'Starter set for espresso lovers', price: 199000, img: '/images/coffee-beans.png' },
  { id: 103, name: 'Gift Set – Signature', type: 'Set', brand: 'Gift', desc: 'Curated beans & accessories', price: 259000, img: '/images/reserved.svg' },
  { id: 104, name: 'Tasting Trio', type: 'Set', brand: 'Sampler', desc: 'Three origins sampler pack', price: 99000, img: '/images/quality.svg' },
];

export default function CoffeeSets() {
  return (
    <main className="order-container">
      <section className="takeaway-hero"
        style={{ 
          backgroundImage: "url('/images/takeaway-hero.png')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        <div className="container">
          <div className="hero-content">
            <h1>Coffee Sets</h1>
            <p>Bundles curated for gifting and home brewing</p>
          </div>
        </div>
      </section>

      <MenuCatalogSection breadcrumbLabel="Home / Menu / Coffee Sets" initialProducts={items} />
    </main>
  );
}


