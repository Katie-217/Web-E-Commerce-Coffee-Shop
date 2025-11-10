import React from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AccountPage() {
  const { user, logout } = useAuth();
  if (!user) return null; // đã có RequireAuth chặn, phòng hờ

  return (
    <div className="container" style={{ maxWidth: 720, margin: "40px auto" }}>
      <h1>Tài khoản của tôi</h1>
      <p><b>Họ tên:</b> {user.fullName}</p>
      <p><b>Email:</b> {user.email}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  );
}
