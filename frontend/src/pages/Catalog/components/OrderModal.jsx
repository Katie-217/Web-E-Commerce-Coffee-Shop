import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext";

function resolveImage(product) {
  if (!product) return "/images/coffee-sample.png";

  return (
    product.image ||
    product.imageUrl ||
    (Array.isArray(product.images) && product.images[0]) ||
    product.img ||
    "/images/coffee-sample.png"
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

const OrderModal = ({
  selectedProduct,
  tempQty,
  setTempQty,
  tempSize,
  setTempSize,
  onAdd,   // dùng để đóng modal / side-effect
  onClose, // đóng modal khi click overlay
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Setup default size + qty theo DB
  useEffect(() => {
    if (!selectedProduct) return;

    const sizeVar = getSizeVar(selectedProduct);
    if (!sizeVar?.options?.length) {
      if (!tempQty || tempQty < 1) setTempQty(1);
      return;
    }

    const labels = sizeVar.options.map((op) => op.label);

    if (!tempSize || !labels.includes(tempSize)) {
      setTempSize(sizeVar.options[0].label);
    }

    if (!tempQty || tempQty < 1) {
      setTempQty(1);
    }
  }, [selectedProduct, tempSize, tempQty, setTempSize, setTempQty]);

  if (!selectedProduct) return null;

  const sizeVar = getSizeVar(selectedProduct);
  const imageSrc = resolveImage(selectedProduct);
  const description =
    selectedProduct.description || selectedProduct.desc || "";

  const rawStock = Number(selectedProduct.quantity);
  const stock =
    Number.isFinite(rawStock) && rawStock > 0 ? rawStock : 99;

  const safeQty = tempQty && tempQty > 0 ? tempQty : 1;

  // xác định option đang chọn theo label
  let currentLabel = tempSize;
  if (sizeVar?.options?.length && !currentLabel) {
    currentLabel = sizeVar.options[0].label;
  }

  let optIdx = 0;
  if (sizeVar?.options?.length && currentLabel) {
    const idx = sizeVar.options.findIndex(
      (op) => op.label === currentLabel
    );
    optIdx = idx >= 0 ? idx : 0;
  }

  const priceNumber = getPriceWithSize(selectedProduct, optIdx);
  const total = priceNumber * safeQty;

  const handleDecrease = () => {
    setTempQty((prev) => {
      const next = (prev || 1) - 1;
      return next < 1 ? 1 : next;
    });
  };

  const handleIncrease = () => {
    setTempQty((prev) => {
      const current = prev || 1;
      const next = current + 1;
      return next > stock ? stock : next;
    });
  };

  const handleSizeChange = (e) => {
    setTempSize(e.target.value);
  };

  // Tạo object item giống bên ProductCarousel để addToCart
  const buildCartItem = () => {
    const id = String(selectedProduct._id || selectedProduct.id);
    const variant = sizeVar
      ? { name: "size", value: currentLabel }
      : null;

    const basePrice = Number(selectedProduct.price || 0);
    const variantOptions = sizeVar?.options?.map((op) => ({
      label: op.label,
      priceDelta: Number(op.priceDelta || 0),
    }));

    return {
      productId: id,
      name: selectedProduct.name,
      price: priceNumber,
      image: imageSrc,
      variant,
      qty: safeQty,
      stock,
      category: selectedProduct.category,
      basePrice,
      variantOptions,
      variantIndex: optIdx,
    };
  };

  const handleAddToCartClick = () => {
    const item = buildCartItem();
    addToCart(item);
    if (onAdd) onAdd(item); // thường dùng để đóng modal
  };

  const handleBuyNowClick = () => {
  const item = buildCartItem();

  // nếu muốn MUA NGAY không ảnh hưởng gì tới giỏ:
  if (onAdd) onAdd(item); // vẫn đóng modal nếu bạn đang dùng onAdd cho việc đó

  // Truyền đúng 1 item sang trang checkout
  navigate("/checkout", {
    state: {
      items: [item],
    },
  });
}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-left">
          <img src={imageSrc} alt={selectedProduct.name} />
        </div>

        <div className="modal-right">
          <h2>{selectedProduct.name}</h2>

          <div className="option-block">
            <h4>Giá:</h4>
            <div className="price-row">
              <span className="price">{formatPrice(priceNumber)}</span>
              {selectedProduct.oldPrice && (
                <span className="old-price">
                  {formatPrice(selectedProduct.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {description && (
            <div className="option-block">
              <p className="modal-desc">{description}</p>
            </div>
          )}

          {sizeVar?.options?.length ? (
            <div className="option-block">
              <h4>Size / Option:</h4>
              <select
                className="variant-select"
                value={currentLabel}
                onChange={handleSizeChange}
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
            </div>
          ) : (
            <div className="option-block">
              <h4>Size:</h4>
              <select className="variant-select" disabled>
                <option>Default</option>
              </select>
            </div>
          )}

          <div className="option-block">
            <h4>Số lượng:</h4>
            <div className="qty-actions">
              <button onClick={handleDecrease} disabled={safeQty <= 1}>
                -
              </button>
              <span>{safeQty}</span>
              <button
                onClick={handleIncrease}
                disabled={safeQty >= stock}
              >
                +
              </button>
            </div>
            <div className="stock-info">
              {Number.isFinite(stock) && (
                <small>Còn lại: {stock} sản phẩm</small>
              )}
            </div>
          </div>

          <div className="option-block">
            <h4>Tổng:</h4>
            <strong>{formatPrice(total)}</strong>
          </div>

          <div className="option-block">
            <h4>Ghi chú:</h4>
            <textarea placeholder="Ví dụ: đóng gói đẹp mắt, giao giờ hành chính..." />
          </div>

          <div className="modal-actions">
            <button className="btn-buy" onClick={handleBuyNowClick}>
              MUA NGAY
            </button>
            <button className="btn-add" onClick={handleAddToCartClick}>
              THÊM VÀO GIỎ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
