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

  // Items được truyền từ CartPage (navigate("/checkout", { state: { items } }))
  const itemsFromState = Array.isArray(location.state?.items)
    ? location.state.items
    : [];

  // Fallback: nếu user F5 mất state, lấy lại từ CartContext
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

  // ======= LẤY ĐỊA CHỈ & PAYMENT TỪ user (sort mặc định lên đầu) =======
  const savedAddresses = Array.isArray(user?.addresses)
    ? [...user.addresses].sort((a, b) => {
        if (!!a?.isDefault === !!b?.isDefault) return 0;
        return a?.isDefault ? -1 : 1; // isDefault = true lên trước
      })
    : [];

  const savedPayments = Array.isArray(user?.paymentMethods)
    ? [...user.paymentMethods].sort((a, b) => {
        if (!!a?.isDefault === !!b?.isDefault) return 0;
        return a?.isDefault ? -1 : 1;
      })
    : [];

  // mode: dùng địa chỉ đã lưu hay nhập mới
  const [addressMode, setAddressMode] = useState(
    savedAddresses.length > 0 ? "saved" : "new"
  );
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveAddress, setSaveAddress] = useState(true);

  // mode: dùng payment đã lưu hay chọn kiểu khác
  const [paymentMode, setPaymentMode] = useState(
    savedPayments.length > 0 ? "saved" : "new"
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);

  // Form: sẽ prefill từ user bằng useEffect bên dưới
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

  // Prefill form từ user (họ tên / phone)
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

  // Khi addresses load xong mà chưa chọn gì → chọn địa chỉ mặc định (hoặc first)
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      setAddressMode("saved");
      const def =
        savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      setSelectedAddressId(String(def._id || def.id || 0));
    }
  }, [savedAddresses, selectedAddressId]);

  // Khi payments load xong mà chưa chọn gì → chọn payment mặc định (hoặc first)
  useEffect(() => {
    if (savedPayments.length > 0 && !selectedPaymentId) {
      setPaymentMode("saved");
      const def =
        savedPayments.find((p) => p.isDefault) || savedPayments[0];
      setSelectedPaymentId(String(def._id || def.id || 0));
    }
  }, [savedPayments, selectedPaymentId]);

  // 🟢 Hook xong rồi mới được return sớm
  if (!items || items.length === 0) {
    return (
      <main className="checkout-page checkout-page--empty">
        <div className="checkout-empty-card">
          <h1>Không có sản phẩm để thanh toán</h1>
          <p>Vui lòng chọn sản phẩm trong giỏ hàng trước khi thanh toán.</p>
          <button
            type="button"
            className="checkout-empty-btn"
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </button>
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

    // Validate địa chỉ
    if (addressMode === "new") {
      if (
        !form.fullName ||
        !form.phone ||
        !form.addressLine ||
        !form.city
      ) {
        setError("Vui lòng điền đầy đủ thông tin nhận hàng.");
        return;
      }
    } else if (
      addressMode === "saved" &&
      savedAddresses.length > 0 &&
      !selectedAddressId
    ) {
      setError("Vui lòng chọn một địa chỉ giao hàng.");
      return;
    }

    // Validate payment
    if (
      paymentMode === "saved" &&
      savedPayments.length > 0 &&
      !selectedPaymentId
    ) {
      setError("Vui lòng chọn một phương thức thanh toán.");
      return;
    }

    // Chuẩn bị shippingAddress
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
          // lưu đúng field schema + kèm alias cho an toàn
          addressLine1: line,
          addressLine: line,
          ward: addr.ward,
          district: addr.district,
          city: addr.city,
        };
      }
    }

    if (!shippingAddress) {
      // dùng địa chỉ mới nhập
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

    // Chuẩn bị payment
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

    // Payload gởi lên API /api/orders – backend tự lấy email & id từ req.user
    const payload = {
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        quantity: it.qty,
        price: it.price,
        // variant / image FE dùng, backend hiện không cần nhưng gửi lên cũng không sao
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
      shippingFee, // FE gửi để backend có thể dùng, nhưng backend vẫn tự tính lại subtotal/total
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // quan trọng để req.user có email
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Checkout error response:", text);
        throw new Error("Không tạo được đơn hàng. Vui lòng thử lại.");
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("Checkout non-JSON response:", text);
        throw new Error("Server trả về dữ liệu không hợp lệ.");
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
      setError(err.message || "Đã xảy ra lỗi khi tạo đơn hàng.");
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
            <h1>Thanh toán</h1>
            <p>Chọn địa chỉ, phương thức thanh toán và hoàn tất đơn hàng.</p>
          </header>

          <form className="checkout-form" onSubmit={handleSubmit}>
            {/* ĐỊA CHỈ GIAO HÀNG */}
            <section className="checkout-section">
              <div className="checkout-section-header">
                <h2>Địa chỉ giao hàng</h2>
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
                      Địa chỉ đã lưu
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
                      Địa chỉ mới
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
                                Mặc định
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
                    + Nhập địa chỉ mới
                  </button>
                </>
              ) : (
                <>
                  <div className="checkout-two-cols">
                    <div className="checkout-field-group">
                      <label>
                        Họ và tên<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div className="checkout-field-group">
                      <label>
                        Số điện thoại<span className="required">*</span>
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
                      Địa chỉ<span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine"
                      value={form.addressLine}
                      onChange={handleChange}
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>

                  <div className="checkout-three-cols">
                    <div className="checkout-field-group">
                      <label>Phường/Xã</label>
                      <input
                        type="text"
                        name="ward"
                        value={form.ward}
                        onChange={handleChange}
                        placeholder="Phường/xã"
                      />
                    </div>
                    <div className="checkout-field-group">
                      <label>Quận/Huyện</label>
                      <input
                        type="text"
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        placeholder="Quận/huyện"
                      />
                    </div>
                    <div className="checkout-field-group">
                      <label>
                        Tỉnh/Thành phố<span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="TP.HCM"
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
                      <span>Lưu địa chỉ này cho lần sau</span>
                    </label>
                  )}
                </>
              )}
            </section>

            {/* EMAIL LIÊN HỆ – luôn lấy từ tài khoản, không cho sửa */}
            {user?.email && (
              <div className="checkout-field-group">
                <label>Email</label>
                <input type="email" value={user.email} readOnly />
              </div>
            )}

            {/* GHI CHÚ & THANH TOÁN */}
            <section className="checkout-section">
              <h2>Ghi chú & thanh toán</h2>

              <div className="checkout-field-group">
                <label>Ghi chú cho quán</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ví dụ: Ít đá, giao giờ nghỉ trưa..."
                />
              </div>

              <div className="checkout-field-group">
                <label>Phương thức thanh toán</label>

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
                      Đã lưu
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
                      Phương thức khác
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
                            ? "Tiền mặt (COD)"
                            : type === "card"
                            ? "Thẻ ngân hàng"
                            : type === "bank"
                            ? "Tài khoản ngân hàng"
                            : "Thanh toán");

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
                                  Mặc định
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
                      + Dùng phương thức khác
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
                        <span>Thanh toán khi nhận hàng (COD)</span>
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
                          <span>Lưu phương thức này cho lần sau</span>
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
                ← Quay lại giỏ hàng
              </button>
              <button
                type="submit"
                className="checkout-submit-btn"
                disabled={submitting}
              >
                {submitting ? "Đang tạo đơn..." : `Đặt hàng ${formatVND(total)}`}
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: SUMMARY */}
        <aside className="checkout-summary">
          <div className="checkout-summary-card">
            <h2>Đơn hàng của bạn</h2>
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
              <span>Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Phí vận chuyển</span>
              <span>
                {shippingFee === 0 ? "Miễn phí" : formatVND(shippingFee)}
              </span>
            </div>
            <div className="checkout-summary-total-row">
              <span>Tổng cộng</span>
              <span>{formatVND(total)}</span>
            </div>
            <p className="checkout-summary-note">
              Bằng việc đặt hàng, bạn đồng ý với chính sách của quán.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;
