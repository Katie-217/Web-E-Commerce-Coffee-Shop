// src/pages/Checkout/CheckoutPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import "./checkout-page.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

function formatVND(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  const { user } = useAuth();

  // Items passed from CartPage (navigate("/checkout", { state: { items } }))
  const itemsFromState = Array.isArray(location.state?.items)
    ? location.state.items
    : [];

  // Fallback: if user refreshes (F5) and state is lost, get items again from CartContext
  const items = itemsFromState.length ? itemsFromState : cartItems || [];

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, it) =>
          sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
        0
      ),
    [items]
  );

  const shippingFee = subtotal > 300000 ? 0 : 30000;
  const total = subtotal + shippingFee;

  // ======= Get addresses & payment methods from user (default first) =======
  const savedAddresses = Array.isArray(user?.addresses)
    ? [...user.addresses].sort((a, b) => {
        if (!!a?.isDefault === !!b?.isDefault) return 0;
        return a?.isDefault ? -1 : 1; // isDefault = true goes first
      })
    : [];

  const savedPayments = Array.isArray(user?.paymentMethods)
    ? [...user.paymentMethods].sort((a, b) => {
        if (!!a?.isDefault === !!b?.isDefault) return 0;
        return a?.isDefault ? -1 : 1;
      })
    : [];

  // mode: use saved address or new one
  const [addressMode, setAddressMode] = useState(
    savedAddresses.length > 0 ? "saved" : "new"
  );
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(true);

  // mode: use saved payment method or choose another type
  const [paymentMode, setPaymentMode] = useState(
    savedPayments.length > 0 ? "saved" : "new"
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);

  // Form: will be prefilled from user via useEffect below
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    ward: "",
    district: "",
    city: "",
    note: "",
    paymentMethod: "cod", // 'cod' | 'vnpay'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill form from user (name / phone)
  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      fullName:
        prev.fullName ||
        user.fullName ||
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      phone: prev.phone || user.phone || "",
    }));
  }, [user]);

  // When addresses are loaded and none is selected → pick default one (or first)
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      setAddressMode("saved");
      const def =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(String(def._id || def.id || 0));
    }
  }, [savedAddresses, selectedAddressId]);

  // When payment methods are loaded and none is selected → pick default one (or first)
  useEffect(() => {
    if (savedPayments.length > 0 && !selectedPaymentId) {
      setPaymentMode("saved");
      const def =
        savedPayments.find((p) => p.isDefault) || savedPayments[0];
      setSelectedPaymentId(String(def._id || def.id || 0));
    }
  }, [savedPayments, selectedPaymentId]);

  // ❗ Nếu không có item nào để thanh toán
  if (!items || items.length === 0) {
    return (
      <main className="checkout-page checkout-page--empty">
        <div className="checkout-empty-card">
          <h1>No items to checkout</h1>
          <p>Please add items to your cart before checking out.</p>
          <button
            type="button"
            className="checkout-empty-btn"
            onClick={() => navigate("/cart")}
          >
            Back to cart
          </button>
        </div>
      </main>
    );
  }

  // ❗ Nếu chưa đăng nhập: không cho checkout, yêu cầu login
  if (!user) {
    return (
      <main className="checkout-page checkout-page--empty">
        <div className="checkout-empty-card">
          <h1>Bạn cần đăng nhập để thanh toán</h1>
          <p>
            Vui lòng đăng nhập hoặc tạo tài khoản để lưu địa chỉ và theo dõi
            đơn hàng của bạn.
          </p>
          <div className="checkout-empty-actions">
            <button
              type="button"
              className="checkout-empty-btn checkout-empty-btn--primary"
              onClick={() =>
                navigate("/login", {
                  state: { from: "/checkout" },
                })
              }
            >
              Đăng nhập
            </button>
            <button
              type="button"
              className="checkout-empty-btn"
              onClick={() => navigate("/cart")}
            >
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 🔒 Safety: nếu vì lý do gì user = null thì chặn luôn
    if (!user) {
      setError("Bạn cần đăng nhập để đặt hàng.");
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Validate address
    if (addressMode === "new") {
      if (
        !form.fullName ||
        !form.phone ||
        !form.addressLine ||
        !form.city
      ) {
        setError("Please fill in all required shipping information.");
        return;
      }
    } else if (
      addressMode === "saved" &&
      savedAddresses.length > 0 &&
      !selectedAddressId
    ) {
      setError("Please select a shipping address.");
      return;
    }

    // Validate payment
    if (
      paymentMode === "saved" &&
      savedPayments.length > 0 &&
      !selectedPaymentId
    ) {
      setError("Please select a payment method.");
      return;
    }

    // Prepare shippingAddress
    let shippingAddress = null;

    if (
      addressMode === "saved" &&
      savedAddresses.length > 0 &&
      selectedAddressId
    ) {
      const addr = savedAddresses.find(
        (a, idx) =>
          String(a._id || a.id || idx) === String(selectedAddressId)
      );

      if (addr) {
        const line =
          addr.addressLine1 ||
          addr.addressLine ||
          addr.address ||
          "";

        shippingAddress = {
          fullName: addr.fullName || addr.name,
          phone: addr.phone,
          // store correct schema fields plus aliases for safety
          addressLine1: line,
          addressLine: line,
          ward: addr.ward,
          district: addr.district,
          city: addr.city,
        };
      }
    }

    if (!shippingAddress) {
      // use newly entered address
      shippingAddress = {
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine,
        addressLine: form.addressLine,
        ward: form.ward,
        district: form.district,
        city: form.city,
      };
    }

    // Prepare payment
    let paymentMethod = form.paymentMethod || "cod";

    if (
      paymentMode === "saved" &&
      savedPayments.length > 0 &&
      selectedPaymentId
    ) {
      const pm = savedPayments.find(
        (p, idx) =>
          String(p._id || p.id || idx) === String(selectedPaymentId)
      );
      if (pm) {
        paymentMethod =
          pm.code ||
          pm.type ||
          pm.provider ||
          pm.method ||
          form.paymentMethod ||
          "saved";
      }
    }

    // Payload sent to /api/orders – backend will get email & id from req.user
    const payload = {
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.qty,
        price: it.price,
        // variant / image used on FE; backend doesn't need them but it's fine to send
        variant: it.variant,
        image: it.image,
      })),
      customerName: form.fullName,
      customerPhone: form.phone,
      customerEmail: user?.email,
      shippingAddress,
      note: form.note,
      paymentMethod,
      currency: "VND",
      // Frontend sends this so backend can use it, but backend still recalculates subtotal/total
      shippingFee,
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important so req.user has email
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Checkout error response:", text);
        throw new Error("Unable to create order. Please try again.");
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Checkout non-JSON response:", text);
        throw new Error("Server returned an invalid response.");
      }

      const data = await res.json();
      const order = data.data || data.order || data;

      clearCart();

      const orderId = order._id || order.id;
      if (orderId) {
        navigate(`/orders/${orderId}`, { replace: true });
      } else {
        navigate("/orders", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while creating the order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="checkout-page">
      <div className="checkout-layout">
        {/* LEFT: FORM */}
        <section className="checkout-main">
          <header className="checkout-header">
            <h1>Checkout</h1>
            <p>Select your address and payment method, then place your order.</p>
          </header>

          <form className="checkout-form" onSubmit={handleSubmit}>
            {/* SHIPPING ADDRESS */}
            <section className="checkout-section">
              <div className="checkout-section-header">
                <h2>Shipping address</h2>
                {savedAddresses.length > 0 && (
                  <div className="checkout-toggle-group">
                    <button
                      type="button"
                      className={
                        "checkout-toggle-btn" +
                        (addressMode === "saved"
                          ? " checkout-toggle-btn--active"
                          : "")
                      }
                      onClick={() => setAddressMode("saved")}
                    >
                      Saved addresses
                    </button>
                    <button
                      type="button"
                      className={
                        "checkout-toggle-btn" +
                        (addressMode === "new"
                          ? " checkout-toggle-btn--active"
                          : "")
                      }
                      onClick={() => setAddressMode("new")}
                    >
                      New address
                    </button>
                  </div>
                )}
              </div>

              {savedAddresses.length > 0 && addressMode === "saved" ? (
                <>
                  <div className="checkout-address-list">
                    {savedAddresses.map((addr, idx) => {
                      const id = String(addr._id || addr.id || idx);
                      const active = selectedAddressId === id;
                      const parts = [
                        addr.addressLine ||
                          addr.addressLine1 ||
                          addr.address,
                        addr.ward,
                        addr.district,
                        addr.city,
                      ].filter(Boolean);

                      return (
                        <button
                          type="button"
                          key={id}
                          className={
                            "checkout-address-card" +
                            (active
                              ? " checkout-address-card--active"
                              : "")
                          }
                          onClick={() => setSelectedAddressId(id)}
                        >
                          <div className="checkout-address-header-row">
                            <div className="checkout-address-name">
                              {addr.fullName || addr.name}
                            </div>
                            {addr.isDefault && (
                              <span className="badge-default">
                                Default
                              </span>
                            )}
                          </div>
                          {addr.phone && (
                            <div className="checkout-address-phone">
                              {addr.phone}
                            </div>
                          )}
                          <div className="checkout-address-text">
                            {parts.join(", ")}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="checkout-address-new-link"
                    onClick={() => setAddressMode("new")}
                  >
                    + Add a new address
                  </button>
                </>
              ) : (
                <>
                  <div className="checkout-two-cols">
                    <div className="checkout-field-group">
                      <label>
                        Full name<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="checkout-field-group">
                      <label>
                        Phone number<span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="0901 234 567"
                      />
                    </div>
                  </div>

                  <div className="checkout-field-group">
                    <label>
                      Address<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine"
                      value={form.addressLine}
                      onChange={handleChange}
                      placeholder="House number, street name..."
                    />
                  </div>

                  <div className="checkout-three-cols">
                    <div className="checkout-field-group">
                      <label>Ward</label>
                      <input
                        type="text"
                        name="ward"
                        value={form.ward}
                        onChange={handleChange}
                        placeholder="Ward"
                      />
                    </div>
                    <div className="checkout-field-group">
                      <label>District</label>
                      <input
                        type="text"
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        placeholder="District"
                      />
                    </div>
                    <div className="checkout-field-group">
                      <label>
                        City/Province<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Ho Chi Minh City"
                      />
                    </div>
                  </div>

                  {savedAddresses.length > 0 && (
                    <label className="checkout-save-checkbox">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                      />
                      <span>Save this address for next time</span>
                    </label>
                  )}
                </>
              )}
            </section>

            {/* CONTACT EMAIL – always taken from account, not editable */}
            {user?.email && (
              <div className="checkout-field-group">
                <label>Email</label>
                <input type="email" value={user.email} readOnly />
              </div>
            )}

            {/* NOTE & PAYMENT */}
            <section className="checkout-section">
              <h2>Notes & payment</h2>

              <div className="checkout-field-group">
                <label>Note for the shop</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="E.g. less ice, deliver during lunch break..."
                />
              </div>

              <div className="checkout-field-group">
                <label>Payment method</label>

                {savedPayments.length > 0 && (
                  <div className="checkout-toggle-group">
                    <button
                      type="button"
                      className={
                        "checkout-toggle-btn" +
                        (paymentMode === "saved"
                          ? " checkout-toggle-btn--active"
                          : "")
                      }
                      onClick={() => setPaymentMode("saved")}
                    >
                      Saved methods
                    </button>
                    <button
                      type="button"
                      className={
                        "checkout-toggle-btn" +
                        (paymentMode === "new"
                          ? " checkout-toggle-btn--active"
                          : "")
                      }
                      onClick={() => setPaymentMode("new")}
                    >
                      Other methods
                    </button>
                  </div>
                )}

                {savedPayments.length > 0 && paymentMode === "saved" ? (
                  <>
                    <div className="checkout-payment-saved-list">
                      {savedPayments.map((pm, idx) => {
                        const id = String(pm._id || pm.id || idx);
                        const active = selectedPaymentId === id;

                        const type = (pm.type || "").toLowerCase();
                        const label =
                          pm.label ||
                          pm.brand ||
                          (type === "cash"
                            ? "Cash on delivery (COD)"
                            : type === "card"
                            ? "Bank card"
                            : type === "bank"
                            ? "Bank account"
                            : "Payment");

                        const detail =
                          pm.masked && typeof pm.masked === "string"
                            ? pm.masked
                            : pm.last4
                            ? `•••• ${pm.last4}`
                            : pm.accountNumber
                            ? `••${String(pm.accountNumber).slice(-4)}`
                            : "";

                        return (
                          <button
                            type="button"
                            key={id}
                            className={
                              "payment-method-card" +
                              (active
                                ? " payment-method-card--active"
                                : "")
                            }
                            onClick={() => setSelectedPaymentId(id)}
                          >
                            <div className="payment-method-top-row">
                              <span className="payment-method-label">
                                {label}
                              </span>
                              {pm.isDefault && (
                                <span className="badge-default">
                                  Default
                                </span>
                              )}
                            </div>
                            {detail && (
                              <div className="payment-method-detail">
                                {detail}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="checkout-address-new-link"
                      onClick={() => setPaymentMode("new")}
                    >
                      + Use another method
                    </button>
                  </>
                ) : (
                  <>
                    <div className="checkout-payment-methods">
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={form.paymentMethod === "cod"}
                          onChange={handleChange}
                        />
                        <span>Cash on delivery (COD)</span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="vnpay"
                          checked={form.paymentMethod === "vnpay"}
                          onChange={handleChange}
                        />
                        <span>VNPAY / Internet Banking</span>
                      </label>
                    </div>

                    {savedPayments.length > 0 &&
                      form.paymentMethod !== "cod" && (
                        <label className="checkout-save-checkbox">
                          <input
                            type="checkbox"
                            checked={savePaymentMethod}
                            onChange={(e) =>
                              setSavePaymentMethod(e.target.checked)
                            }
                          />
                          <span>Save this payment method for next time</span>
                        </label>
                      )}
                  </>
                )}
              </div>
            </section>

            {error && <p className="checkout-error">{error}</p>}

            <div className="checkout-actions">
              <button
                type="button"
                className="checkout-back-btn"
                onClick={() => navigate("/cart")}
              >
                ← Back to cart
              </button>
              <button
                type="submit"
                className="checkout-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Creating order..."
                  : `Place order ${formatVND(total)}`}
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: SUMMARY */}
        <aside className="checkout-summary">
          <div className="checkout-summary-card">
            <h2>Your order</h2>
            <div className="checkout-summary-items">
              {items.map((item) => {
                const lineTotal =
                  (Number(item.price) || 0) * (Number(item.qty) || 1);
                return (
                  <div className="checkout-summary-item" key={item.key}>
                    <div className="checkout-summary-item-main">
                      <div className="checkout-summary-name">
                        {item.name}
                      </div>
                      {item.variant?.value && (
                        <div className="checkout-summary-variant">
                          {item.variant.value}
                        </div>
                      )}
                      <div className="checkout-summary-meta">
                        x{item.qty} · {formatVND(item.price)}
                      </div>
                    </div>
                    <div className="checkout-summary-line-total">
                      {formatVND(lineTotal)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Shipping fee</span>
              <span>
                {shippingFee === 0 ? "Free" : formatVND(shippingFee)}
              </span>
            </div>
            <div className="checkout-summary-total-row">
              <span>Total</span>
              <span>{formatVND(total)}</span>
            </div>
            <p className="checkout-summary-note">
              By placing this order, you agree to the shop&apos;s policies.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;
