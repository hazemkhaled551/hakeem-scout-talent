import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../AuthPage/AuthPage.css";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function RequestRestore() {
  const navigate = useNavigate();
  const { requestRestoreEmail } = useAuth();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resendSecs, setResendSecs] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  async function handleSubmit() {
    setTouched(true);
    setError("");
    if (!isValidEmail(email)) return;
    try {
      setLoading(true);
      await requestRestoreEmail(email);
      setSent(true);
      setResendSecs(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendSecs > 0) return;
    try {
      setLoading(true);
      await requestRestoreEmail(email);
      setResendSecs(60);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const emailError = touched && !isValidEmail(email);

  return (
    <div className="ap-root">
      <div className="ap-bg">
        <div className="ap-orb ap-orb--1" />
        <div className="ap-orb ap-orb--2" />
        <div className="ap-orb ap-orb--3" />
        <div className="ap-orb ap-orb--4" />
        <div className="ap-mesh" />
      </div>

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
        <div className="ap-headline">
          <span className="ap-eyebrow">📬 Account Recovery</span>
          <h1 className="ap-title">
            {sent ? "Check your inbox" : "Restore your email"}
          </h1>
          <p className="ap-subtitle">
            {sent
              ? `We sent a restore link to ${email}. The link expires in 15 minutes.`
              : "Enter your registered email and we'll send you a secure restore link."}
          </p>
        </div>

        <div className="ap-card ap-card--sm">
          {sent ? (
            /* ── SENT ── */
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--success">✉</div>
              <div className="ap-notice ap-notice--blue">
                Didn't receive the email? Check your spam folder or try
                resending.
              </div>

              <button
                className="ap-btn-primary"
                onClick={handleResend}
                disabled={resendSecs > 0 || loading}
                style={{ opacity: resendSecs > 0 || loading ? 0.55 : 1 }}
              >
                {loading ? (
                  <>
                    <span className="ap-spinner" /> Sending…
                  </>
                ) : resendSecs > 0 ? (
                  `↺ Resend in ${resendSecs}s`
                ) : (
                  "↺ Resend Email"
                )}
              </button>

              {resendSecs > 0 && (
                <p className="ap-countdown">
                  You can resend in <strong>{resendSecs}s</strong>
                </p>
              )}

              <button
                className="ap-btn-ghost"
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
                  ref={inputRef}
                  className={`ap-input${emailError ? " ap-input--err" : ""}`}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onBlur={() => setTouched(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {emailError && (
                  <p className="ap-field-err">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              <button
                className="ap-btn-primary"
                onClick={handleSubmit}
                disabled={loading || (touched && !isValidEmail(email))}
                style={{
                  opacity:
                    loading || (touched && !isValidEmail(email)) ? 0.55 : 1,
                }}
              >
                {loading ? (
                  <>
                    <span className="ap-spinner" /> Sending…
                  </>
                ) : (
                  "Send Restore Link →"
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
