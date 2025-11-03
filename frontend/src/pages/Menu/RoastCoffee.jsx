import React from 'react';
import './styles/menu.css';
import MenuCatalogSection from '../Catalog/components/MenuCatalogSection';

const items = [
  { id: 301, name: 'Vietnam Arabica', type: 'Light Roast', brand: 'Vietnam', desc: 'Bright acidity, floral and citrus notes.', price: 49000, img: '/images/Arabica-coffee.png' },
  { id: 302, name: 'Robusta – Strong & Bold', type: 'Dark Roast', brand: 'Vietnam', desc: 'High caffeine, bold finish, rich crema.', price: 54000, img: '/images/Robusta-coffee.jpg' },
  { id: 303, name: 'Ethiopia Yirgacheffe', type: 'Light Roast', brand: 'Ethiopia', desc: 'Floral, citrus-forward cup.', price: 59000, img: '/images/Ethiopia-coffee.png' },
  { id: 304, name: 'Colombia Supremo', type: 'Medium Roast', brand: 'Colombia', desc: 'Balanced with nutty undertones.', price: 52000, img: '/images/Classic-coffee.png' },
  { id: 305, name: 'Special Edition Blend', type: 'Dark Roast', brand: 'Blend', desc: 'Chocolate and spice notes.', price: 62000, img: '/images/SpecialEdition-coffee.png' },
];

export default function RoastCoffee() {
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
            <h1>Roast Coffee</h1>
            <p>Signature roasted beans for every brewing style</p>
          </div>
        </div>
      </section>

      <MenuCatalogSection breadcrumbLabel="Home / Menu / Roast Coffee" initialProducts={items} />
    </main>
  );
}


