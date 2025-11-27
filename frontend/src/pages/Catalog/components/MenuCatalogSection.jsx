import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderModal from "./OrderModal";
import "../../Menu/styles/menu-modal.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// 4 brand cố định
const BRAND_OPTIONS = [
  "Trung Nguyên",
  "Highlands",
  "The Coffee House",
  "Phúc Long",
];

// Dùng chung với OrderModal: ưu tiên image từ backend
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
  if (!Number.isFinite(num) || num <= 0) return "Liên hệ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
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
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA; // mới nhất trước
      });
      break;
    case "best":
    default:
      // giữ nguyên thứ tự backend trả về
      break;
  }

  return sorted;
}
function isProductInStock(p) {
  if (!p) return true;

  // Nếu backend có inStock boolean
  if (typeof p.inStock === "boolean") return p.inStock;

  // Nếu có status dạng string
  if (typeof p.status === "string") {
    const s = p.status.toLowerCase();
    if (["out-of-stock", "sold-out", "unavailable"].includes(s)) return false;
    if (["in-stock", "available"].includes(s)) return true;
  }

  // Các field số lượng thường gặp
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

  // Không có info thì mặc định coi là còn hàng
  return true;
}


export default function MenuCatalogSection({
  breadcrumbLabel = "Home / Coffee Menu",
  // category dùng để filter theo loại / collection trong DB
  category,
}) {
  const [products, setProducts] = useState([]);
  const [rawProducts, setRawProducts] = useState([]); // dữ liệu gốc từ API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- Modal + chọn sản phẩm ----
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState(1);
  const [tempSize, setTempSize] = useState("M");

  // Toast "đã thêm vào giỏ"
  const [toastItem, setToastItem] = useState(null);

  // ---- State filter + sort ----
  const [availability, setAvailability] = useState("all"); // all | in | out
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]); // 4 brand FE
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("best"); // best | priceAsc | priceDesc | new

  const navigate = useNavigate();

  // --- Fetch products từ backend (CHỈ dùng filter: category, availability, type, size) ---
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
        // KHÔNG gửi brands vì DB không có cột brand
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
        // Tùy backend: data / items / products
        const list = json.data || json.items || json.products || [];
        setRawProducts(list); // lưu dữ liệu gốc
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Fetch products error:", err);
          setError(err.message || "Không tải được sản phẩm");
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

  // --- Lọc theo giá + brand + sort local ---
  // --- Lọc theo giá + brand + sort local ---
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

  // Nếu user nhập min > max thì đảo lại
  if (min != null && max != null && min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }

  let list = rawProducts.filter((p) => {
    const price = Number(p.price || 0);
    const name = (p.name || "").toLowerCase();

    // ====== LỌC THEO AVAILABILITY ======
    const inStockFlag = isProductInStock(p);
    if (availability === "in" && !inStockFlag) return false;
    if (availability === "out" && inStockFlag) return false;
    // ====================================

    // filter giá
    if (min != null && price < min) return false;
    if (max != null && price > max) return false;

    // filter brand = search trong name
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


  // ---- Handler mở modal ----
  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setTempQty(1);
    setTempSize(""); // để OrderModal tự chọn size default
    setShowModal(true);
  };

  // Khi OrderModal báo đã add vào cart
  const handleItemAdded = (item) => {
    setShowModal(false);
    if (item) {
      setToastItem(item);
    }
  };

  // ---- Reset filter ----
  const handleResetFilters = () => {
    setAvailability("all");
    setMinPrice("");
    setMaxPrice("");
    setSelectedTypes([]);
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSortBy("best");
  };

  // Helper toggle checkbox list
  const toggleInArray = (value, list, setter) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  // Derive facets từ products (đã apply filter giá + brand)
  const productTypes = Array.from(
    new Set(products.map((p) => p.type).filter(Boolean))
  );

  // Tính highest price từ rawProducts (chưa bị filter giá)
  const highestPrice =
    rawProducts.length > 0
      ? Math.max(...rawProducts.map((p) => p.price || 0))
      : 0;

  // Đếm số sản phẩm theo từng brand option (dựa trên products đã filter giá)
  const brandCounts = BRAND_OPTIONS.reduce((acc, b) => {
    const count = products.filter((p) =>
      (p.name || "").toLowerCase().includes(b.toLowerCase())
    ).length;
    acc[b] = count;
    return acc;
  }, {});

  // Điều hướng sang trang chi tiết sản phẩm
  const goToProductDetail = (prodOrItem) => {
    if (!prodOrItem) return;
    const id =
      prodOrItem._id || prodOrItem.id || prodOrItem.productId || prodOrItem.slug;
    if (!id) return;
    navigate(`/products/${id}`);
  };

  return (
    <div className="catalog-wrapper">
      {/* Filter sidebar bên trái */}
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
              ? `The highest price is ${highestPrice.toLocaleString()}đ`
              : "Nhập khoảng giá để lọc"}
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

        {/* BRAND Filter – 4 option cố định, search theo name */}
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
        {/* Breadcrumb và Sort */}
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
        {loading && <p>Đang tải sản phẩm...</p>}
        {error && !loading && (
          <p style={{ color: "red" }}>Lỗi tải sản phẩm: {error}</p>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <div className="product-grid">
            {products.map((p) => (
              <div key={p._id || p.id} className="product-card">
                <div className="product-image">
                  <img
                    src={resolveImage(p)}
                    alt={p.name}
                    onClick={() => goToProductDetail(p)}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="product-badges">
                    {/* tuỳ backend có discount/newFlag thì hiển thị thực tế */}
                    <span className="discount-badge">-20%</span>
                    <span className="new-badge">New</span>
                  </div>
                  <div className="product-actions">
                    {/* Heart & Compare hiện tại chỉ UI, sau này có API thì gắn thêm */}
                    <button className="action-btn">♡</button>
                    <button className="action-btn">⇄</button>
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
                    {/* Nếu có giá cũ thì show */}
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
            ))}
            {products.length === 0 && (
              <p>
                Không có sản phẩm nào khớp với bộ lọc hiện tại.{" "}
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
                  Xóa bộ lọc
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
            // OrderModal tự addToCart vào CartContext, onAdd dùng để đóng popup + hiện toast
            onAdd={handleItemAdded}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>

      {/* Toast thêm giỏ hàng */}
      {toastItem && (
        <div className="catalog-toast">
          <div className="catalog-toast-inner">
            <div className="catalog-toast-main">
              <span>
                Đã thêm{" "}
                <strong>{toastItem.name || "sản phẩm"}</strong> vào giỏ hàng.
              </span>
            </div>
            <div className="catalog-toast-actions">
              <button
                type="button"
                className="toast-link"
                onClick={() => goToProductDetail(toastItem)}
              >
                Xem chi tiết
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
