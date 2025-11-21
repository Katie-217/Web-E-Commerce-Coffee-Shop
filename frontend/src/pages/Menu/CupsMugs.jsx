import React from 'react';
import './styles/menu.css';
import MenuCatalogSection from '../Catalog/components/MenuCatalogSection';

const items = [
  { id: 201, name: 'Stoneware Mug 350ml', type: 'Drinkware', brand: 'Mug', desc: 'Matte finish, heat-friendly', price: 79000, img: '/images/coffee-cup.png' },
  { id: 202, name: 'Glass Cup 250ml', type: 'Drinkware', brand: 'Glass', desc: 'Double-wall insulation', price: 99000, img: '/images/coffee-cup.png' },
  { id: 203, name: 'Travel Mug 450ml', type: 'Drinkware', brand: 'Travel', desc: 'Spill resistant lid', price: 149000, img: '/images/coffee-cup.png' },
  { id: 204, name: 'Espresso Cup 90ml', type: 'Drinkware', brand: 'Espresso', desc: 'Thick wall porcelain', price: 59000, img: '/images/coffee-cup.png' },
];

export default function CupsMugs() {
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
            <h1>Cup & Mugs</h1>
            <p>Everyday drinkware designed for coffee lovers</p>
          </div>
        </div>
      </section>

      <MenuCatalogSection breadcrumbLabel="Home / Menu / Cup & Mugs" initialProducts={items} />
    </main>
  );
}


