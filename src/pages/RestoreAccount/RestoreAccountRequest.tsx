import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BrainCircuit, Mail,  ArrowLeft,
  AlertCircle, RefreshCw, Send,
} from "lucide-react";
import "./auth-pages.css";

/* ════════════════════════════════════════════════════════════
   EMAIL VALIDATION
════════════════════════════════════════════════════════════ */
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function RequestRestore() {
  const navigate = useNavigate();

  const [email, setEmail]         = useState("");
  const [touched, setTouched]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState(false);
  const [error, setError]         = useState("");
  const [resendSecs, setResendSecs] = useState(0);
  const inputRef                  = useRef<HTMLInputElement>(null);

  /* focus on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* resend countdown */
  useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  /* ── Submit ─────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!isValidEmail(email)) return;

    try {
      setLoading(true);

      // 🔥 Replace with your real API call:
      // await forgotPassword({ email });

      await new Promise((r) => setTimeout(r, 1500));

      setSent(true);
      setResendSecs(60);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Resend ─────────────────────────────────────────────── */
  async function handleResend() {
    if (resendSecs > 0) return;
    try {
      setLoading(true);

      // 🔥 await forgotPassword({ email });
      await new Promise((r) => setTimeout(r, 1200));

      setResendSecs(60);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const emailError = touched && !isValidEmail(email);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="auth-page py-5">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />

      <div className="auth-wrap">

        {/* Logo */}
        <div className="auth-logo-wrap restore-logo-wrap">
          <div className="restore-logo"><BrainCircuit /></div>
          <span className="restore-brand">Hakeem</span>
          <p className="restore-subtitle">Password Recovery</p>
        </div>

        <div className="auth-card">

          {/* ══ SENT STATE ════════════════════════════════ */}
          {sent ? (
            <div style={{ textAlign:"center" }}>
              <div className="auth-sent-icon auth-sent-icon--mail" style={{ margin:"0 auto 1.1rem" }}>
                <Mail size={32} color="var(--primary)" strokeWidth={1.5} />
              </div>
              <div className="auth-sent-title">Check Your Inbox</div>
              <p className="auth-sent-sub">
                We sent a password reset link to{" "}
                <span className="auth-sent-email">{email}</span>.
                The link expires in 15 minutes.
              </p>

              <div className="auth-notice auth-notice--blue">
                Didn't receive the email? Check your spam folder or try resending.
              </div>

              {/* Resend */}
              <button
                className="auth-btn auth-btn--primary"
                onClick={handleResend}
                disabled={resendSecs > 0 || loading}
                style={{ opacity: resendSecs > 0 || loading ? .55 : 1 }}
              >
                {loading ? (
                  <><div className="auth-spinner" /> Sending…</>
                ) : resendSecs > 0 ? (
                  <><RefreshCw size={15} /> Resend in {resendSecs}s</>
                ) : (
                  <><RefreshCw size={15} /> Resend Email</>
                )}
              </button>

              {resendSecs > 0 && (
                <div className="auth-countdown">
                  You can resend in <span>{resendSecs}s</span>
                </div>
              )}

              <button className="auth-btn auth-btn--outline" onClick={() => navigate("/auth")}>
                <ArrowLeft size={15} /> Back to Login
              </button>
            </div>

          ) : (

          /* ══ FORM STATE ═══════════════════════════════ */
          <>
            <div className="auth-card-icon auth-card-icon--primary">
              <Mail size={26} color="var(--primary)" strokeWidth={1.8} />
            </div>
            <div className="auth-card-title">Forgot Password?</div>
            <p className="auth-card-sub">
              No worries! Enter your registered email and we'll send you a secure reset link.
            </p>

            {error && (
              <div className="auth-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input
                  ref={inputRef}
                  className={`auth-input ${emailError ? "auth-input--error" : ""}`}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onBlur={() => setTouched(true)}
                />
                {emailError && (
                  <span style={{ fontSize:".76rem", color:"var(--danger)", display:"flex", alignItems:"center", gap:".3rem", marginTop:".25rem" }}>
                    <AlertCircle size={12} /> Please enter a valid email address.
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={loading || (touched && !isValidEmail(email))}
                style={{ opacity: loading || (touched && !isValidEmail(email)) ? .55 : 1 }}
              >
                {loading ? (
                  <><div className="auth-spinner" /> Sending…</>
                ) : (
                  <><Send size={15} /> Send Reset Link</>
                )}
              </button>
            </form>

            <button className="auth-back" onClick={() => navigate("/auth")}>
              <ArrowLeft size={14} /> Back to Login
            </button>
          </>
          )}

        </div>
      </div>
    </div>
  );
}