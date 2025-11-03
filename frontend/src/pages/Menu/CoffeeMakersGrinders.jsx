import React from 'react';
import './styles/menu.css';
import MenuCatalogSection from '../Catalog/components/MenuCatalogSection';

const items = [
  { id: 401, name: 'Hand Grinder', type: 'Gear', brand: 'Grinder', desc: 'Stainless burrs, precise grind', price: 329000, img: '/images/coffee-inspection.png' },
  { id: 402, name: 'Pour-over Dripper', type: 'Gear', brand: 'Dripper', desc: 'Cone design for clean brews', price: 159000, img: '/images/coffee-packing.png' },
  { id: 403, name: 'French Press 600ml', type: 'Gear', brand: 'French Press', desc: 'Rich and full-bodied coffee', price: 239000, img: '/images/coffee-roast.png' },
  { id: 404, name: 'Gooseneck Kettle', type: 'Gear', brand: 'Kettle', desc: 'Controlled pour for pour-over', price: 279000, img: '/images/coffee-delivery.png' },
];

export default function CoffeeMakersGrinders() {
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
            <h1>Coffee Makers & Grinders</h1>
            <p>Tools and gears for perfect home brewing</p>
          </div>
        </div>
      </section>

      <MenuCatalogSection breadcrumbLabel="Home / Menu / Coffee Makers & Grinders" initialProducts={items} />
    </main>
  );
}


