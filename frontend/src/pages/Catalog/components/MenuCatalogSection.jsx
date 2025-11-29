import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderModal from "./OrderModal";
import "../../Menu/styles/menu-modal.css";
import { useAuth } from "../../../contexts/AuthContext";
import { updateProfile } from "../../../services/account";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// 4 fixed brands (used only for name search)
const BRAND_OPTIONS = [
  "Trung Nguyên",
  "Highlands",
  "The Coffee House",
  "Phúc Long",
];

// Shared with OrderModal: prefer image from backend
function resolveImage(product) {
  if (!product) return "/images/coffee1.jpg";

  return (
    product.image ||
    product.imageUrl ||
    (Array.isArray(product.images) && product.images[0]) ||
    product.img ||
    "/images/coffee1.jpg"
  );
}

function formatPrice(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num) || num <= 0) return "Contact us";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}

// Local FE sort helper based on sortBy
// Ước lượng độ "bán chạy" của 1 product dựa trên các field nếu có
function getSoldScore(p = {}) {
  // Các field có thể tồn tại tuỳ backend
  const base =
    p.sold ??
    p.soldCount ??
    p.totalSold ??
    p.sales ??
    p.orderCount ??
    p.orders ??
    0;

  let score = Number(base);
  if (!Number.isFinite(score) || score < 0) score = 0;

  // Nếu có rating / reviewCount thì cộng thêm điểm
  const rating = Number(p.rating ?? p.avgRating ?? 0);
  const reviews = Number(p.reviewCount ?? p.reviewsCount ?? 0);

  if (Number.isFinite(rating) && rating > 0) {
    score += rating * 2; // rating cao thì ưu tiên hơn
  }
  if (Number.isFinite(reviews) && reviews > 0) {
    // giới hạn để không quá lệch
    score += Math.min(reviews, 50);
  }

  return score;
}

function getCreatedAtTime(p = {}) {
  return new Date(p.createdAt || p.updatedAt || 0).getTime() || 0;
}

// Hàm sort local trên FE theo sortBy
function sortProducts(list, sortBy) {
  const sorted = [...list];

  switch (sortBy) {
    case "priceAsc":
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;

    case "priceDesc":
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;

    case "new":
      sorted.sort((a, b) => getCreatedAtTime(b) - getCreatedAtTime(a));
      break;

    case "best":
    default:
      sorted.sort((a, b) => {
        const sb = getSoldScore(b);
        const sa = getSoldScore(a);

        if (sb === sa) {
          // nếu điểm giống nhau thì ưu tiên sản phẩm mới hơn
          return getCreatedAtTime(b) - getCreatedAtTime(a);
        }
        return sb - sa; // điểm cao hơn đứng trước
      });
      break;
  }

  return sorted;
}


function isProductInStock(p) {
  if (!p) return true;

  // Backend may have explicit boolean inStock
  if (typeof p.inStock === "boolean") return p.inStock;

  // Or a status string
  if (typeof p.status === "string") {
    const s = p.status.toLowerCase();
    if (["out-of-stock", "sold-out", "unavailable"].includes(s)) return false;
    if (["in-stock", "available"].includes(s)) return true;
  }

  // Common numeric stock fields
  const candidates = [
    p.stock,
    p.countInStock,
    p.quantity,
    p.qty,
    p.inventory,
    p.unitsInStock,
  ];

  for (const v of candidates) {
    if (v == null) continue;
    const num = Number(v);
    if (Number.isFinite(num)) return num > 0;
  }

  // If no info, assume in stock
  return true;
}

