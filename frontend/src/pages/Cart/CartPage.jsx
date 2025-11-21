// /pages/Cart/CartPage.jsx
import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import CartSummary from "./CartSummary";
import "./cart-page.css";

function formatVND(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    clearCart,
    increaseQty,
    decreaseQty,
    updateItemVariant,
  } = useCart();

  const hasItems = items && items.length > 0;

  const [selectedKeys, setSelectedKeys] = useState(() =>
    Array.isArray(items) ? items.map((it) => it.key) : []
  );

  // khi items thay đổi (load từ localStorage, xóa hết...), clear các key đã mất
  useEffect(() => {
    setSelectedKeys((prev) =>
      prev.filter((k) => items.some((it) => it.key === k))
    );
  }, [items]);

  const selectedItems = hasItems
    ? items.filter((it) => selectedKeys.includes(it.key))
    : [];

  const selectedSubtotal = selectedItems.reduce(
    (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
    0
  );

  const allSelected =
    hasItems && selectedItems.length === items.length && items.length > 0;

  const handleChangeVariant = (item, newIndex) => {
    if (!Array.isArray(item.variantOptions) || !item.variantOptions[newIndex]) {
      return;
    }

    const opt = item.variantOptions[newIndex];

    // basePrice nếu có thì dùng, không thì fallback về giá hiện tại
    let baseRaw = 0;
    if (item.basePrice != null) {
      baseRaw = item.basePrice;
    } else if (item.price != null) {
      baseRaw = item.price;
    }

    const basePrice = Number(baseRaw);
    const priceDelta = Number(opt.priceDelta || 0);
    const nextPrice = basePrice + priceDelta;
    const variantName = item.variant?.name || "size";

    // công thức key mới giống CartContext
    const newKey = `${item.productId || ""}-${variantName}-${
      opt.label || "default"
    }`;

    // cập nhật trong context
    updateItemVariant(item.key, {
      variant: { name: variantName, value: opt.label },
      price: nextPrice,
      basePrice,
      variantOptions: item.variantOptions,
      variantIndex: newIndex,
    });

    // nếu item đang được tick chọn thì cập nhật luôn key mới
    setSelectedKeys((prev) => {
      if (!prev.includes(item.key)) return prev;
      const next = prev.filter((k) => k !== item.key);
      if (!next.includes(newKey)) next.push(newKey);
      return next;
    });
  };

  if (!hasItems) {
    return (
      <main className="cart-page cart-page--empty">
        <div className="cart-empty-card">
          <h1>Giỏ hàng trống</h1>
          <p>Thêm vài món cà phê ngon để ngày mới thơm hơn nhé ☕️</p>
          <a href="/menu" className="cart-empty-btn">
            Khám phá menu
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      {/* Cột trái: danh sách sản phẩm */}
      <section className="cart-main">
        <header className="cart-header">
          <div className="cart-header-top">
            <h1>Giỏ hàng</h1>
            <p className="cart-header-sub">
              {items.length} sản phẩm · Đã chọn {selectedItems.length} · Tạm tính{" "}
              {formatVND(selectedSubtotal)}
            </p>
          </div>

          <div className="cart-header-bottom">
            <label className="cart-select-all">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedKeys(items.map((it) => it.key));
                  } else {
                    setSelectedKeys([]);
                  }
                }}
              />
              <span>Chọn tất cả</span>
            </label>

            <button className="cart-clear" onClick={clearCart}>
              Xoá tất cả
            </button>
          </div>
        </header>

        <div className="cart-items">
          {items.map((item) => {
            const lineTotal =
              (Number(item.price) || 0) * (Number(item.qty) || 1);
            const maxStock = Number.isFinite(item.stock) ? item.stock : 9999;
            const isSelected = selectedKeys.includes(item.key);

            const hasVariantOptions =
              Array.isArray(item.variantOptions) &&
              item.variantOptions.length > 0;

            let variantIndex = Number.isFinite(item.variantIndex)
              ? item.variantIndex
              : 0;

            if (
              !Number.isFinite(item.variantIndex) &&
              hasVariantOptions &&
              item.variant?.value
            ) {
              const idxFromLabel = item.variantOptions.findIndex(
                (op) => op.label === item.variant.value
              );
              if (idxFromLabel >= 0) {
                variantIndex = idxFromLabel;
              }
            }

            return (
              <article className="cart-item" key={item.key}>
                <div className="cart-item-check">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedKeys((prev) =>
                          prev.includes(item.key)
                            ? prev
                            : [...prev, item.key]
                        );
                      } else {
                        setSelectedKeys((prev) =>
                          prev.filter((k) => k !== item.key)
                        );
                      }
                    }}
                  />
                </div>

                <div className="cart-item-thumb">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item-body">
                  <div className="cart-item-top">
                    <div>
                      <div className="cart-item-title">{item.name}</div>

                      {hasVariantOptions ? (
                        <div className="cart-item-option-row">
                          <span className="cart-item-option-label">
                            Option
                          </span>
                          <select
                            className="cart-item-option-select"
                            value={variantIndex}
                            onChange={(e) =>
                              handleChangeVariant(
                                item,
                                Number(e.target.value)
                              )
                            }
                          >
                            {item.variantOptions.map((op, idx) => (
                              <option key={idx} value={idx}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : item.variant?.value ? (
                        <div className="cart-item-variant">
                          Option: {item.variant.value}
                        </div>
                      ) : null}
                    </div>

                    <div className="cart-item-line-total">
                      {formatVND(lineTotal)}
                    </div>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="cart-item-qty">
                      <span className="cart-item-qty-label">Số lượng</span>
                      <div className="cart-qty-control">
                        <button
                          aria-label="Giảm số lượng"
                          onClick={() => decreaseQty(item.key)}
                          disabled={item.qty <= 1}
                        >
                          –
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button
                          aria-label="Tăng số lượng"
                          onClick={() => increaseQty(item.key)}
                          disabled={item.qty >= maxStock}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span className="cart-item-price">
                      Đơn giá: {formatVND(item.price)}
                    </span>

                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item.key)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Cột phải: tóm tắt đơn hàng (chỉ tính sản phẩm đã tick) */}
      <aside className="cart-aside">
        <CartSummary cart={{ items: selectedItems }} />
      </aside>
    </main>
  );
}
