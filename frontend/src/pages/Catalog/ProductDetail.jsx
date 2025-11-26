// src/pages/Catalog/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import "./product-detail.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// ===== Helpers dùng chung =====
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

function getSizeVar(p) {
  return p?.variants?.find((v) => v.name === "size");
}

function getPriceWithSize(p, optIdx = 0) {
  const base = Number(p?.price || 0);
  const sizeVar = getSizeVar(p);
  const delta = Number(sizeVar?.options?.[optIdx]?.priceDelta || 0);
  return base + delta;
}

// ===== Component input 5 ngôi sao (clickable) =====
function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = React.useState(0);

  return (
    <div className="star-rating-input">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${filled ? "filled" : ""}`}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            aria-label={`${star} sao`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth(); // lấy user từ AuthContext

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);

  // ----- REVIEW STATE -----
  const [reviews, setReviews] = useState([]); // lấy từ DB
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // name + email: lấy từ user nếu có, nếu không để user nhập
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  // --------------------------

  // Prefill name/email nếu user đã đăng nhập
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || user.fullName || user.email || "");
      setCustomerEmail(user.email || "");
    }
  }, [user]);

  // ===== Fetch chi tiết sản phẩm =====
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_BASE_URL}/api/products/${id}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to fetch product");
        }

        const json = await res.json();
        const p = json.data || json.product || json;
        setProduct(p);

        // setup size default
        const sizeVar = getSizeVar(p);
        if (sizeVar?.options?.length) {
          setSelectedSize(sizeVar.options[0].label);
        } else {
          setSelectedSize("");
        }
        setQty(1);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Product detail error:", err);
          setError(err.message || "Không tải được chi tiết sản phẩm");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
    return () => controller.abort();
  }, [id]);

  // ===== Fetch reviews từ backend =====
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();

    async function fetchReviews() {
      try {
        setReviewsLoading(true);
        setReviewsError("");

        const res = await fetch(
          `${API_BASE_URL}/api/products/${id}/reviews`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const txt = await res.text();
          console.warn("Fetch reviews fail:", txt);
          return;
        }

        const json = await res.json();
        const list = json.data || json.reviews || [];
        setReviews(list);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Reviews error:", err);
          setReviewsError("Không tải được đánh giá");
        }
      } finally {
        setReviewsLoading(false);
      }
    }

    fetchReviews();
    return () => controller.abort();
  }, [id]);

  const sizeVar = getSizeVar(product);
  const imageSrc = resolveImage(product);
  const description =
    product?.description || product?.desc || "";

  const rawStock = Number(product?.quantity);
  const stock =
    Number.isFinite(rawStock) && rawStock > 0 ? rawStock : 0;
  const inStock = stock > 0; // sửa đơn giản: có stock > 0 là còn hàng

  // xác định option đang chọn theo label
  const { priceNumber, total, currentLabel, optIdx } = useMemo(() => {
    if (!product) {
      return {
        priceNumber: 0,
        total: 0,
        currentLabel: "",
        optIdx: 0,
      };
    }

    let currentLabelLocal = selectedSize;
    if (sizeVar?.options?.length && !currentLabelLocal) {
      currentLabelLocal = sizeVar.options[0].label;
    }

    let idx = 0;
    if (sizeVar?.options?.length && currentLabelLocal) {
      const found = sizeVar.options.findIndex(
        (op) => op.label === currentLabelLocal
      );
      idx = found >= 0 ? found : 0;
    }

    const price = getPriceWithSize(product, idx);
    const safeQty = qty && qty > 0 ? qty : 1;

    return {
      priceNumber: price,
      total: price * safeQty,
      currentLabel: currentLabelLocal,
      optIdx: idx,
    };
  }, [product, sizeVar, selectedSize, qty]);

  // ===== Cart helpers – giống OrderModal =====
  const buildCartItem = () => {
    if (!product) return null;

    const basePrice = Number(product.price || 0);
    const variant = sizeVar
      ? { name: "size", value: currentLabel }
      : null;
    const variantOptions = sizeVar?.options?.map((op) => ({
      label: op.label,
      priceDelta: Number(op.priceDelta || 0),
    }));

    return {
      productId: String(product._id || product.id),
      name: product.name,
      price: priceNumber,
      image: imageSrc,
      variant,
      qty: qty && qty > 0 ? qty : 1,
      stock,
      category: product.category,
      basePrice,
      variantOptions,
      variantIndex: optIdx,
    };
  };

  const handleAddToCart = () => {
    const item = buildCartItem();
    if (!item) return;
    addToCart(item);
  };

  const handleBuyNow = () => {
    const item = buildCartItem();
    if (!item) return;
    navigate("/checkout");
  };

  const handleDecrease = () => {
    setQty((prev) => {
      const next = (prev || 1) - 1;
      return next < 1 ? 1 : next;
    });
  };

  const handleIncrease = () => {
    setQty((prev) => {
      const current = prev || 1;
      const next = current + 1;
      if (!stock) return next;
      return next > stock ? stock : next;
    });
  };

  // ===== Reviews helpers =====
  const ratingStats = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce(
      (s, r) => s + (Number(r.rating) || 0),
      0
    );
    const avg = sum / reviews.length;
    return { avg, count: reviews.length };
  }, [reviews]);

  const renderStars = (value) => {
    const rounded = Math.round(value || 0);
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={i < rounded ? "pd-star filled" : "pd-star"}
          >
            ★
          </span>
        ))}
      </>
    );
  };

  // Gửi review lên API – bắt buộc có name + email
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    const text = reviewComment.trim();
    const name = (user?.name || user?.fullName || customerName || "").trim();
    const email = (user?.email || customerEmail || "").trim();

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      alert("Vui lòng chọn số sao (1–5).");
      return;
    }
    if (!text) {
      alert("Vui lòng nhập nội dung nhận xét.");
      return;
    }
    if (!name) {
      alert("Vui lòng nhập tên của bạn.");
      return;
    }
    if (!email) {
      alert("Vui lòng nhập email.");
      return;
    }

    const payload = {
      rating: reviewRating,
      comment: text,
      customerName: name,
      customerEmail: email,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/products/${id}/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("Submit review fail:", txt);
        throw new Error(txt || "Failed to submit review");
      }

      const json = await res.json();
      const created = json.data || json.review || payload;

      setReviews((prev) => [created, ...prev]);

      setReviewComment("");
      setReviewRating(5);

      // nếu user chưa login, có thể giữ lại name/email trong state
      if (!user) {
        setCustomerName(name);
        setCustomerEmail(email);
      }
    } catch (err) {
      console.error("Submit review error:", err);
      alert("Gửi đánh giá thất bại. Thử lại sau nhé.");
    }
  };

  // ===== Render =====
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <p>Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <p style={{ color: "red" }}>
            Không tải được sản phẩm: {error || "Không tìm thấy"}
          </p>
        </div>
      </div>
    );
  }

  const isLoggedIn = !!user;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* BREADCRUMB */}
        <div className="pd-breadcrumb">
          <span
            className="pd-breadcrumb-link"
            onClick={() => navigate(-1)}
          >
            &larr; Quay lại
          </span>
          <span className="pd-breadcrumb-sep">/</span>
          <span>{product.category}</span>
        </div>

        {/* MAIN LAYOUT */}
        <div className="pd-main">
          {/* IMAGE */}
          <div className="pd-gallery">
            <div className="pd-image-wrapper">
              <img
                src={imageSrc}
                alt={product.name}
                className="pd-image"
              />
            </div>
            {!inStock && (
              <span className="pd-badge-out">Hết hàng</span>
            )}
          </div>

          {/* INFO */}
          <div className="pd-info">
            <h1 className="pd-title">{product.name}</h1>

            <div className="pd-rating-row">
              <div className="pd-rating-stars">
                {renderStars(ratingStats.avg)}
              </div>
              <span className="pd-rating-score">
                {ratingStats.count
                  ? `${ratingStats.avg.toFixed(1)}/5`
                  : "Chưa có đánh giá"}
              </span>
              {ratingStats.count > 0 && (
                <span className="pd-rating-count">
                  ({ratingStats.count} đánh giá)
                </span>
              )}
            </div>

            <div className="pd-price-row">
              <span className="pd-price">
                {formatPrice(priceNumber)}
              </span>
              {product.oldPrice && (
                <span className="pd-old-price">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {description && (
              <p className="pd-short-desc">{description}</p>
            )}

            <div className="pd-meta">
              <span>Mã SP: {product.sku}</span>
              <span>
                Tình trạng:{" "}
                <strong>{inStock ? "Còn hàng" : "Tạm hết hàng"}</strong>
              </span>
            </div>

            <div className="pd-purchase-block">
              {/* SIZE */}
              <div className="pd-field">
                <div className="pd-field-label">
                  <span>Size / Option</span>
                </div>
                {sizeVar?.options?.length ? (
                  <select
                    className="pd-select"
                    value={currentLabel}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {sizeVar.options.map((op, i) => (
                      <option key={i} value={op.label}>
                        {op.label}
                        {op.priceDelta
                          ? ` (${
                              op.priceDelta > 0 ? "+" : ""
                            }${formatPrice(op.priceDelta)})`
                          : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="pd-select disabled">
                    Mặc định
                  </div>
                )}
              </div>

              {/* QTY */}
              <div className="pd-field">
                <div className="pd-field-label">
                  <span>Số lượng</span>
                  {stock > 0 && (
                    <small>
                      Còn lại: <strong>{stock}</strong> sản phẩm
                    </small>
                  )}
                </div>
                <div className="pd-qty-control">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={qty <= 1}
                  >
                    -
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={!!stock && qty >= stock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* TOTAL */}
              <div className="pd-field">
                <div className="pd-field-label">
                  <span>Tổng tạm tính</span>
                </div>
                <div className="pd-total">
                  {formatPrice(total)}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="pd-actions">
                <button
                  className="pd-btn-primary"
                  onClick={handleBuyNow}
                  disabled={!inStock}
                >
                  MUA NGAY
                </button>
                <button
                  className="pd-btn-outline"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                >
                  THÊM VÀO GIỎ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EXTRA INFO + REVIEWS */}
        <div className="pd-extra">
          <section className="pd-section">
            <h2>Thông tin sản phẩm</h2>
            <p>
              {description ||
                "Sản phẩm cà phê được tuyển chọn kỹ lưỡng, phù hợp cho nhiều phương pháp pha khác nhau."}
            </p>
            <ul className="pd-specs">
              <li>
                <span>Danh mục</span>
                <strong>{product.category}</strong>
              </li>
              <li>
                <span>Mã sản phẩm</span>
                <strong>{product.sku}</strong>
              </li>
              <li>
                <span>Còn lại</span>
                <strong>{stock}</strong>
              </li>
            </ul>
          </section>

          <section className="pd-section pd-reviews">
            <h2>Đánh giá sản phẩm</h2>

            {/* SUMMARY */}
            <div className="pd-review-summary">
              <div className="pd-review-score">
                <div className="pd-review-score-number">
                  {ratingStats.count
                    ? ratingStats.avg.toFixed(1)
                    : "--"}
                </div>
                <div className="pd-review-score-meta">
                  <div className="pd-review-score-stars">
                    {renderStars(ratingStats.avg)}
                  </div>
                  <span>
                    {ratingStats.count
                      ? `${ratingStats.count} đánh giá`
                      : "Chưa có đánh giá"}
                  </span>
                </div>
              </div>
            </div>

            {/* LIST */}
            <div className="pd-review-list">
              {reviewsLoading && <p>Đang tải đánh giá...</p>}
              {reviewsError && (
                <p style={{ color: "red" }}>{reviewsError}</p>
              )}

              {!reviewsLoading &&
                reviews.map((r) => (
                  <div key={r._id || r.id} className="pd-review-item">
                    <div className="pd-review-header">
                      <strong>
                        {r.customerName || "Ẩn danh"}
                      </strong>
                      <span className="pd-review-stars">
                        {renderStars(r.rating)}
                      </span>
                    </div>
                    <p className="pd-review-comment">{r.comment}</p>
                    {r.customerEmail && (
                      <small className="pd-review-email">
                        {r.customerEmail}
                      </small>
                    )}
                    {r.createdAt && (
                      <small className="pd-review-time">
                        {new Date(r.createdAt).toLocaleString("vi-VN")}
                      </small>
                    )}
                  </div>
                ))}

              {!reviewsLoading && !reviews.length && !reviewsError && (
                <p className="pd-review-empty">
                  Hãy là người đầu tiên đánh giá sản phẩm này.
                </p>
              )}
            </div>

            {/* FORM */}
            <div className="pd-review-form">
              <h3>Viết đánh giá của bạn</h3>

              {/* Nếu đã đăng nhập, hiển thị info user */}
              {isLoggedIn ? (
                <div className="pd-review-user-info">
                  <p>
                    Đánh giá với tài khoản:{" "}
                    <strong>
                      {user.name || user.fullName || user.email}
                    </strong>{" "}
                    ({user.email})
                  </p>
                </div>
              ) : (
                <div className="pd-review-form-row">
                  <label>
                    Tên của bạn:
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </label>
                </div>
              )}

              <form onSubmit={handleSubmitReview}>
                <div className="pd-review-form-row">
                  <div className="review-rating-row">
                    <span>Đánh giá:</span>
                    <StarRatingInput
                      value={reviewRating}
                      onChange={(val) => setReviewRating(val)}
                    />
                    <span className="review-rating-label">
                      {reviewRating} sao
                    </span>
                  </div>
                </div>
                <div className="pd-review-form-row">
                  <label>
                    Nhận xét:
                    <textarea
                      placeholder="Sản phẩm này như thế nào với bạn?"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="pd-btn-secondary"
                >
                  Gửi đánh giá
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