export default function MenuCatalogSection({
  breadcrumbLabel = "Home / Coffee Menu",
  // category is used to filter by type / collection in DB
  category,
}) {
  const [products, setProducts] = useState([]);
  const { user, updateUser } = useAuth();
  const [savingWishlistId, setSavingWishlistId] = useState(null);

  // always treat wishlist as array
  const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];

  const isInWishlist = (productId) =>
    wishlist.some((entry) => {
      if (!entry) return false;
      // entry can be a primitive or object { productId, ... }
      const pid =
        typeof entry === "object"
          ? entry.productId ?? entry.id ?? entry._id
          : entry;

      return String(pid) === String(productId);
    });

  const [rawProducts, setRawProducts] = useState([]); // raw data from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- Modal + selected product ----
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempSize, setTempSize] = useState("M");

  // Toast: "added to cart"
  const [toastItem, setToastItem] = useState(null);

  // ---- Filter + sort state ----
  const [availability, setAvailability] = useState("all"); // all | in | out
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]); // 4 FE brands
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("best"); // best | priceAsc | priceDesc | new

  const navigate = useNavigate();

  // --- Fetch products from backend (only use filter: category, availability, type, size) ---
  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (category) params.set("category", category);

        // availability -> inStock query
        if (availability === "in") params.set("inStock", "true");
        if (availability === "out") params.set("inStock", "false");

        // type/size multi-select
        if (selectedTypes.length) {
          params.set("types", selectedTypes.join(","));
        }
        // DO NOT send brands because DB does not have brand column
        if (selectedSizes.length) {
          params.set("sizes", selectedSizes.join(","));
        }

        const url = `${API_BASE_URL}/api/products${
          params.toString() ? `?${params.toString()}` : ""
        }`;

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to fetch products");
        }

        const json = await res.json();
        // Backend may return data / items / products
        const list = json.data || json.items || json.products || [];
        setRawProducts(list); // keep raw data
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load products");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, [category, availability, selectedTypes, selectedSizes]);

  // --- auto hide toast ---
  useEffect(() => {
    if (!toastItem) return;
    const t = setTimeout(() => setToastItem(null), 3000);
    return () => clearTimeout(t);
  }, [toastItem]);

  // --- Filter by price + brand + local sort ---
  useEffect(() => {
    if (!rawProducts || rawProducts.length === 0) {
      setProducts([]);
      return;
    }

    // Parse min / max
    let min = minPrice === "" || minPrice === null ? null : Number(minPrice);
    let max = maxPrice === "" || maxPrice === null ? null : Number(maxPrice);

    if (Number.isNaN(min)) min = null;
    if (Number.isNaN(max)) max = null;

    // Swap if user enters min > max
    if (min != null && max != null && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    let list = rawProducts.filter((p) => {
      const price = Number(p.price || 0);
      const name = (p.name || "").toLowerCase();

      // ====== FILTER BY AVAILABILITY ======
      const inStockFlag = isProductInStock(p);
      if (availability === "in" && !inStockFlag) return false;
      if (availability === "out" && inStockFlag) return false;
      // ====================================

      // price filter
      if (min != null && price < min) return false;
      if (max != null && price > max) return false;

      // brand filter = search brand keywords in product name
      if (selectedBrands.length > 0) {
        const matchBrand = selectedBrands.some((b) =>
          name.includes(b.toLowerCase())
        );
        if (!matchBrand) return false;
      }

      return true;
    });

    const sorted = sortProducts(list, sortBy);
    setProducts(sorted);
  }, [rawProducts, sortBy, minPrice, maxPrice, selectedBrands, availability]);

  // ---- Open modal handler ----
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setTempQty(1);
    setTempSize(""); // let OrderModal choose default size
    setShowModal(true);
  };

  // Called when OrderModal reports item added to cart
  const handleItemAdded = (item) => {
    setShowModal(false);
    if (item) {
      setToastItem(item);
    }
  };

  // ---- Reset all filters ----
  const handleResetFilters = () => {
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSelectedTypes([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSortBy("best");
  };

  // Helper to toggle values in checkbox lists
  const toggleInArray = (value, list, setter) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  // Derive product types from filtered products (after price + brand filters)
  const productTypes = Array.from(
    new Set(products.map((p) => p.type).filter(Boolean))
  );

  // Highest price from rawProducts (before price filter)
  const highestPrice =
    rawProducts.length > 0
      ? Math.max(...rawProducts.map((p) => p.price || 0))
      : 0;

  // Count products per brand option (after current filters)
  const brandCounts = BRAND_OPTIONS.reduce((acc, b) => {
    const count = products.filter((p) =>
      (p.name || "").toLowerCase().includes(b.toLowerCase())
    ).length;
    acc[b] = count;
    return acc;
  }, {});

  // Navigate to product detail page
  const goToProductDetail = (prodOrItem) => {
    if (!prodOrItem) return;
    const id =
      prodOrItem._id || prodOrItem.id || prodOrItem.productId || prodOrItem.slug;
    if (!id) return;
    navigate(`/products/${id}`);
  };

  const handleToggleWishlist = async (product) => {
    if (!user) {
      alert("You need to log in to use the wishlist.");
      return;
    }

    const pid = product.id ?? product._id;
    if (!pid) return;

    try {
      setSavingWishlistId(pid);

      const current = Array.isArray(user.wishlist) ? [...user.wishlist] : [];

      const index = current.findIndex((entry) => {
        if (!entry) return false;
        const eid =
          typeof entry === "object"
            ? entry.productId ?? entry.id ?? entry._id
            : entry;
        return String(eid) === String(pid);
      });

      let next;
      if (index >= 0) {
        // already in wishlist → remove it
        next = current.filter((_, i) => i !== index);
      } else {
        // not yet in wishlist → add it
        next = [
          ...current,
          {
            productId: pid,
            dateAdded: new Date().toISOString(),
            isOnSale: !!product.isOnSale,
          },
        ];
      }

      // Call update profile API, reusing endpoint from AccountPage
      const updated = await updateProfile({ wishlist: next });

      // updateProfile may return { data: user } or user directly
      const newUser = updated?.data ?? updated;
      if (newUser) {
        updateUser?.(newUser);
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update wishlist."
      );
    } finally {
      setSavingWishlistId(null);
    }
  };

  return (
    <div className="catalog-wrapper">
      {/* Left filter sidebar */}
      <div className="filter-sidebar">
        <div className="filter-topbar">
          <h3>Filters</h3>
          <button
            className="filter-reset"
            title="Reset all"
            aria-label="Reset all filters"
            onClick={handleResetFilters}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12a9 9 0 1 1-3.04-6.72"
                stroke="#ddd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6"
                stroke="#ddd"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* AVAILABILITY Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>AVAILABILITY</h4>
            <span>
              {availability === "all"
                ? "0 selected"
                : availability === "in"
                ? "1 selected (In stock)"
                : "1 selected (Out of stock)"}
            </span>
          </div>
          <div className="filter-options">
            <label>
              <input
                type="checkbox"
                checked={availability === "in"}
                onChange={() =>
                  setAvailability((prev) => (prev === "in" ? "all" : "in"))
                }
              />
              In stock
            </label>
            <label>
              <input
                type="checkbox"
                checked={availability === "out"}
                onChange={() =>
                  setAvailability((prev) => (prev === "out" ? "all" : "out"))
                }
              />
              Out of stock
            </label>
          </div>
        </div>

        {/* PRICE Filter */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>PRICE</h4>
          </div>
          <p className="price-info">
            {rawProducts.length
              ? `The highest price is ${highestPrice.toLocaleString()}₫`
              : "Enter a price range to filter"}
          </p>
          <div className="price-inputs">
            <div>
              <label>Min price:</label>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <label>Max price:</label>
              <input
                type="number"
                placeholder="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* BRAND Filter – fixed 4 options, search by name */}
        <div className="filter-section">
          <div className="filter-header">
            <h4>BRAND</h4>
            <span>{BRAND_OPTIONS.length} brands</span>
          </div>
          <div className="filter-options">
            {BRAND_OPTIONS.map((b) => (
              <label key={b}>
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(b)}
                  onChange={() =>
                    toggleInArray(b, selectedBrands, setSelectedBrands)
                  }
                />
                {b} ({brandCounts[b] || 0})
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Breadcrumb + Sort */}
        <div className="catalog-header">
          <div className="breadcrumb">
            <span>{breadcrumbLabel}</span>
          </div>
          <div className="sort-section">
            <span>Sort by:</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="best">Best selling</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="new">Newest</option>
            </select>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <p>Loading products...</p>}
        {error && !loading && (
          <p style={{ color: "red" }}>Failed to load products: {error}</p>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <div className="product-grid">
            {products.map((p) => {
              const pid = p.id ?? p._id;
              const liked = pid ? isInWishlist(pid) : false;

              return (
                <div key={pid || p._id || p.id} className="product-card">
                  <div className="product-image">
                    <img
                      src={resolveImage(p)}
                      alt={p.name}
                      onClick={() => goToProductDetail(p)}
                      style={{ cursor: "pointer" }}
                    />
                    <div className="product-badges">
                      <span className="discount-badge">-20%</span>
                      <span className="new-badge">New</span>
                    </div>
                    <div className="product-actions">
                      {/* Heart button */}
                      <button
                        type="button"
                        className={`action-btn action-btn--wishlist ${
                          liked ? "action-btn--favorite" : ""
                        }`}
                        data-tooltip={
                          liked ? "Remove from wishlist" : "Add to wishlist"
                        }
                        disabled={savingWishlistId === pid}
                        onClick={(e) => {
                          e.stopPropagation(); // avoid triggering card click
                          handleToggleWishlist(p);
                        }}
                      >
                        {liked ? "♥" : "♡"}
                      </button>

                      <button
                        className="action-btn"
                        onClick={() => handleOpenModal(p)}
                      >
                        👁
                      </button>
                    </div>
                  </div>

                  <div className="product-info">
                    <h3
                      className="product-title"
                      onClick={() => goToProductDetail(p)}
                      style={{ cursor: "pointer" }}
                    >
                      {p.name}
                    </h3>
                    <p className="product-desc">
                      {p.description || p.desc || ""}
                    </p>

                    <div className="product-price">
                      <span className="current-price">
                        {formatPrice(p.price)}
                      </span>
                      {p.oldPrice && (
                        <span className="old-price">
                          {formatPrice(p.oldPrice)}
                        </span>
                      )}
                    </div>
                    <div className="product-cta">
                      <button
                        className="add-to-cart"
                        onClick={() => handleOpenModal(p)}
                      >
                        ADD TO CART
                      </button>
                      <button
                        className="buy-now"
                        onClick={() => handleOpenModal(p)}
                      >
                        BUY NOW
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {products.length === 0 && (
              <p>
                No products match the current filters.{" "}
                <button
                  type="button"
                  style={{
                    textDecoration: "underline",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                  onClick={handleResetFilters}
                >
                  Clear filters
                </button>
              </p>
            )}
          </div>
        )}

        {showModal && (
          <OrderModal
            selectedProduct={selectedProduct}
            tempQty={tempQty}
            setTempQty={setTempQty}
            tempSize={tempSize}
            setTempSize={setTempSize}
            // OrderModal itself adds to CartContext; onAdd is used to close popup + show toast
            onAdd={handleItemAdded}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      {/* "Added to cart" toast */}
      {toastItem && (
        <div className="catalog-toast">
          <div className="catalog-toast-inner">
            <div className="catalog-toast-main">
              <span>
                Added{" "}
                <strong>{toastItem.name || "product"}</strong> to your cart.
              </span>
            </div>
            <div className="catalog-toast-actions">
              <button
                type="button"
                className="toast-link"
                onClick={() => goToProductDetail(toastItem)}
              >
                View details
              </button>
              <button
                type="button"
                className="toast-close"
                onClick={() => setToastItem(null)}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
