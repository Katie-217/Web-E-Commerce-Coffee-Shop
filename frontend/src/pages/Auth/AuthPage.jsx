import { useLocation } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Double slider login/register page (scoped classes).
 * - initialTab: 'login' | 'register'
 * - Update endpoints in src/services/auth.js for your backend.
 */

const AuthPage = ({ initialTab = 'login' }) => {
    const { login, register } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [isRegister, setIsRegister] = useState(initialTab === 'register');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Background assets (served from public/)
    const heroImg = '/images/login.png';
    const overlayVideo = '/images/hero-bg.mp4';

    const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
    const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirm: '' });

    const canSubmitLogin = useMemo(
        () => /\S+@\S+\.\S+/.test(loginData.email) && loginData.password.length >= 6,
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
            setMessage('Signed in successfully!');
            navigate('/');
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
                password: registerData.password
            });
            setMessage('Account created! Please login.');
            setIsRegister(false);
        } catch (err) {
            setMessage(err.message || 'Sign up failed.');
        } finally {
            setLoading(false);
        }
    };
    const handleGoogleSignIn = () => {
        const API_URL = process.env.REACT_APP_API_URL || '';
        // Backend route that starts Google OAuth flow
        window.location.href = `${API_URL}/api/auth/google`;
    };


    return (
        <div
            className="auth-wrapper"
            style={{
                ['--hero-image']: `url(${heroImg})`, 
            }}
        >
            <div className={`auth-container ${isRegister ? 'right-panel-active' : ''}`}>

                {/* Register (left pane when active) */}
                <div className="form-container sign-up-container">
                    <form className="auth-form" onSubmit={handleRegister}>
                        <h1>Create account</h1>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Full name"
                                value={registerData.name}
                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password (≥ 6 characters)"
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={registerData.confirm}
                                onChange={(e) => setRegisterData({ ...registerData, confirm: e.target.value })}
                                required
                            />
                        </div>

                        <button className="auth-btn" type="submit" disabled={!canSubmitRegister || loading}>
                            {loading ? 'Processing...' : 'Register'}
                        </button>
                        {/* ---- divider ---- */}
                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        {/* ---- Google button ---- */}
                        <button
                            type="button"
                            className="google-btn"
                            onClick={() => handleGoogleSignIn()}
                            aria-label="Sign in with Google"
                        >
                            <img
                                src="/images/google.webp"   // file đặt ở public/images/google.webp
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

                {/* Sign in (default visible) */}
                <div className="form-container sign-in-container">
                    <form className="auth-form" onSubmit={handleLogin}>
                        <h1>Sign in</h1>
                        <div className="input-group">
                            <input
                                type="email"
                                placeholder="Email"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="extra">
                            <label className="remember">
                                <input
                                    type="checkbox"
                                    checked={loginData.remember}
                                    onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
                                />
                                Remember me
                            </label>
                            <a className="link" href="#forgot">Forgot password?</a>
                        </div>

                        <button className="auth-btn" type="submit" disabled={!canSubmitLogin || loading}>
                            {loading ? 'Processing...' : 'Sign in'}
                        </button>

                        {/* ---- divider ---- */}
                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        {/* ---- Google button ---- */}
                        <button
                            type="button"
                            className="google-btn"
                            onClick={() => handleGoogleSignIn()}
                            aria-label="Sign in with Google"
                        >
                            <img
                                src="/images/google.webp"   // file đặt ở public/images/google.webp
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

                {/* Overlay (RENAMED classes) */}
                <div className="auth-overlay-container">
                    <div className="auth-overlay">
                        {/* Animated video background */}
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
                            <p>If you already have an account, please login to continue your coffee journey.</p>
                            <button className="ghost" onClick={() => setIsRegister(false)}>Sign in</button>
                        </div>
                        <div className="auth-overlay-panel auth-overlay-right">
                            <h2>Start your journey now</h2>
                            <p>If you don’t have an account, join us and start your journey.</p>
                            <button className="ghost" onClick={() => setIsRegister(true)}>Register</button>
                        </div>
                    </div>
                </div>
            </div>

            {message && <div className="auth-message">{message}</div>}
        </div>
    );
};

export default AuthPage;
