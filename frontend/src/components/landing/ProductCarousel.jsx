import React, { useEffect, useRef, useState } from "react";
import ProductNavBar from "../ProductNavBar";
import "../../styles/product-carousel.css";
import { Eye, X, ShoppingCart } from "lucide-react";

const sampleProducts = [
  {
    id: 1,
    name: "Coffee Cafe Specials",
    category: "Instant Mix",
    type: "Cappuccino",
    description:
      "This pack contains 7 sachets of Tata Coffee Cafe Specials instant coffee mix. Enjoy cafe-style frothy coffee at home with an instant mix.",
    price: "530.00 USD",
    oldPrice: "600.00 USD",
    discount: 12,
    img: "/images/coffee-special.png",
    colors: ["Cuppuccino", "Hazinut"],
  },
  {
    id: 2,
    name: "Bean Envy Coffee Canister",
    category: "Accessories",
    type: "Storage",
    description:
      "Keep your coffee fresh with Bean Envy's stainless steel airtight canister.",
    price: "560.00 USD",
    oldPrice: "600.00 USD",
    discount: 17,
    img: "/images/canister.png",
    colors: ["Grey", "Black", "White"],
  },
  {
    id: 3,
    name: "Classic Arabica Coffee",
    category: "Bean",
    type: "Whole Bean",
    description:
      "Premium Arabica coffee beans roasted to perfection for smooth flavor and rich aroma.",
    price: "39.00 USD",
    oldPrice: "49.00 USD",
    discount: 20,
    img: "/images/Arabica-coffee.png",
    colors: ["Brown"],
  },
  {
    id: 4,
    name: "Robusta Honey Blend",
    category: "Bean",
    type: "Honey Process",
    description:
      "Sweet, syrupy body with notes of caramel and cacao. Great for espresso blends.",
    price: "42.00 USD",
    oldPrice: "55.00 USD",
    discount: 18,
    img: "/images/RobustaHoney-coffee.png",
    colors: ["Brown"],
  },
  {
    id: 5,
    name: "Valse Signature Roast",
    category: "Bean",
    type: "Medium Roast",
    description:
      "Balanced cup with chocolate and dried fruit notes. Daily driver favorite.",
    price: "29.00 USD",
    oldPrice: "39.00 USD",
    discount: 11,
    img: "/images/Valse-coffee.jpg",
    colors: ["Brown"],
  },
  {
    id: 6,
    name: "Robusta – Strong & Bold",
    category: "Bean",
    type: "Dark Roast",
    description:
      "High caffeine kick, rich crema and bold finish. Perfect for milk drinks.",
    price: "32.00 USD",
    oldPrice: "45.00 USD",
    discount: 16,
    img: "/images/Robusta-coffee.jpg",
    colors: ["Brown"],
  },
  {
    id: 7,
    name: "Ethiopia Yirgacheffe",
    category: "Bean",
    type: "Light Roast",
    description:
      "Bright and floral with citrus notes. Perfect for pour-over brewing.",
    price: "45.00 USD",
    oldPrice: "55.00 USD",
    discount: 18,
    img: "/images/Ethiopia-coffee.png",
    colors: ["Brown"],
  },
  {
    id: 8,
    name: "Colombia Supremo",
    category: "Bean",
    type: "Medium Roast",
    description:
      "Rich and balanced with nutty undertones. Great for any brewing method.",
    price: "38.00 USD",
    oldPrice: "48.00 USD",
    discount: 21,
    img: "/images/Classic-coffee.png",
    colors: ["Brown"],
  },
  {
    id: 9,
    name: "Special Edition Blend",
    category: "Bean",
    type: "Dark Roast",
    description:
      "Limited edition blend with chocolate and spice notes. Exclusive seasonal offering.",
    price: "52.00 USD",
    oldPrice: "65.00 USD",
    discount: 20,
    img: "/images/SpecialEdition-coffee.png",
    colors: ["Brown"],
  },
  {
    id: 10,
    name: "Vietnam Arabica",
    category: "Bean",
    type: "Medium Roast",
    description:
      "Smooth and mellow with subtle earthiness. Perfect for Vietnamese coffee style.",
    price: "35.00 USD",
    oldPrice: "42.00 USD",
    discount: 17,
    img: "/images/ArabicaViet-coffee.png",
    colors: ["Brown"],
  },
  {
    id: 11,
    name: "Coffee Grinder Pro",
    category: "Accessories",
    type: "Grinder",
    description:
      "Professional burr grinder for consistent grind size. Essential for coffee enthusiasts.",
    price: "120.00 USD",
    oldPrice: "150.00 USD",
    discount: 20,
    img: "/images/coffee-grinder.png",
    colors: ["Black", "Silver"],
  },
  {
    id: 12,
    name: "French Press Deluxe",
    category: "Accessories",
    type: "Brewer",
    description:
      "Premium French press with double-wall insulation. Perfect for full immersion brewing.",
    price: "65.00 USD",
    oldPrice: "80.00 USD",
    discount: 19,
    img: "/images/french-press.png",
    colors: ["Black", "Red"],
  },
];

