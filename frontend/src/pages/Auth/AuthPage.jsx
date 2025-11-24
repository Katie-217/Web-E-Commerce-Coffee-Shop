import { useLocation, useNavigate } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import '../Auth/auth.css';
import { useAuth } from '../../contexts/AuthContext';
import { forgotPasswordRequest, forgotPasswordVerify } from '../../services/auth';


/**
 * Double slider login/register page
 * - initialTab: 'login' | 'register'
 */

const AuthPage = ({ initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // nếu user bị redirect từ trang protected, dùng lại trang đó
  const from = location.state?.from?.pathname || '/';

  const [isRegister, setIsRegister] = useState(initialTab === 'register');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Background assets (served from public/)
  const heroImg = '/images/login.png';
  const overlayVideo = '/images/hero-bg.mp4';

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const canSubmitLogin = useMemo(
    () =>
      /\S+@\S+\.\S+/.test(loginData.email) &&
      loginData.password.length >= 6,
    [loginData]
  );

  const canSubmitRegister = useMemo(() => {
    const emailOk = /\S+@\S+\.\S+/.test(registerData.email);
    const passOk = registerData.password.length >= 6;
    const match = registerData.password === registerData.confirm;
    const nameOk = registerData.name.trim().length >= 2;
    return emailOk && passOk && match && nameOk;
  }, [registerData]);


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!canSubmitLogin) return;

    try {
      setLoading(true);
      setMessage('');
      await login(loginData.email, loginData.password);
      // ✅ login xong quay lại trang cũ (hoặc '/')
      navigate(from, { replace: true });
    } catch (err) {
      setMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!canSubmitRegister) return;

    try {
      setLoading(true);
      setMessage('');
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
      });

      // ✅ Đăng ký xong: báo message + chuyển qua tab login
      setMessage('Account created! Please login.');
      setIsRegister(false);
      setLoginData((prev) => ({
        ...prev,
        email: registerData.email, // auto fill email vào form login cho tiện
      }));
    } catch (err) {
      setMessage(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const API_URL = process.env.REACT_APP_API_URL || '';
    window.location.href = `${API_URL}/api/auth/google`;
  };
  const [showForgot, setShowForgot] = useState(false);
const [forgotStep, setForgotStep] = useState(1);
const [forgotEmail, setForgotEmail] = useState('');
const [forgotOtp, setForgotOtp] = useState('');
const [forgotNewPassword, setForgotNewPassword] = useState('');
const [forgotConfirm, setForgotConfirm] = useState('');
const [forgotLoading, setForgotLoading] = useState(false);


  return (
    <div
      className="auth-wrapper"
      style={{
        '--hero-image': `url(${heroImg})`,
      }}
    >
      <div className={`auth-container ${isRegister ? 'right-panel-active' : ''}`}>
        {/* Register */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={handleRegister}>
            <h1>Create account</h1>

            <div className="input-group">
              <input
                type="text"
                placeholder="Full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password (≥ 6 characters)"
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm password"
                value={registerData.confirm}
                onChange={(e) =>
                  setRegisterData((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
                required
              />
            </div>

            <button
              className="auth-btn"
              type="submit"
              disabled={!canSubmitRegister || loading}
            >
              {loading ? 'Processing...' : 'Register'}
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSignIn}
              aria-label="Sign in with Google"
            >
              <img
                src="/images/google.webp"
                alt=""
                className="google-icon"
                width="20"
                height="20"
                decoding="async"
                loading="lazy"
              />
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>

        {/* Login */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLogin}>
            <h1>Sign in</h1>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="extra">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={loginData.remember}
                  onChange={(e) =>
                    setLoginData((prev) => ({
                      ...prev,
                      remember: e.target.checked,
                    }))
                  }
                />
                Remember me
              </label>
              <button
    type="button"
    className="link link-button"
    onClick={() => {
      setMessage('');
      setForgotStep(1);
      setForgotEmail(loginData.email); // auto fill nếu có
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirm('');
      setShowForgot(true);
    }}
  >
    Forgot password?
  </button>
            </div>

            <button
              className="auth-btn"
              type="submit"
              disabled={!canSubmitLogin || loading}
            >
              {loading ? 'Processing...' : 'Sign in'}
            </button>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSignIn}
              aria-label="Sign in with Google"
            >
              <img
                src="/images/google.webp"
                alt=""
                className="google-icon"
                width="20"
                height="20"
                decoding="async"
                loading="lazy"
              />
              <span>Sign in with Google</span>
            </button>
          </form>
        </div>

        {/* Overlay */}
        <div className="auth-overlay-container">
          <div className="auth-overlay">
            <video
              className="auth-overlay__media"
              src={overlayVideo}
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="auth-overlay-panel auth-overlay-left">
              <h2>Hello friends</h2>
              <p>
                If you already have an account, please login to continue your coffee
                journey.
              </p>
              <button className="ghost" onClick={() => setIsRegister(false)}>
                Sign in
              </button>
            </div>
            <div className="auth-overlay-panel auth-overlay-right">
              <h2>Start your journey now</h2>
              <p>
                If you don’t have an account, join us and start your journey.
              </p>
              <button className="ghost" onClick={() => setIsRegister(true)}>
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
      {showForgot && (
  <div className="auth-modal-backdrop">
    <div className="auth-modal">
      {forgotStep === 1 ? (
        <>
          <h2>Reset password</h2>
          <p className="auth-modal-desc">
            Nhập email của bạn. Chúng tôi sẽ gửi mã xác nhận (OTP) để đặt lại mật khẩu.
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
                setMessage('Email không hợp lệ');
                return;
              }
              try {
                setForgotLoading(true);
                setMessage('');
                await forgotPasswordRequest(forgotEmail);
                setForgotStep(2);
                setMessage('Đã gửi mã xác nhận. Kiểm tra email của bạn.');
              } catch (err) {
                setMessage(err.message || 'Không thể gửi mã xác nhận.');
              } finally {
                setForgotLoading(false);
              }
            }}
          >
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-modal-actions">
              <button
                type="button"
                className="auth-btn auth-btn--ghost"
                onClick={() => setShowForgot(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="auth-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Đang gửi...' : 'Gửi mã'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h2>Nhập OTP & mật khẩu mới</h2>
          <p className="auth-modal-desc">
            Mã OTP gồm 6 số đã được gửi tới: <b>{forgotEmail}</b>
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!forgotOtp || forgotOtp.length < 4) {
                setMessage('Vui lòng nhập mã OTP hợp lệ.');
                return;
              }
              if (forgotNewPassword.length < 6) {
                setMessage('Mật khẩu mới tối thiểu 6 ký tự.');
                return;
              }
              if (forgotNewPassword !== forgotConfirm) {
                setMessage('Xác nhận mật khẩu không khớp.');
                return;
              }

              try {
                setForgotLoading(true);
                setMessage('');
                await forgotPasswordVerify({
                  email: forgotEmail,
                  otp: forgotOtp,
                  newPassword: forgotNewPassword,
                });

                setMessage('Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.');
                setShowForgot(false);
                setForgotStep(1);
                setLoginData((prev) => ({
                  ...prev,
                  email: forgotEmail,
                  password: '',
                }));
              } catch (err) {
                setMessage(err.message || 'Reset password failed.');
              } finally {
                setForgotLoading(false);
              }
            }}
          >
            <div className="input-group">
              <input
                type="text"
                placeholder="OTP (6 số)"
                value={forgotOtp}
                onChange={(e) =>
                  setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="New password (≥ 6 characters)"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm new password"
                value={forgotConfirm}
                onChange={(e) => setForgotConfirm(e.target.value)}
                required
              />
            </div>

            <div className="auth-modal-actions">
              <button
                type="button"
                className="auth-btn auth-btn--ghost"
                onClick={() => {
                  setShowForgot(false);
                  setForgotStep(1);
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="auth-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  </div>
)}


      {message && <div className="auth-message">{message}</div>}
    </div>
  );
};

export default AuthPage;
