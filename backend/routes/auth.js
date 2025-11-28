// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const mailer = require("../config/mailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const querystring = require("querystring");

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3001/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Chuẩn hoá dữ liệu user trả về cho FE
 */
function toUserPayload(doc) {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : { ...doc };

  delete plain.password;
  delete plain.__v;

  const fullName =
    plain.fullName ||
    [plain.firstName, plain.lastName].filter(Boolean).join(" ");

  return {
    id: String(plain._id || plain.id),
    email: plain.email,
    fullName,
    firstName: plain.firstName,
    lastName: plain.lastName,
    avatarUrl: plain.avatarUrl,

    phone: plain.phone || null,
    gender: plain.gender || null,
    dateOfBirth: plain.dateOfBirth || null,

    // ==== QUAN TRỌNG: giữ đủ data ====
    addresses: Array.isArray(plain.addresses) ? plain.addresses : [],
    paymentMethods: Array.isArray(plain.paymentMethods)
      ? plain.paymentMethods
      : [],
    wishlist: Array.isArray(plain.wishlist) ? plain.wishlist : [],

    loyalty: plain.loyalty || null,
    preferences: plain.preferences || null,
    consents: plain.consents || null,
    tags: Array.isArray(plain.tags) ? plain.tags : [],
    status: plain.status || "active",
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}


async function sendResetOtpEmail(to, otp) {
  const from = process.env.FROM_EMAIL || "no-reply@example.com";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const html = `
    <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height:1.6; color:#111827;">
      <h2 style="margin-bottom:8px;">Đặt lại mật khẩu</h2>
      <p>Xin chào,</p>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại <strong>Coffee Shop</strong>.</p>
      <p>Mã xác nhận của bạn là:</p>
      <p style="font-size:22px; font-weight:700; letter-spacing:4px;">
        ${otp}
      </p>
      <p>Mã có hiệu lực trong <strong>10 phút</strong>.</p>
      <p>Nếu bạn không thực hiện thao tác này, hãy bỏ qua email này.</p>
      <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
      <p style="font-size:12px; color:#6b7280;">Email được gửi tự động từ hệ thống Coffee Shop.</p>
    </div>
  `;

  const info = await mailer.sendMail({
    from,
    to,
    subject: "Đặt lại mật khẩu - Coffee Shop",
    text: `Mã OTP đặt lại mật khẩu của bạn là ${otp} (hiệu lực 10 phút).`,
    html,
  });

  console.log("📧 Reset OTP sent:", info.messageId, "=>", to);
}

/**
 * POST /api/auth/register
 * body: { name, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Thiếu name / email / password" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // tách họ tên
    const fullName = name.trim();
    const parts = fullName.split(/\s+/);
    let firstName, lastName;
    if (parts.length === 1) {
      firstName = parts[0];
      lastName = parts[0];
    } else {
      lastName = parts[parts.length - 1];
      firstName = parts.slice(0, -1).join(" ");
    }

    const hash = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      firstName,
      lastName,
      fullName,
      email: normalizedEmail,
      password: hash,
      status: "active",
      provider: "local",
    });

    const token = jwt.sign({ sub: customer._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      token,
      user: toUserPayload(customer),
    });
  } catch (err) {
    console.error("[auth/register] error:", err);
    return res
      .status(500)
      .json({ message: "Register failed", error: err.message });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email / password" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer || !customer.password) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const ok = await bcrypt.compare(password, customer.password);
    if (!ok) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign({ sub: customer._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: toUserPayload(customer),
    });
  } catch (err) {
    console.error("[auth/login] error:", err);
    return res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
});
// GET /api/auth/google  -> redirect to Google OAuth
router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).send("Google OAuth is not configured");
  }

  const state = encodeURIComponent(req.query.state || "/"); // có thể dùng sau để redirect về path cũ

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",    // luôn cho phép chọn account
    access_type: "offline",
    state,
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  return res.redirect(googleAuthUrl);
});
// GET /api/auth/google/callback
router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    // 1) Đổi code lấy access_token + id_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("[google/token] error:", tokenJson);
      return res.status(500).send("Google auth failed");
    }

    const { access_token } = tokenJson;

    // 2) Lấy thông tin user từ Google
    const profileRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const profile = await profileRes.json();
    const email = profile.email?.toLowerCase();
    const fullName = profile.name || email;
    const picture = profile.picture;

    if (!email) {
      return res.status(400).send("Google account has no email");
    }

    // 3) Tìm hoặc tạo Customer trong DB
    let customer = await Customer.findOne({ email });

    if (!customer) {
      const parts = fullName.split(/\s+/);
      let firstName, lastName;
      if (parts.length === 1) {
        firstName = lastName = parts[0];
      } else {
        lastName = parts[parts.length - 1];
        firstName = parts.slice(0, -1).join(" ");
      }

      customer = await Customer.create({
        email,
        fullName,
        firstName,
        lastName,
        avatarUrl: picture,
        status: "active",
        provider: "google",
      });
    } else {
      // update nhẹ thông tin nếu thiếu
      let changed = false;
      if (!customer.avatarUrl && picture) {
        customer.avatarUrl = picture;
        changed = true;
      }
      if (!customer.provider) {
        customer.provider = "google";
        changed = true;
      }
      if (changed) await customer.save();
    }

    // 4) Tạo JWT giống login thường
    const token = jwt.sign({ sub: customer._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5) Redirect về frontend, đính token trên query
    const redirectPath = state ? decodeURIComponent(state) : "/";
    const redirectUrl = `${FRONTEND_URL}/auth/google/callback?token=${token}&next=${encodeURIComponent(
      redirectPath
    )}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("[auth/google/callback] error:", err);
    return res.status(500).send("Google auth error");
  }
});

// POST /api/auth/forgot-password/request
router.post("/forgot-password/request", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Thiếu email" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // Để tránh lộ email có tồn tại hay không, vẫn trả message chung chung
    if (!customer) {
      console.log("[forgot/request] email không tồn tại:", normalizedEmail);
      return res.json({
        message:
          "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi mã xác nhận.",
      });
    }

    // Tạo mã OTP 6 số
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000); // +10 phút

    customer.resetPasswordOtp = otp;
    customer.resetPasswordExpires = expires;
    await customer.save();

    await sendResetOtpEmail(normalizedEmail, otp);

    return res.json({
      message:
        "Đã gửi mã xác nhận. Vui lòng kiểm tra email của bạn.",
    });
  } catch (err) {
    console.error("[auth/forgot-password/request] error:", err);
    return res.status(500).json({
      message: "Không thể gửi mã xác nhận",
      error: err.message,
    });
  }
});
// POST /api/auth/forgot-password/verify
router.post("/forgot-password/verify", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Thiếu email / OTP / mật khẩu mới" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer) {
      return res
        .status(400)
        .json({ message: "Email hoặc mã xác nhận không đúng" });
    }

    if (
      !customer.resetPasswordOtp ||
      !customer.resetPasswordExpires ||
      String(customer.resetPasswordOtp) !== String(otp)
    ) {
      return res
        .status(400)
        .json({ message: "Mã xác nhận không đúng hoặc đã hết hạn" });
    }

    if (customer.resetPasswordExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Mã xác nhận đã hết hạn. Vui lòng yêu cầu lại." });
    }

    // OK -> đổi mật khẩu
    const hash = await bcrypt.hash(newPassword, 10);
    customer.password = hash;
    customer.resetPasswordOtp = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    return res.json({
      message: "Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.",
    });
  } catch (err) {
    console.error("[auth/forgot-password/verify] error:", err);
    return res.status(500).json({
      message: "Reset password failed",
      error: err.message,
    });
  }
});

/**
 * Middleware check token
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * GET /api/auth/me
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(toUserPayload(customer));
  } catch (err) {
    console.error("[auth/me] error:", err);
    return res
      .status(500)
      .json({ message: "Failed to load profile", error: err.message });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  return res.json({ message: "Logged out" });
});

router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Thiếu mật khẩu hiện tại / mật khẩu mới" });
    }

    const customer = await Customer.findById(req.userId);
    if (!customer || !customer.password) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy người dùng hoặc chưa đặt mật khẩu" });
    }

    const ok = await bcrypt.compare(currentPassword, customer.password);
    if (!ok) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    customer.password = hash;
    await customer.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    console.error("[auth/change-password] error:", err);
    res
      .status(500)
      .json({ message: "Change password failed", error: err.message });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;