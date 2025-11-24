import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile, changePassword } from "../../services/account";
import "./account-page.css";

function InfoRow({ label, value, mono }) {
  return (
    <div className="account-info-row">
      <dt className="label">{label}</dt>
      <dd className={`value${mono ? " mono" : ""}`}>{value ?? "—"}</dd>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="account-modal-backdrop">
      <div className="account-modal" role="dialog" aria-modal="true">
        <div className="account-modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="account-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <div className="account-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth(); // updateUser: mình đã thêm ở AuthContext
  const [activeModal, setActiveModal] = useState(null); // 'profile' | 'address' | 'payment' | 'password'
  const [profileForm, setProfileForm] = useState(null);
  const [addressForm, setAddressForm] = useState(null);
  const [addressIndex, setAddressIndex] = useState(-1);
  const [paymentForm, setPaymentForm] = useState(null);
  const [paymentIndex, setPaymentIndex] = useState(-1);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null; // đã có RequireAuth rồi nhưng phòng hờ

  const {
    _id,
    id,
    fullName,
    firstName,
    lastName,
    name,
    email,
    phone,
    gender,
    dateOfBirth,
    avatarUrl,
    addresses = [],
    paymentMethods = [],
    loyalty = {},
  } = user || {};

  const customerId = id || _id;

  const displayName =
    fullName ||
    `${firstName || ""} ${lastName || ""}`.trim() ||
    name ||
    "Người dùng";

  const avatar =
    avatarUrl ||
    user?.avatar ||
    "/images/avatar-default.png";

  const genderLabel =
    gender === "male"
      ? "Nam"
      : gender === "female"
        ? "Nữ"
        : gender || "—";

  const dobText = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString("vi-VN")
    : null;

  const points = loyalty?.points ?? 0;
  const tier = (loyalty?.tier || "").toLowerCase();
  const tierLabel =
    tier === "platinum"
      ? "Platinum"
      : tier === "gold"
        ? "Vàng"
        : tier === "silver"
          ? "Bạc"
          : tier === "bronze"
            ? "Đồng"
            : loyalty?.tier || "Thành viên";

  const lastAccrualText = loyalty?.lastAccrualAt
    ? new Date(loyalty.lastAccrualAt).toLocaleString("vi-VN")
    : null;

  const maskedCustomerId = customerId
    ? `#${String(customerId).toUpperCase()}`
    : "—";

  // ===== OPEN MODALS =====
  const openProfileModal = () => {
    setProfileForm({
      fullName: displayName || "",
      phone: phone || "",
      gender: gender || "",
      dateOfBirth: dateOfBirth
        ? new Date(dateOfBirth).toISOString().slice(0, 10)
        : "",
    });
    setError("");
    setActiveModal("profile");
  };

  const openAddressModal = (index = -1) => {
    const base =
      index >= 0 && addresses[index]
        ? addresses[index]
        : {
          label: "home",
          type: "shipping",
          isDefault: addresses.length === 0,
          fullName: displayName || "",
          phone: phone || "",
          addressLine1: "",
          ward: "",
          district: "",
          city: "",
        };
    setAddressForm(base);
    setAddressIndex(index);
    setError("");
    setActiveModal("address");
  };

  const openPaymentModal = (index = -1) => {
    const base =
      index >= 0 && paymentMethods[index]
        ? paymentMethods[index]
        : {
          type: "cash",
          provider: "",
          brand: "",
          holderName: displayName || "",
          accountNumber: "",
          last4: "",
          expMonth: "",
          expYear: "",
          isDefault: paymentMethods.length === 0,
        };
    setPaymentForm(base);
    setPaymentIndex(index);
    setError("");
    setActiveModal("payment");
  };

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setActiveModal("password");
  };

  const closeModal = () => {
    setActiveModal(null);
    setSaving(false);
    setError("");
  };

  // ===== SAVE HANDLERS (GỌI API + UPDATE DB) =====

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm) return;
    try {
      setSaving(true);
      setError("");
      const payload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim() || null,
        gender: profileForm.gender || null,
        dateOfBirth: profileForm.dateOfBirth || null,
      };
      const updated = await updateProfile(payload);
      updateUser?.(updated);
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Lưu thông tin thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm) return;

    if (!addressForm.addressLine1 || !addressForm.city) {
      setError("Vui lòng nhập tối thiểu Địa chỉ & Thành phố.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // clone list cũ
      let list = [...addresses];
      let idx = addressIndex;

      // cập nhật hoặc thêm mới
      if (idx >= 0) {
        list[idx] = addressForm;
      } else {
        list.push(addressForm);
        idx = list.length - 1;
      }

      // ==========================
      // CHỈ CHO PHÉP 1 ĐỊA CHỈ MẶC ĐỊNH
      // ==========================
      let defaultIndex = -1;

      if (addressForm.isDefault) {
        // nếu checkbox "mặc định" đang bật cho form hiện tại → dùng index này
        defaultIndex = idx;
      } else {
        // nếu không bật, giữ lại cái đang default sẵn (nếu có)
        defaultIndex = list.findIndex((a) => a.isDefault);
      }

      if (defaultIndex >= 0) {
        list = list.map((addr, i) => ({
          ...addr,
          isDefault: i === defaultIndex,
        }));
      }
      // ==========================

      const updated = await updateProfile({ addresses: list });
      updateUser?.(updated);
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Lưu địa chỉ thất bại"
      );
    } finally {
      setSaving(false);
    }
  };


  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm) return;

    try {
      setSaving(true);
      setError("");

      let list = [...paymentMethods];
      let idx = paymentIndex;

      // cập nhật hoặc thêm mới
      if (idx >= 0) {
        list[idx] = paymentForm;
      } else {
        list.push(paymentForm);
        idx = list.length - 1;
      }

      // ==========================
      // CHỈ CHO PHÉP 1 PHƯƠNG THỨC MẶC ĐỊNH
      // ==========================
      let defaultIndex = -1;

      if (paymentForm.isDefault) {
        // nếu form hiện tại được tick "mặc định" → chọn index này
        defaultIndex = idx;
      } else {
        // nếu không, giữ nguyên thằng đang default (nếu có)
        defaultIndex = list.findIndex((p) => p.isDefault);
      }

      if (defaultIndex >= 0) {
        list = list.map((pm, i) => ({
          ...pm,
          isDefault: i === defaultIndex,
        }));
      }
      // ==========================

      const updated = await updateProfile({ paymentMethods: list });
      updateUser?.(updated);
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Lưu phương thức thanh toán thất bại"
      );
    } finally {
      setSaving(false);
    }
  };


  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      closeModal();
      alert("Đổi mật khẩu thành công.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        "Đổi mật khẩu thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===== RENDER =====

  return (
    <main className="account-page">
      <section className="account-card">
        {/* HEADER */}
        <header className="account-header">
          <div className="account-avatar">
            <img src={avatar} alt={displayName} />
          </div>

          <div className="account-header-main">
            <div className="account-header-top">
              <div>
                <span className="account-label">Trang tài khoản</span>
                <h1 className="account-name">{displayName}</h1>

                {/* Mã khách hàng ngay dưới tên */}
                <div className="account-id-inline">
                  <span className="account-id-label">Mã khách hàng</span>
                  <span className="account-id-value">{maskedCustomerId}</span>
                </div>

                <p className="account-email">{email}</p>
              </div>
            </div>


            <div className="account-header-bottom">
              <div className="account-loyalty-pill">
                <span className="tier">{tierLabel}</span>
                <span className="points">{points} điểm tích lũy</span>
              </div>
              {lastAccrualText && (
                <span className="account-loyalty-note">
                  Lần tích điểm gần nhất: {lastAccrualText}
                </span>
              )}
            </div>
          </div>

          <div className="account-header-actions">
            <button
              className="account-logout"
              type="button"
              onClick={logout}
            >
              Đăng xuất
            </button>
          </div>

        </header>

        {/* THÔNG TIN CÁ NHÂN */}
        <section className="account-section">
          <div className="section-title-row">
            <h2 className="section-title">Thông tin cá nhân</h2>
          </div>

          <dl className="account-info">
            <InfoRow label="Họ tên" value={displayName} />
            <InfoRow label="Số điện thoại" value={phone} />
            <InfoRow label="Giới tính" value={genderLabel} />
            <InfoRow label="Ngày sinh" value={dobText} />
          </dl>

          {/* Nút chính ở dưới thông tin cá nhân */}
          <div className="account-primary-actions">
            <button
              className="account-edit-btn"
              type="button"
              onClick={openProfileModal}
            >
              Chỉnh sửa thông tin
            </button>
            <button
              className="account-edit-btn"
              type="button"
              onClick={openPasswordModal}
            >
              Đổi mật khẩu
            </button>
          </div>
        </section>


        {/* ĐỊA CHỈ */}
        <section className="account-section">
          <div className="section-title-row">
            <h2 className="section-title">Địa chỉ nhận hàng</h2>
            <div className="section-actions">
              <button
                className="section-ghost-btn"
                type="button"
                onClick={() => openAddressModal(-1)}
              >
                Thêm địa chỉ
              </button>
            </div>
          </div>

          {addresses.length === 0 ? (
            <p className="account-empty">
              Bạn chưa lưu địa chỉ nào. Hãy thêm địa chỉ để thanh toán nhanh
              hơn.
            </p>
          ) : (
            <ul className="account-list">
              {addresses.map((addr, idx) => (
                <li key={idx} className="account-list-item">
                  <div className="account-list-header">
                    <strong>{addr.label || "Địa chỉ"}</strong>
                    <div className="account-list-tags">
                      {addr.isDefault && (
                        <span className="badge-default">Mặc định</span>
                      )}
                      {addr.type && (
                        <span className="badge-type">
                          {addr.type === "shipping"
                            ? "Giao hàng"
                            : addr.type === "billing"
                              ? "Thanh toán"
                              : addr.type}
                        </span>
                      )}
                      <button
                        type="button"
                        className="section-ghost-btn section-ghost-btn--small"
                        onClick={() => openAddressModal(idx)}
                      >
                        Sửa
                      </button>
                    </div>
                  </div>
                  <p className="account-list-name">
                    {addr.fullName || displayName}
                  </p>
                  <p>{addr.addressLine1}</p>
                  <p>
                    {[addr.ward, addr.district, addr.city]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p>{addr.phone || phone || ""}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* THANH TOÁN */}
        <section className="account-section">
          <div className="section-title-row">
            <h2 className="section-title">Phương thức thanh toán</h2>
            <div className="section-actions">
              <button
                className="section-ghost-btn"
                type="button"
                onClick={() => openPaymentModal(-1)}
              >
                Thêm phương thức
              </button>
            </div>
          </div>

          {paymentMethods.length === 0 ? (
            <p className="account-empty">
              Chưa lưu phương thức thanh toán nào.
            </p>
          ) : (
            <ul className="account-payments">
              {paymentMethods.map((pm, idx) => {
                const type = (pm.type || "").toLowerCase();
                const brand = (pm.brand || pm.card?.brand || "").toUpperCase();
                const last4 = pm.last4 || pm.card?.last4 || "";
                const holder =
                  pm.holderName || pm.accountName || displayName || "";

                const iconLabel =
                  type === "cash"
                    ? "₫"
                    : type === "card"
                      ? "💳"
                      : type === "bank"
                        ? "🏦"
                        : type === "momo"
                          ? "M"
                          : type === "zalopay"
                            ? "Z"
                            : "₫";

                const labelText =
                  brand ||
                  (type === "cash"
                    ? "Tiền mặt (COD)"
                    : type === "card"
                      ? "Thẻ ngân hàng"
                      : type === "bank"
                        ? "Tài khoản ngân hàng"
                        : type === "momo"
                          ? "Ví MoMo"
                          : type === "zalopay"
                            ? "Ví ZaloPay"
                            : "Thanh toán");

                return (
                  <li
                    key={idx}
                    className={`payment-card payment-card--${type || "other"}`}
                  >
                    <div className="payment-card-top">
                      <div className="payment-card-brand">
                        <span className="chip" />
                        <span className="brand-text">
                          {brand ||
                            (type === "cash"
                              ? "Tiền mặt"
                              : type === "bank"
                                ? "Tài khoản ngân hàng"
                                : "Thanh toán")}
                        </span>
                      </div>
                      <div className="account-list-tags">
                        {pm.isDefault && (
                          <span className="badge-default">Mặc định</span>
                        )}
                        <button
                          type="button"
                          className="section-ghost-btn section-ghost-btn--small"
                          onClick={() => openPaymentModal(idx)}
                        >
                          Sửa
                        </button>
                      </div>
                    </div>

                    <div className="payment-card-number">
                      {type === "cash" ? (
                        <span className="cash-label">
                          Thanh toán khi nhận hàng
                        </span>
                      ) : last4 ? (
                        <>
                          <span>••••</span>
                          <span>••••</span>
                          <span>••••</span>
                          <span>{last4}</span>
                        </>
                      ) : pm.accountNumber ? (
                        <span className="account-number">
                          {pm.accountNumber}
                        </span>
                      ) : (
                        <span className="cash-label">Thanh toán</span>
                      )}
                    </div>

                    <div className="payment-card-bottom">
                      <span className="holder">{holder}</span>
                      {pm.expMonth && pm.expYear && (
                        <span className="expiry">
                          {String(pm.expMonth).padStart(2, "0")} /
                          {String(pm.expYear).slice(-2)}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>

      {/* ===== MODALS ===== */}

      {activeModal === "profile" && profileForm && (
        <Modal title="Chỉnh sửa thông tin" onClose={closeModal}>
          <form onSubmit={handleSaveProfile}>
            <div className="modal-row">
              <label>Họ tên</label>
              <input
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div className="modal-row">
              <label>Số điện thoại</label>
              <input
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="modal-row-inline">
              <div className="modal-row">
                <label>Giới tính</label>
                <select
                  value={profileForm.gender}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, gender: e.target.value }))
                  }
                >
                  <option value="">Không chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
              <div className="modal-row">
                <label>Ngày sinh</label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) =>
                    setProfileForm((f) => ({
                      ...f,
                      dateOfBirth: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="account-modal-footer">
              {error && <span className="modal-error">{error}</span>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === "address" && addressForm && (
        <Modal
          title={addressIndex >= 0 ? "Sửa địa chỉ" : "Thêm địa chỉ"}
          onClose={closeModal}
        >
          <form onSubmit={handleSaveAddress}>
            <div className="modal-row-inline">
              <div className="modal-row">
                <label>Nhãn</label>
                <input
                  value={addressForm.label}
                  onChange={(e) =>
                    setAddressForm((f) => ({ ...f, label: e.target.value }))
                  }
                />
              </div>
              <div className="modal-row">
                <label>Loại</label>
                <select
                  value={addressForm.type}
                  onChange={(e) =>
                    setAddressForm((f) => ({ ...f, type: e.target.value }))
                  }
                >
                  <option value="shipping">Giao hàng</option>
                  <option value="billing">Thanh toán</option>
                </select>
              </div>
            </div>

            <div className="modal-row">
              <label>Họ tên người nhận</label>
              <input
                value={addressForm.fullName}
                onChange={(e) =>
                  setAddressForm((f) => ({
                    ...f,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="modal-row">
              <label>Số điện thoại</label>
              <input
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="modal-row">
              <label>Địa chỉ</label>
              <input
                value={addressForm.addressLine1}
                onChange={(e) =>
                  setAddressForm((f) => ({
                    ...f,
                    addressLine1: e.target.value,
                  }))
                }
              />
            </div>
            <div className="modal-row-inline">
              <div className="modal-row">
                <label>Phường/Xã</label>
                <input
                  value={addressForm.ward}
                  onChange={(e) =>
                    setAddressForm((f) => ({ ...f, ward: e.target.value }))
                  }
                />
              </div>
              <div className="modal-row">
                <label>Quận/Huyện</label>
                <input
                  value={addressForm.district}
                  onChange={(e) =>
                    setAddressForm((f) => ({
                      ...f,
                      district: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="modal-row">
              <label>Thành phố</label>
              <input
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </div>
            <div className="modal-row">
              <label>
                <input
                  type="checkbox"
                  checked={!!addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm((f) => ({
                      ...f,
                      isDefault: e.target.checked,
                    }))
                  }
                />{" "}
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div className="account-modal-footer">
              {error && <span className="modal-error">{error}</span>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === "payment" && paymentForm && (
        <Modal
          title={
            paymentIndex >= 0
              ? "Sửa phương thức thanh toán"
              : "Thêm phương thức thanh toán"
          }
          onClose={closeModal}
        >
          <form onSubmit={handleSavePayment}>
            <div className="modal-row">
              <label>Loại</label>
              <select
                value={paymentForm.type}
                onChange={(e) =>
                  setPaymentForm((f) => ({ ...f, type: e.target.value }))
                }
              >
                <option value="cash">Tiền mặt (COD)</option>
                <option value="card">Thẻ ngân hàng</option>
                <option value="bank">Tài khoản ngân hàng</option>
                <option value="momo">Ví MoMo</option>
                <option value="zaloPay">Ví ZaloPay</option>
                <option value="bank">Tài khoản ngân hàng</option>
              </select>
            </div>

            {paymentForm.type !== "cash" && (
              <>
                <div className="modal-row">
                  <label>Ngân hàng / Thương hiệu</label>
                  <input
                    value={paymentForm.provider || paymentForm.brand}
                    onChange={(e) =>
                      setPaymentForm((f) => ({
                        ...f,
                        provider: e.target.value,
                        brand: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="modal-row">
                  <label>Tên chủ thẻ / tài khoản</label>
                  <input
                    value={paymentForm.holderName}
                    onChange={(e) =>
                      setPaymentForm((f) => ({
                        ...f,
                        holderName: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {paymentForm.type === "card" && (
              <>
                <div className="modal-row">
                  <label>4 số cuối</label>
                  <input
                    maxLength={4}
                    value={paymentForm.last4}
                    onChange={(e) =>
                      setPaymentForm((f) => ({
                        ...f,
                        last4: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>
                <div className="modal-row-inline">
                  <div className="modal-row">
                    <label>Tháng hết hạn</label>
                    <input
                      maxLength={2}
                      value={paymentForm.expMonth}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          expMonth: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                  <div className="modal-row">
                    <label>Năm hết hạn</label>
                    <input
                      maxLength={4}
                      value={paymentForm.expYear}
                      onChange={(e) =>
                        setPaymentForm((f) => ({
                          ...f,
                          expYear: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                </div>
              </>
            )}

            {["bank", "momo", "zaloPay"].includes(paymentForm.type) && (
              <div className="modal-row">
                <label>
                  {paymentForm.type === "bank"
                    ? "Số tài khoản"
                    : "Số ví / SĐT liên kết"}
                </label>
                <input
                  value={paymentForm.accountNumber}
                  onChange={(e) =>
                    setPaymentForm((f) => ({
                      ...f,
                      accountNumber: e.target.value,
                    }))
                  }
                />
              </div>
            )}


            <div className="modal-row">
              <label>
                <input
                  type="checkbox"
                  checked={!!paymentForm.isDefault}
                  onChange={(e) =>
                    setPaymentForm((f) => ({
                      ...f,
                      isDefault: e.target.checked,
                    }))
                  }
                />{" "}
                Đặt làm phương thức mặc định
              </label>
            </div>

            <div className="account-modal-footer">
              {error && <span className="modal-error">{error}</span>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  Lưu
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {activeModal === "password" && (
        <Modal title="Đổi mật khẩu" onClose={closeModal}>
          <form onSubmit={handleChangePassword}>
            <div className="modal-row">
              <label>Mật khẩu hiện tại</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="modal-row">
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    newPassword: e.target.value,
                  }))
                }
              />
            </div>
            <div className="modal-row">
              <label>Nhập lại mật khẩu mới</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((f) => ({
                    ...f,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </div>

            <div className="account-modal-footer">
              {error && <span className="modal-error">{error}</span>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={saving}
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
