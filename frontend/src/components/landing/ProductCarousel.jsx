import React, { useEffect, useRef, useState } from "react";
import ProductNavBar from "../ProductNavBar";
import "../../styles/product-carousel.css";
import { Eye, X, ShoppingCart } from "lucide-react";
import { getProducts, getProduct } from "../../services/products";


const CATEGORY_MAP = {
  all: undefined,           // không filter
  roasted: 'roasted',       // ví dụ BE dùng 'roasted' (coffee hạt rang)
  sets: 'sets',             // bộ sản phẩm
  cups: 'cups',             // cốc & ly
  makers: 'makers',         // máy pha & grinder
};

const AUTO_SCROLL_INTERVAL_MS = 3800;

function resolveImage(src) {
  const fallback = "/images/placeholder.png";
  if (!src) return fallback;

  // URL tuyệt đối
  if (/^https?:\/\//i.test(src)) return src;

  // Ảnh trong frontend/public/images → dùng nguyên
  if (src.startsWith("/images/") || src.startsWith("images/")) {
    return src.startsWith("/") ? src : `/${src}`;
  }

  // Chỉ prefix API_BASE cho đường dẫn thật sự của BE (vd. /uploads, /files)
  const API_BASE = process.env.REACT_APP_API_BASE || import.meta?.env?.VITE_API_BASE || "";
  if (API_BASE && (src.startsWith("/uploads/") || src.startsWith("/files/") || src.startsWith("/static/"))) {
    return API_BASE.replace(/\/$/, "") + src;
  }

  // Nếu chỉ là tên file → fallback coi như ảnh trong public/images
  return `/images/${src.replace(/^\/+/, "")}`;
}





function formatPrice(n) {
  if (n == null) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(n));

}
function getSizeVar(p) {
  return p?.variants?.find(v => v.name === 'size');
}

function getPriceWithSize(p, optIdx = 0) {
  const base = Number(p?.price || 0);
  const sizeVar = getSizeVar(p);
  const delta = Number(sizeVar?.options?.[optIdx]?.priceDelta || 0);
  return base + delta;
}


const ProductCarousel = () => {
  const containerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // data từ backend
  const [products, setProducts] = useState([]); // [{_id,name,price,images:[],...}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState({}); // { [id]: indexOption }
  const [qtyById, setQtyById] = useState({});
  const getQty = (id, stock) => {
    const q = qtyById[id] ?? 1;
    const max = Number.isFinite(stock) ? stock : 99;
    return Math.max(1, Math.min(q, max));
  };
  const changeQty = (id, delta, stock) => {
    setQtyById(prev => {
      const current = prev[id] ?? 1;
      const max = Number.isFinite(stock) ? stock : 99;
      const next = Math.max(1, Math.min(current + delta, max));
      return { ...prev, [id]: next };
    });
  };

  useEffect(() => {
    if (!selectedProduct) return;
    const id = String(selectedProduct._id || selectedProduct.id);
    setQtyById(prev => ({ ...prev, [id]: 1 }));
  }, [selectedProduct]);
  // Auto scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const columnWidth = () => {
      const card = containerRef.current?.querySelector('.pc-item');
      // chiều rộng 1 card + gap (đang dùng 24px trong CSS)
      const step = card ? card.getBoundingClientRect().width + 24 : 0;
      return step; // <- QUAN TRỌNG
    };

    const timer = setInterval(() => {
      const width = columnWidth();
      if (!width) return;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + width >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: width, behavior: 'smooth' });
      }
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);


  // Fetch khi đổi category
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const apiCat = CATEGORY_MAP[activeCategory];
        const res = await getProducts({ page: 1, limit: 12, category: apiCat });
        // Chuẩn hoá data theo UI
        console.log("API raw:", res);        
        const items = Array.isArray(res.items) ? res.items : (Array.isArray(res) ? res : []);
        console.log("API products (items):", items);
        console.log("API products (items):", items);
