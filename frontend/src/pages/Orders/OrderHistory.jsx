import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // chỉnh path nếu khác
import "./order-history.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

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

const OrderHistory = () => {
  const navigate = useNavigate();

  // Lấy email user từ AuthContext (tùy bạn đặt tên trong context)
  const auth = useAuth();
  const email =
    auth?.user?.email || auth?.currentUser?.email || auth?.email || null;
  // Nếu chưa có login mà muốn test nhanh có thể hardcode:
  // const email = "linh.ngo.1@example.com";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async (userEmail) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("limit", "20");
      params.set("includeItems", "true");
      if (userEmail) {
        params.set("email", userEmail);
      }

      const url = `${API_BASE_URL}/api/orders?${params.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("OrderHistory ERROR response:", text);
        throw new Error(
          "Không lấy được danh sách đơn hàng (status " + res.status + ")"
        );
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("OrderHistory – non-JSON response:", text);
        throw new Error(
          "Server trả về dữ liệu không phải JSON (thường là do gọi nhầm URL API)."
        );
      }

      const data = await res.json();
      // backend: { success:true, data:[...], items:[...], pagination:{...} }
      const list = Array.isArray(data)
        ? data
        : data.data || data.items || [];

      setOrders(list);
    } catch (err) {
      console.error(err);
      setError(err.message || "Đã xảy ra lỗi khi tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!email) {
      setLoading(false);
      setOrders([]);
      return;
    }
    loadOrders(email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleRowClick = (orderId) => {
    if (!orderId) return;
    navigate(`/orders/${orderId}`); // chỉnh nếu route khác
  };

  const renderStatusBadge = (statusRaw) => {
    if (!statusRaw) {
      return (
        <span className="order-status-badge order-status-unknown">
          Không rõ
        </span>
      );
    }
    const key = String(statusRaw).toLowerCase();
    const label = STATUS_LABELS[key] || statusRaw;
    return (
      <span className={`order-status-badge order-status-${key}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="container">
      <div className="order-history-page">
        <div className="order-history-card">
          <div className="order-history-header">
            <div>
              <h1>Lịch sử đơn hàng</h1>
              <p>Xem lại các đơn hàng đã đặt và trạng thái hiện tại.</p>
            </div>
          </div>

          {!email && (
            <div className="order-history-state">
              <p>Bạn cần đăng nhập để xem lịch sử đơn hàng.</p>
            </div>
          )}

          {email && loading && (
            <div className="order-history-state">
              <div className="spinner" />
              <p>Đang tải danh sách đơn hàng...</p>
            </div>
          )}

          {email && !loading && error && (
            <div className="order-history-state order-history-error">
              <p>{error}</p>
              <button type="button" onClick={() => loadOrders(email)}>
                Thử lại
              </button>
            </div>
          )}

          {email && !loading && !error && orders.length === 0 && (
            <div className="order-history-state order-history-empty">
              <h3>Chưa có đơn hàng nào</h3>
              <p>
                Tài khoản {email} hiện chưa có đơn hàng. Khi bạn đặt hàng, lịch
                sử sẽ hiển thị tại đây.
              </p>
            </div>
          )}

          {email && !loading && !error && orders.length > 0 && (
            <div className="order-history-table-wrapper">
              <table className="order-history-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Thời gian</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const shortCode = order.displayCode
                      ? `#${String(order.displayCode).toUpperCase()}`
                      : order.id
                      ? `#${String(order.id).slice(-4).toUpperCase()}`
                      : "—";

                    const rowId = order._id || order.id;

                    return (
                      <tr
                        key={rowId}
                        className="order-history-row"
                        onClick={() => handleRowClick(rowId)}
                      >
                        <td>{shortCode}</td>
                        <td>{formatDate(order.createdAt)}</td>
                        <td>{formatCurrency(order.total)}</td>
                        <td>{renderStatusBadge(order.status)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <p className="order-history-note">
                Nhấn vào từng dòng để xem chi tiết đơn hàng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
