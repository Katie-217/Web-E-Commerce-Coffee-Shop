// /pages/Cart/CartSummary.jsx
import React, { useMemo, useState } from "react";
import { applyVoucher } from "../../services/vouchers";

function formatVND(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default function CartSummary({ cart = { items: [] }, onCheckout }) {
  const [code, setCode] = useState("");
  const [voucher, setVoucher] = useState(null);
  const [message, setMessage] = useState("");

  const safeItems = Array.isArray(cart.items) ? cart.items : [];

  const itemsPayload = useMemo(
    () =>
      safeItems.map((i) => ({
        productId: i.productId || i._id,
        category: i.category || null,
        price: i.price,
        qty: i.qty,
      })),
    [safeItems]
  );

  const subtotal = useMemo(
    () =>
      safeItems.reduce(
        (s, i) => s + (i.price || 0) * (i.qty || 0),
        0
      ),
    [safeItems]
  );

  const discount = voucher?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  async function onApply() {
    try {
      setMessage("");
      const data = await applyVoucher(code.trim(), itemsPayload);
      setVoucher({ code: data.code, discount: data.discount });
    } catch (e) {
      setVoucher(null);
      setMessage(e?.response?.data?.message || "Unable to apply this voucher code");
    }
  }

  function clearVoucher() {
    setVoucher(null);
    setCode("");
    setMessage("");
  }

  return (
    <div className="cart-summary">
      <h2 className="cart-summary-title">Order Summary</h2>

      <div className="voucher-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter voucher code"
        />
        {voucher ? (
          <button onClick={clearVoucher}>Remove code</button>
        ) : (
          <button onClick={onApply}>Apply</button>
        )}
      </div>

      {message && (
        <p className="text-danger" style={{ marginTop: 8 }}>
          {message}
        </p>
      )}

      {voucher && (
        <p className="text-success" style={{ marginTop: 8 }}>
          Voucher applied: <b>{voucher.code}</b> (−{formatVND(voucher.discount)})
        </p>
      )}

      <div className="cart-money-lines">
        <div className="cart-money-line">
          <span>Subtotal</span>
          <span>{formatVND(subtotal)}</span>
        </div>
        <div className="cart-money-line">
          <span>Voucher</span>
          <span>−{formatVND(discount)}</span>
        </div>
        <div className="cart-money-line total">
          <span>Total</span>
          <span>{formatVND(total)}</span>
        </div>
      </div>

      <button
        className="cart-checkout-btn"
        disabled={safeItems.length === 0}
        onClick={() => {
          if (typeof onCheckout === "function") {
            onCheckout({ items: safeItems, subtotal, discount, total, voucher });
          } else {
            console.log("Checkout payload:", {
              items: safeItems,
              subtotal,
              discount,
              total,
              voucher,
            });
          }
        }}
      >
        Checkout ({safeItems.length || 0})
      </button>
    </div>
  );
}
