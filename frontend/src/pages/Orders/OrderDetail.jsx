import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./order-detail.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS = {
  created: "Mới tạo",
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  shipped: "Đã giao vận chuyển",
  completed: "Hoàn thành",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  canceled: "Đã hủy",
};

const STATUS_STEPS = [
  { key: "created", label: "Đã đặt hàng" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
];

function normalizeStatus(statusRaw) {
  if (!statusRaw) return "";
  return String(statusRaw).toLowerCase();
}

function getStepIndexFromStatus(statusRaw) {
  const status = normalizeStatus(statusRaw);
  if (!status) return 0;

  if (status === "pending") return 0;
  if (status === "completed" || status === "shipped") return 3;

  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

const OrderDetail = () => {
  const params = useParams();

  // Ăn cả /orders/:id, /orders/:orderId, vv...
  const orderId =
    params.id ||
    params.orderId ||
    params._id ||
    Object.values(params)[0]; // fallback: lấy value đầu tiên nếu tên param khác

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = async () => {
    if (!orderId) {
      setError("Không tìm thấy mã đơn hàng");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const url = `${API_BASE_URL}/api/orders/${orderId}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("OrderDetail ERROR response:", text);
        throw new Error(
          "Không lấy được thông tin đơn hàng (status " + res.status + ")"
        );
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("OrderDetail – non-JSON response:", text);
        throw new Error(
          "Server trả về dữ liệu không phải JSON (thường là do gọi nhầm URL API)."
        );
      }

      const data = await res.json();
      // backend: { success:true, data:{...} }
      const orderData = data.data || data.order || data;
      setOrder(orderData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const totalItems = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
  }, [order]);

  const status = normalizeStatus(order?.status);
  const isCancelled = status === "cancelled" || status === "canceled";
  const stepIndex = getStepIndexFromStatus(order?.status);
  const statusLabel = STATUS_LABELS[status] || order?.status || "Không rõ";

  const shortCode = order?.displayCode
    ? `#${String(order.displayCode).toUpperCase()}`
    : order?.id
    ? `#${String(order.id).slice(-4).toUpperCase()}`
    : "—";

  return (
    <div className="container">
      <div className="order-detail-page">
        <div className="order-detail-header-bar">
          <button
            type="button"
            className="order-detail-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Quay lại
          </button>
          <h1>Chi tiết đơn hàng</h1>
        </div>

        <div className="order-detail-card">
          {loading && (
            <div className="order-detail-state">
              <div className="spinner" />
              <p>Đang tải thông tin đơn hàng...</p>
            </div>
          )}

          {!loading && error && (
            <div className="order-detail-state order-detail-error">
              <p>{error}</p>
              <button type="button" onClick={loadOrder}>
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && !order && (
            <div className="order-detail-state order-detail-error">
              <p>Không tìm thấy đơn hàng.</p>
            </div>
          )}

          {!loading && !error && order && (
            <>
              {/* TOP SUMMARY */}
              <div className="order-detail-top">
                <div>
                  <p className="order-detail-code">Mã đơn: {shortCode}</p>
                  <p className="order-detail-time">
                    Tạo lúc: {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="order-detail-status-block">
                  {isCancelled ? (
                    <span className="order-status-badge order-status-cancelled">
                      Đã hủy
                    </span>
                  ) : (
                    <span className={`order-status-badge order-status-${status}`}>
                      {statusLabel}
                    </span>
                  )}
                </div>
              </div>

              {/* STATUS STEPS / TIMELINE */}
              <div className="order-detail-steps">
                {STATUS_STEPS.map((step, index) => {
                  const active = !isCancelled && index <= stepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`order-detail-step ${
                        active ? "order-detail-step-active" : ""
                      }`}
                    >
                      <div className="order-detail-step-circle" />
                      <span className="order-detail-step-label">
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* MAIN CONTENT GRID */}
              <div className="order-detail-grid">
                {/* LEFT: SHIPPING + PAYMENT */}
                <div className="order-detail-column">
                  <div className="order-detail-section">
                    <h2>Thông tin giao hàng</h2>
                    <div className="order-detail-info">
                      <p>
                        <span className="label">Tên người nhận:</span>{" "}
                        {order.shippingAddress?.fullName ||
                          order.shippingAddress?.name ||
                          "—"}
                      </p>
                      <p>
                        <span className="label">Số điện thoại:</span>{" "}
                        {order.shippingAddress?.phone || "—"}
                      </p>
                      <p>
                        <span className="label">Địa chỉ:</span>{" "}
                        {(() => {
                          const a = order.shippingAddress || {};
                          const parts = [
                            a.addressLine,
                            a.address,
                            a.street,
                            a.ward,
                            a.district,
                            a.city,
                          ].filter(Boolean);
                          return parts.length ? parts.join(", ") : "—";
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="order-detail-section">
                    <h2>Thanh toán</h2>
                    <div className="order-detail-info">
                      <p>
                        <span className="label">Phương thức:</span>{" "}
                        {order.paymentMethod || "—"}
                      </p>
                      {order.paymentStatus && (
                        <p>
                          <span className="label">Trạng thái thanh toán:</span>{" "}
                          {order.paymentStatus}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: TOTALS */}
                <div className="order-detail-column">
                  <div className="order-detail-section order-detail-summary">
                    <h2>Tóm tắt đơn hàng</h2>
                    <div className="order-detail-summary-row">
                      <span>Tổng sản phẩm</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="order-detail-summary-row">
                      <span>Tạm tính</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="order-detail-summary-row">
                      <span>Phí vận chuyển</span>
                      <span>{formatCurrency(order.shippingFee || 0)}</span>
                    </div>
                    {order.discount != null && order.discount > 0 && (
                      <div className="order-detail-summary-row">
                        <span>Giảm giá</span>
                        <span>-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    <div className="order-detail-summary-row order-detail-summary-total">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
