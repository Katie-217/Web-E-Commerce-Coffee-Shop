// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const mailer = require("../config/mailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Google OAuth config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3001/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * Normalize user document for frontend payload
 */
function toUserPayload(doc) {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : { ...doc };

  delete plain.password;
  delete plain.__v;

  const fullName =
    plain.fullName ||
    [plain.firstName, plain.lastName].filter(Boolean).join(" ");

  const normalizedEmail = String(plain.email || "").toLowerCase().trim();
  const userRole =
    plain.role ||
    (normalizedEmail === "admin@gmail.com" ? "admin" : "customer");

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
    role: userRole,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

async function sendTemporaryPasswordEmail(toEmail, tempPassword) {
  const appName = process.env.APP_NAME || "Coffee Shop";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
    </head>
    <body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;
               box-shadow:0 10px 30px rgba(15,23,42,0.12);">
        <tr>
          <td style="padding:24px 24px 16px;">
            <h1 style="margin:0 0 8px;font-size:20px;color:#111827;">
              Your ${appName} account is ready
            </h1>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;">
              We've created an account for you so you can track your orders and save your details.
            </p>

            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">
              Login email
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#111827;">
              <strong>${toEmail}</strong>
            </p>

            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">
              Temporary password
            </p>
            <p style="margin:0 0 16px;font-size:18px;color:#111827;">
              <strong>${tempPassword}</strong>
            </p>

            <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">
              For security, please log in and change this password in your account settings.
            </p>

            <p style="margin:0;">
              <a href="${frontendUrl}/account"
                 style="display:inline-block;padding:10px 18px;border-radius:999px;
                        background:#7c3aed;color:#ffffff;text-decoration:none;
                        font-size:14px;font-weight:500;">
                Go to your account
              </a>
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const from =
    process.env.FROM_EMAIL ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    "no-reply@example.com";

  const mailOptions = {
    from,
    to: toEmail,
    subject: `${appName} – your temporary password`,
    html,
  };

  const info = await mailer.sendMail(mailOptions);
  console.log(
    "📧 Temp password mail sent:",
    info && info.messageId,
    "=>",
    toEmail
  );
  return info;
}

async function sendResetOtpEmail(to, otp) {
  const from = process.env.FROM_EMAIL || "no-reply@example.com";

  const html = `
    <div style="font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height:1.6; color:#111827;">
      <h2 style="margin-bottom:8px;">Reset your password</h2>
      <p>Hello,</p>
      <p>You recently requested to reset the password for your <strong>Coffee Shop</strong> account.</p>
      <p>Your verification code is:</p>
      <p style="font-size:22px; font-weight:700; letter-spacing:4px;">
        ${otp}
      </p>
      <p>This code is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <hr style="border:none; border-top:1px solid #e5e7eb; margin:16px 0;" />
      <p style="font-size:12px; color:#6b7280;">This is an automated email from the Coffee Shop system.</p>
    </div>
  `;

  await mailer.sendMail({
    from,
    to,
    subject: "Reset your password - Coffee Shop",
    text: `Your password reset OTP is ${otp} (valid for 10 minutes).`,
    html,
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      firstName: bodyFirstName,
      lastName: bodyLastName,
      email,
      password,
      address, // string address from form
      sendPasswordEmail,
    } = req.body || {};
    console.log("[auth/register] body =", req.body);

    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Missing full name / email / password" });
    }

    // Build fullName from name / firstName + lastName
    let fullName =
      (name || `${bodyFirstName || ""} ${bodyLastName || ""}` || "").trim();

    if (!fullName) {
      return res
        .status(400)
        .json({ message: "Missing full name / email / password" });
    }

    // Prepare firstName / lastName
    let firstName = bodyFirstName;
    let lastName = bodyLastName;

    if (!firstName || !lastName) {
      const parts = fullName.split(/\s+/).filter(Boolean);

      if (parts.length === 1) {
        firstName = parts[0];
        lastName = parts[0];
      } else if (parts.length > 1) {
        firstName = parts.slice(0, -1).join(" ");
        lastName = parts[parts.length - 1];
      }
    }

    if (!firstName) firstName = fullName;
    if (!lastName) lastName = fullName;

    // Build default shipping address from the sign-up form
    const trimmedAddress =
      typeof address === "string" ? address.trim() : "";

    const defaultAddresses = trimmedAddress
      ? [
          {
            label: "home",
            type: "shipping",
            recipientName: fullName,
            phone: "",
            address: trimmedAddress,
            ward: "",
            district: "",
            city: "",
            isDefault: true,
          },
        ]
      : [];

    // Check if email already exists
    const existing = await Customer.findOne({
      email: normalizedEmail,
      status: { $ne: "deleted" },
    });

    if (existing) {
      return res.status(409).json({
        message: "This email is already registered. Please log in instead.",
      });
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
      role: normalizedEmail === "admin@gmail.com" ? "admin" : "customer",
      addresses: defaultAddresses,
    });

    // Auto-register from checkout -> optionally send temporary password email
    const shouldSendTempPassword =
      sendPasswordEmail === true ||
      sendPasswordEmail === "true" ||
      sendPasswordEmail === 1 ||
      sendPasswordEmail === "1";

    console.log(
      "[auth/register] sendPasswordEmail raw =",
      sendPasswordEmail,
      "=> shouldSendTempPassword =",
      shouldSendTempPassword
    );

    if (shouldSendTempPassword) {
      try {
        console.log(
          "[auth/register] sending temporary password email to",
          customer.email
        );
        const info = await sendTemporaryPasswordEmail(
          customer.email,
          password
        );
        console.log(
          "[auth/register] temp password email sent, messageId =",
          info && info.messageId
        );
      } catch (mailErr) {
        console.error(
          "[auth/register] sendTemporaryPasswordEmail error:",
          mailErr
        );
        // Không fail signup nếu gửi mail lỗi
      }
    } else {
      console.log(
        "[auth/register] skip temp password email (no sendPasswordEmail flag)"
      );
    }

    const token = jwt.sign({ sub: customer._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      token,
      user: toUserPayload(customer),
    });
  } catch (err) {
    console.error("[auth/register] error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
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
      return res.status(400).json({ message: "Missing email / password" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer || !customer.password) {
      return res
        .status(400)
        .json({ message: "Incorrect email or password" });
    }

    const ok = await bcrypt.compare(password, customer.password);
    if (!ok) {
      return res
        .status(400)
        .json({ message: "Incorrect email or password" });
    }

    const token = jwt.sign({ sub: customer._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: toUserPayload(customer),
    });
  } catch (err) {
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

  const state = encodeURIComponent(req.query.state || "/");

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
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
      return res.status(500).send("Google auth failed");
    }

    const { access_token } = tokenJson;

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
        role: email === "admin@gmail.com" ? "admin" : "customer",
      });
    } else {
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

    const token = jwt.sign({ sub: customer._id.toString() }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const redirectPath = state ? decodeURIComponent(state) : "/";
    const redirectUrl = `${FRONTEND_URL}/auth/google/callback?token=${token}&next=${encodeURIComponent(
      redirectPath
    )}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    return res.status(500).send("Google auth error");
  }
});

// POST /api/auth/forgot-password/request
router.post("/forgot-password/request", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Missing email" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // To avoid leaking whether the email exists, always respond with generic message
    if (!customer) {
      console.log("[forgot/request] email not found:", normalizedEmail);
      return res.json({
        message:
          "If this email exists in our system, we have sent a verification code.",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    customer.resetPasswordOtp = otp;
    customer.resetPasswordExpires = expires;
    await customer.save();

    await sendResetOtpEmail(normalizedEmail, otp);

    return res.json({
      message: "Verification code sent. Please check your email.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to send verification code",
      error: err.message,
    });
  }
});

// POST /api/auth/forgot-password/verify
router.post("/forgot-password/verify", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Missing email / OTP / new password",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    if (!customer) {
      return res
        .status(400)
        .json({ message: "Incorrect email or verification code" });
    }

    if (
      !customer.resetPasswordOtp ||
      !customer.resetPasswordExpires ||
      String(customer.resetPasswordOtp) !== String(otp)
    ) {
      return res.status(400).json({
        message: "Verification code is invalid or has expired",
      });
    }

    if (customer.resetPasswordExpires < new Date()) {
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    customer.password = hash;
    customer.resetPasswordOtp = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();

    return res.json({
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Reset password failed",
      error: err.message,
    });
  }
});

/**
 * Middleware: verify JWT token
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
    return res.status(500).json({
      message: "Failed to load profile",
      error: err.message,
    });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  return res.json({ message: "Logged out" });
});

// POST /api/auth/change-password
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Missing current password / new password",
      });
    }

    const customer = await Customer.findById(req.userId);
    if (!customer || !customer.password) {
      return res.status(400).json({
        message: "User not found or password not set",
      });
    }

    const ok = await bcrypt.compare(currentPassword, customer.password);
    if (!ok) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    customer.password = hash;
    await customer.save();

    res.json({ message: "Password changed" });
  } catch (err) {
    console.error("[auth/change-password] error:", err);
    res.status(500).json({
      message: "Change password failed",
      error: err.message,
    });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