const AUTO_SCROLL_INTERVAL_MS = 3800;
const SCROLL_ITEMS_PER_STEP = 2;

const ProductCarousel = ({ products = sampleProducts }) => {
  const containerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Auto scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const columnWidth = () => {
      const firstGrid = container.querySelector(".pc-grid-container");
      if (!firstGrid) return 0;
      return firstGrid.clientWidth / 6; // 1 cột = 1/6 grid width (6 cột)
    };

    let timer = setInterval(() => {
      const width = columnWidth();
      if (width === 0) return;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + width >= maxScroll) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: width, behavior: "smooth" });
      }
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <section className="pc-section">
      <div className="pc-head">
        <h1 className="bg-text">Products</h1>
        <span className="pc-eyebrow">Our Service</span>
        <h2>Coffee Blends and Roasts for Discerning Tastes</h2>
      </div>

      <ProductNavBar
        onCategoryChange={handleCategoryChange}
        activeCategory={activeCategory}
      />

      <div className="container">
        <div className="pc-row" ref={containerRef}>
          <div className="pc-grid-container">
            {products.map((p) => (
              <article key={p.id} className="pc-item">
                {/* Hình ảnh + Eye icon */}
                <div className="pc-thumb">
                  {p.discount && (
                    <span className="pc-discount">-{p.discount}%</span>
                  )}
                  <img src={p.img} alt={p.name} />
                  <div
                    className="pc-eye"
                    onClick={() => setSelectedProduct(p)}
                    title="Quick View"
                  >
                    <Eye size={18} />
                  </div>
                </div>

                {/* Thông tin sản phẩm */}
                <div className="pc-meta">
                  <p className="pc-category">{p.category || "Bean"}</p>
                  <h3 className="pc-title">{p.name}</h3>
                  <p className="pc-type">{p.type}</p>

                  {/* Chọn màu */}
                  <select className="pc-select">
                    {p.colors.map((color, i) => (
                      <option key={i}>{color}</option>
                    ))}
                  </select>

                  {/* Giá */}
                  <div className="pc-price-row">
                    <span className="pc-price">{p.price}</span>
                    {p.oldPrice && <span className="pc-old">{p.oldPrice}</span>}
                  </div>

                  <button className="pc-add">+ ADD TO CART</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* --- Dialog (Quick View) --- */}
      {selectedProduct && (
        <div className="pc-modal">
          <div className="pc-modal-content">
            <button
              className="pc-modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              <X size={20} />
            </button>

            <div className="pc-modal-body">
              <div className="pc-modal-left">
                <img
                  src={selectedProduct.img}
                  alt={selectedProduct.name}
                  className="pc-modal-img"
                />
              </div>
              <div className="pc-modal-right">
                <h3>{selectedProduct.name}</h3>
                <p className="pc-desc">{selectedProduct.description}</p>

                <p>
                  <strong>Material:</strong> {selectedProduct.type}
                </p>

                <div className="pc-materials">
                  {selectedProduct.colors.map((m, i) => (
                    <button key={i} className="pc-material-btn">
                      {m}
                    </button>
                  ))}
                </div>

                <div className="pc-price-row">
                  <span className="pc-price">{selectedProduct.price}</span>
                  {selectedProduct.oldPrice && (
                    <span className="pc-old">{selectedProduct.oldPrice}</span>
                  )}
                </div>

                <div className="pc-modal-actions">
                  <button className="pc-cart-btn">
                    <ShoppingCart size={16} />
                    Add To Cart
                  </button>

                  <div className="pc-qty">
                    <button>-</button>
                    <span>1</span>
                    <button>+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductCarousel;
