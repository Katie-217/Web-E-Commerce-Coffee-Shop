import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function GoogleCallbackPage() {
  const { loginWithToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const next = params.get("next") || "/";

    if (!token) {
      navigate("/auth?error=google", { replace: true });
      return;
    }

    (async () => {
      try {
        await loginWithToken(token);
        navigate(next, { replace: true });
      } catch (err) {
        console.error(err);
        navigate("/auth?error=google", { replace: true });
      }
    })();
  }, [location.search, loginWithToken, navigate]);

  return (
    <div className="auth-wrapper">
      <div className="auth-loading">
        Đang đăng nhập bằng Google...
      </div>
    </div>
  );
}