console.log("First item keys:", items?.[0] && Object.keys(items[0]));
console.log("First item sample:", items?.[0]);

        if (!mounted) return;
        setProducts(items);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || err.message || "Load products failed");
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId); // ProductNavBar đang truyền 'all' | 'bean' | 'accessories' ...
  };

  // Mở Quick View dùng dữ liệu chi tiết (nếu cần)
  const openQuickView = async (p) => {
    try {
      // nếu p đã đủ field thì có thể setSelectedProduct(p) luôn
      const full = await getProduct(p._id || p.id);
      setSelectedProduct(full || p);
    } catch {
      setSelectedProduct(p);
    }
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
            {loading && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="pc-item skeleton" />
                ))}
              </>
            )}

            {!loading && error && (
              <div className="pc-error">{error}</div>
            )}

            {!loading && !error && products.map((p) => {
              const id = String(p._id || p.id);
              const thumb = resolveImage(
  p.image ||
  p.images?.[0] ||
  p.img ||
  p.thumbnail ||
  p.photo ||
  p.picture ||
  "/images/placeholder.png"
);



              console.log("thumb", p.name, thumb);

              const sizeVar = p.variants?.find(v => v.name === 'size');
              const optIdx = selectedSize[id] ?? 0;
              const sizeOpt = sizeVar?.options?.[optIdx];
              const priceNumber = getPriceWithSize(p, optIdx);
              const price = formatPrice(priceNumber);
              const oldPrice = p.oldPrice ? formatPrice(p.oldPrice) : null;
              const colors = p.colors?.length ? p.colors : ["Default"];

              return (
                <article key={p._id || p.id} className="pc-item">
                  <div className="pc-thumb">
                    {p.discount ? <span className="pc-discount">-{p.discount}%</span> : null}
                    <img src={thumb} alt={p.name} />
                    <div
                      className="pc-eye"
                      onClick={() => openQuickView(p)}
                      title="Quick View"
                    >
                      <Eye size={18} />
                    </div>
                  </div>

                  <div className="pc-meta">
                    <p className="pc-category">{p.category || "Bean"}</p>
                    <h3 className="pc-title">{p.name}</h3>
                    <p className="pc-type">{p.type || p.variant || ""}</p>

                    {/* dropdown size nếu có */}
                    {sizeVar?.options?.length ? (
                      <select
                        className="pc-select"
                        value={optIdx}
                        onChange={(e) =>
                          setSelectedSize(s => ({ ...s, [id]: Number(e.target.value) }))
                        }
                      >
                        {sizeVar.options.map((op, i) => (
                          <option key={i} value={i}>
                            {op.label}{op.priceDelta ? ` (${op.priceDelta > 0 ? '+' : ''}${formatPrice(op.priceDelta)})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select className="pc-select" disabled>
                        <option>Default</option>
                      </select>
                    )}

                    <div className="pc-price-row">
                      <span className="pc-price">{price}</span>
                      {oldPrice && <span className="pc-old">{oldPrice}</span>}
                    </div>

                    <button
                      className="pc-add"
                      onClick={() => {
                        // gửi biến thể vào cart (tùy bạn đang dùng store nào)
                        const variant = sizeVar ? { name: 'size', value: sizeOpt?.label } : null;
                        const payload = {
                          productId: id,
                          name: p.name,
                          price: priceNumber,
                          image: thumb,
                          variant
                        };
                        console.log('ADD TO CART', payload);
                        // TODO: dispatch(addToCart(payload))
                      }}
                    >
                      + ADD TO CART
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <div className="pc-modal">
          <div className="pc-modal-content">
            <button className="pc-modal-close" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>

            {(() => {
              const id = String(selectedProduct._id || selectedProduct.id);
              const sizeVar = getSizeVar(selectedProduct);
              const optIdx = selectedSize[id] ?? 0;
              const sizeOpt = sizeVar?.options?.[optIdx];
              const priceNumber = getPriceWithSize(selectedProduct, optIdx);

              const stock = Number(selectedProduct.stock ?? 99);
              const qty = getQty(id, stock);
              const total = priceNumber * qty;


              return (
                <div className="pc-modal-body">
                  <div className="pc-modal-left">
                    <img
                      src={resolveImage(selectedProduct.image || selectedProduct.images?.[0] || selectedProduct.img)}
                      alt={selectedProduct.name}
                      className="pc-modal-img"
                    />

                  </div>

                  <div className="pc-modal-right">
                    <h3>{selectedProduct.name}</h3>
                    <p className="pc-desc">{selectedProduct.description}</p>

                    {/* Dropdown size trong modal nếu có */}
                    {sizeVar?.options?.length ? (
                      <div style={{ margin: '10px 0 16px' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Size</label>
                        <select
                          className="pc-select"
                          value={optIdx}
                          onChange={(e) =>
                            setSelectedSize(s => ({ ...s, [id]: Number(e.target.value) }))
                          }
                        >
                          {sizeVar.options.map((op, i) => (
                            <option key={i} value={i}>
                              {op.label}
                              {op.priceDelta
                                ? ` (${op.priceDelta > 0 ? '+' : ''}${formatPrice(op.priceDelta)})`
                                : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}

                    <div className="pc-price-row">
                      <span className="pc-price">{formatPrice(priceNumber)}</span>
                      {selectedProduct.oldPrice && (
                        <span className="pc-old">{formatPrice(selectedProduct.oldPrice)}</span>
                      )}
                    </div>

                    <div className="pc-modal-actions">
                      {/* Qty control */}
                      <div className="pc-qty">
                        <button
                          aria-label="Decrease quantity"
                          disabled={qty <= 1}
                          onClick={() => changeQty(id, -1, stock)}
                        >
                          –
                        </button>
                        <span aria-live="polite">{qty}</span>
                        <button
                          aria-label="Increase quantity"
                          disabled={qty >= stock}
                          onClick={() => changeQty(id, +1, stock)}
                        >
                          +
                        </button>
                      </div>

                      {/* Total */}
                      <div className="pc-total">
                        <span>Total:</span>
                        <strong>{formatPrice(total)}</strong>
                      </div>

                      {/* Add to cart */}
                      <button
                        className="pc-cart-btn"
                        onClick={() => {
                          const variant = sizeVar ? { name: "size", value: sizeOpt?.label } : null;
                          const payload = {
                            productId: id,
                            name: selectedProduct.name,
                            price: priceNumber, // đơn giá theo size
                            image: selectedProduct.images?.[0] || selectedProduct.img || "/images/placeholder.png",
                            variant,
                            qty,                 // số lượng
                            total                // tổng = đơn giá * qty (tuỳ bạn có gửi hay tính lại ở cart)
                          };
                          console.log('ADD TO CART', payload);
                          // TODO: dispatch(addToCart(payload));
                        }}
                      >
                        <ShoppingCart size={16} />
                        Add To Cart
                      </button>
                    </div>


                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

    </section>
  );
};

export default ProductCarousel;