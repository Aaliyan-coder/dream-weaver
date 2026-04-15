require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://www.bigbinaryerp.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["POST", "GET"],
  })
);

// ─── Nodemailer Transporter ───────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail transporter error:", error.message);
  } else {
    console.log("✅ Mail transporter is ready");
  }
});

// ─── Validation Helper ────────────────────────────────────────────────────────
function validateContactForm({ firstName, lastName, email, service, message }) {
  if (!firstName || firstName.trim().length < 2) return "First name is required.";
  if (!lastName || lastName.trim().length < 2) return "Last name is required.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email is required.";
  if (!service || service.trim() === "") return "Please select a service.";
  if (!message || message.trim().length < 10) return "Message must be at least 10 characters.";
  return null;
}

// ─── POST /api/contact ────────────────────────────────────────────────────────
app.post("/api/contact", async (req, res) => {
  const { firstName, lastName, email, phone, service, message } = req.body;

  // Validate
  const validationError = validateContactForm({ firstName, lastName, email, service, message });
  if (validationError) {
    return res.status(400).json({ success: false, error: validationError });
  }

  try {
    // ── Email to YOU (the business) ──
    await transporter.sendMail({
      from: `"BigBinaryERP" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `New Enquiry: ${service} — ${firstName} ${lastName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff5f7;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #be185d, #9333ea); padding: 36px 32px 28px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 14px; margin-bottom: 14px;">
              <span style="color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">⚡ POWERED BY BIG BINARY</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">New Contact Form Submission</h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px; background: #ffffff; margin: 0;">
            <table style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #fce7f3;">
              <tr style="background: #fdf2f8;">
                <td style="padding: 14px 18px; font-weight: 700; color: #be185d; width: 35%; font-size: 13px; border-bottom: 1px solid #fce7f3;">Full Name</td>
                <td style="padding: 14px 18px; color: #1f2937; font-size: 14px; border-bottom: 1px solid #fce7f3;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 14px 18px; font-weight: 700; color: #be185d; font-size: 13px; border-bottom: 1px solid #fce7f3;">Email</td>
                <td style="padding: 14px 18px; border-bottom: 1px solid #fce7f3;"><a href="mailto:${email}" style="color: #9333ea; text-decoration: none; font-size: 14px;">${email}</a></td>
              </tr>
              <tr style="background: #fdf2f8;">
                <td style="padding: 14px 18px; font-weight: 700; color: #be185d; font-size: 13px; border-bottom: 1px solid #fce7f3;">Phone</td>
                <td style="padding: 14px 18px; color: #1f2937; font-size: 14px; border-bottom: 1px solid #fce7f3;">${phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 14px 18px; font-weight: 700; color: #be185d; font-size: 13px; border-bottom: 1px solid #fce7f3;">Service</td>
                <td style="padding: 14px 18px; color: #1f2937; font-size: 14px; border-bottom: 1px solid #fce7f3;">${service}</td>
              </tr>
              <tr style="background: #fdf2f8;">
                <td style="padding: 14px 18px; font-weight: 700; color: #be185d; font-size: 13px; vertical-align: top;">Message</td>
                <td style="padding: 14px 18px; color: #1f2937; font-size: 14px; line-height: 1.7;">${message.replace(/\n/g, "<br>")}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="background: #fdf2f8; padding: 20px 32px; text-align: center; border-top: 1px solid #fce7f3;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
              Sent from BigBinaryERP Contact Form &nbsp;•&nbsp; ${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} PKT
            </p>
          </div>
        </div>
      `,
    });

    // ── Auto-reply to the USER ──
    await transporter.sendMail({
      from: `"BigBinaryERP" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `We received your message, ${firstName}!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff5f7;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #be185d, #9333ea); padding: 36px 32px 28px; text-align: center;">
            <div style="display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; padding: 4px 14px; margin-bottom: 14px;">
              <span style="color: rgba(255,255,255,0.9); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">⚡ POWERED BY BIG BINARY</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Message Received!</h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px; background: #ffffff;">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin-top: 0;">Hi <strong>${firstName}</strong>,</p>
            <p style="color: #4b5563; line-height: 1.7; font-size: 14px;">
              Thank you for reaching out to <strong style="color: #be185d;">BigBinaryERP</strong>. We've received your enquiry about <strong>${service}</strong> and will get back to you within one business day.
            </p>

            <div style="background: #fdf2f8; border-left: 4px solid #be185d; padding: 16px 20px; border-radius: 0 10px 10px 0; margin: 24px 0;">
              <p style="margin: 0; color: #6b7280; font-style: italic; font-size: 13px; line-height: 1.6;">"${message.substring(0, 150)}${message.length > 150 ? "…" : ""}"</p>
            </div>

            <p style="color: #4b5563; line-height: 1.7; font-size: 14px;">In the meantime, feel free to reach us at:</p>
            <p style="color: #4b5563; font-size: 14px;">📞 <strong>+92 326 8880101</strong><br>📧 <strong>info@bigbinaryerp.com</strong></p>
          </div>

          <!-- Footer -->
          <div style="background: #fdf2f8; padding: 20px 32px; text-align: center; border-top: 1px solid #fce7f3;">
            <p style="color: #9ca3af; font-size: 11px; margin: 0; letter-spacing: 0.5px;">
              © ${new Date().getFullYear()} BigBinaryERP &nbsp;•&nbsp; 444-Q DHA Phase 2, Lahore, Pakistan
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    return res.status(500).json({ success: false, error: "Failed to send email. Please try again." });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;