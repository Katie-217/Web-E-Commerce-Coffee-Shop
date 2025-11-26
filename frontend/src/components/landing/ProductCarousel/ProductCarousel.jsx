import React, { useEffect, useRef, useState } from "react";
import ProductNavBar from "../ProductCarousel/ProductNavBar";
import "../ProductCarousel/product-carousel.css";
import { Eye, X, ShoppingCart } from "lucide-react";
import { getProducts, getProduct } from "../../../services/products";
import { useCart } from "../../../contexts/CartContext";


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

const CATEGORY_LABELS = {
  'Roasted coffee': 'ROASTED COFFEE',
  'Coffee sets': 'COFFEE SETS',
  'Cups & Mugs': 'CUPS & MUGS',
  'Coffee makers and grinders': 'COFFEE MAKERS',
};

function prettyCategory(cat) {
  if (!cat) return '';
  return CATEGORY_LABELS[cat] || String(cat).toUpperCase();
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

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState({});
  const [qtyById, setQtyById] = useState({});

  const { addToCart } = useCart();
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    setToast(message);

    // clear timer cũ nếu có
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = setTimeout(() => {
      setToast("");
    }, 2000); // hiện 2s
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);


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
      const step = card ? card.getBoundingClientRect().width + 24 : 0;
      return step;
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

        // dùng luôn activeCategory, 'all' thì không filter
        const apiCat = activeCategory === "all" ? undefined : activeCategory;

        const items = await getProducts({
          page: 1,
          limit: 12,
          category: apiCat,
        });

        console.log("Carousel items:", items);

        if (!mounted) return;
        setProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
          err.message ||
          "Load products failed"
        );
        setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const openQuickView = async (p) => {
    try {
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
                p.imageUrl ||      // 👈 dùng đúng field JSON
                p.images?.[0] ||
                p.img ||
                p.thumbnail ||
                p.photo ||
                p.picture ||
                "/images/placeholder.png"
              );

              const sizeVar = p.variants?.find(v => v.name === 'size');
              const optIdx = selectedSize[id] ?? 0;
              const sizeOpt = sizeVar?.options?.[optIdx];
              const priceNumber = getPriceWithSize(p, optIdx);
              const price = formatPrice(priceNumber);
              const oldPrice = p.oldPrice ? formatPrice(p.oldPrice) : null;

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
                    <p className="pc-category">{prettyCategory(p.category || "Bean")}</p>
                    <h3 className="pc-title">{p.name}</h3>
                    <p className="pc-type">{p.type || p.variant || ""}</p>

                    {sizeVar?.options?.length ? (
                      <div className="pc-size-wrapper">
                        <span className="pc-size-label">Option</span>
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
                            </option>
                          ))}

                        </select>
                      </div>
                    ) : (
                      <div className="pc-size-wrapper">
                        <span className="pc-size-label">Option</span>
                        <select className="pc-select" disabled>
                          <option>Default</option>
                        </select>
                      </div>
                    )}



                    <div className="pc-price-row">
                      <span className="pc-price">{price}</span>
                      {oldPrice && <span className="pc-old">{oldPrice}</span>}
                    </div>

                    <button
                      className="pc-add"
                      onClick={() => {
                        const variant = sizeVar ? { name: "size", value: sizeOpt?.label } : null;

                        const basePrice = Number(p.price || 0);
                        const variantOptions = sizeVar?.options?.map((op) => ({
                          label: op.label,
                          priceDelta: Number(op.priceDelta || 0),
                        }));

                        addToCart({
                          productId: id,
                          name: p.name,
                          price: priceNumber,      // giá theo option đang chọn
                          image: thumb,
                          variant,
                          qty: 1,
                          stock: p.quantity ?? 99,
                          category: p.category,
                          basePrice,
                          variantOptions,
                          variantIndex: optIdx,
                        });

                        showToast(`Đã thêm "${p.name}" vào giỏ hàng`);
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

              // dùng quantity trong DB làm max qty
              const rawStock = Number(selectedProduct.quantity);
              const stock = Number.isFinite(rawStock) && rawStock > 0 ? rawStock : 99;

              const qty = getQty(id, stock);
              const total = priceNumber * qty;


              return (
                <div className="pc-modal-body">
                  <div className="pc-modal-left">
                    <img
                      src={resolveImage(
                        selectedProduct.image ||
                        selectedProduct.imageUrl ||
                        selectedProduct.images?.[0] ||
                        selectedProduct.img
                      )}
                      alt={selectedProduct.name}
                      className="pc-modal-img"
                    />
                  </div>

                  <div className="pc-modal-right">
                    <h3>{selectedProduct.name}</h3>
                    <p className="pc-desc">{selectedProduct.description}</p>

                    {sizeVar?.options?.length ? (
                      <div className="pc-size-row pc-size-row--modal">
                        <span className="pc-size-label">Option</span>
                        <select
                          className="pc-select pc-select--modal"   // 👈 thêm pc-select--modal
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


                      <div className="pc-total">
                        <span>Total:</span>
                        <strong>{formatPrice(total)}</strong>
                      </div>

                      <button
                        className="pc-cart-btn"
                        onClick={() => {
                          const variant = sizeVar ? { name: "size", value: sizeOpt?.label } : null;
                          addToCart({
                            productId: id,
                            name: selectedProduct.name,
                            price: priceNumber,
                            image:
                              selectedProduct.imageUrl ||
                              selectedProduct.images?.[0] ||
                              selectedProduct.img ||
                              "/images/placeholder.png",
                            variant,
                            qty,
                            stock,
                          });

                          showToast(`Đã thêm "${selectedProduct.name}" vào giỏ hàng`);
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
      {toast && (
        <div className="pc-toast">
          {toast}
        </div>
      )}
    </section>
  );
};

export default ProductCarousel;
