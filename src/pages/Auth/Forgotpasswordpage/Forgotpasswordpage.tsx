import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
// ✅ import نفس CSS الـ AuthPage — مفيش CSS منفصل
import "../AuthPage/AuthPage.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await forgetPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to send reset link. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ap-root">
      {/* Background */}
      <div className="ap-bg">
        <div className="ap-orb ap-orb--1" />
        <div className="ap-orb ap-orb--2" />
        <div className="ap-orb ap-orb--3" />
        <div className="ap-orb ap-orb--4" />
        <div className="ap-mesh" />
      </div>

      {/* Nav */}
      <nav className="ap-nav">
        <a href="/" className="ap-logo">
          <div className="ap-logo-icon">H</div>
          <span className="ap-logo-name">Hakeem</span>
        </a>
        <button className="ap-nav-back" onClick={() => navigate("/auth")}>
          ← Back to login
        </button>
      </nav>

      <main className="ap-main">
        {/* Headline */}
        <div className="ap-headline">
          <span className="ap-eyebrow">✉ Password Recovery</span>
          <h1 className="ap-title">
            {sent ? "Check your inbox" : "Forgot your password?"}
          </h1>
          <p className="ap-subtitle">
            {sent
              ? `We sent a reset link to ${email}. The link expires in 15 minutes.`
              : "Enter your email and we'll send you a secure reset link right away."}
          </p>
        </div>

        {/* Card */}
        <div className="ap-card ap-card--sm">
          {sent ? (
            /* ── SUCCESS STATE ── */
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--success">✓</div>
              <p className="ap-state-hint">
                Didn't receive it? Check your spam folder or{" "}
                <button
                  className="ap-inline-link"
                  onClick={() => setSent(false)}
                >
                  try a different email
                </button>
                .
              </p>
              <button
                className="ap-btn-primary"
                onClick={() => navigate("/auth")}
              >
                ← Back to Login
              </button>
            </div>
          ) : (
            /* ── FORM ── */
            <div className="ap-form">
              {error && (
                <div className="ap-alert ap-alert--error">
                  <span className="ap-alert-icon">✕</span>
                  {error}
                </div>
              )}

              <div className="ap-field">
                <label className="ap-label">Email address</label>
                <input
                  className="ap-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
              </div>

              <button
                className="ap-btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ap-spinner" /> Sending…
                  </>
                ) : (
                  "Send Reset Link →"
                )}
              </button>

              <button
                className="ap-btn-ghost"
                onClick={() => navigate("/auth")}
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>

        <div className="ap-trust">
          <span>🔒 Secure link</span>
          <span className="ap-dot" />
          <span>⏱ Expires in 15 min</span>
          <span className="ap-dot" />
          <span>✦ Hakeem Auth</span>
        </div>
      </main>
    </div>
  );
}
