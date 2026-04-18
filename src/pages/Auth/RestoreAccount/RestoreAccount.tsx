import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MailCheck,
  Clock,
  Inbox,
} from "lucide-react";
import "./auth-pages.css";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type RestoreStatus = "loading" | "success" | "error" | "expired";

/* ════════════════════════════════════════════════════════════
   STEP CONFIG
   The backend receives the token, finds the deactivated / deleted
   account, reactivates it, and restores all related data.
════════════════════════════════════════════════════════════ */
const STEPS = [
  "Validating restore link",
  "Locating your account",
  "Reactivating account",
  "Restoring your data",
];

/* ════════════════════════════════════════════════════════════
   COMPONENT
   Usage: /restore-account?token=<jwt>
   The token comes from the email the user requested via
   "Request Account Restoration" on the login page.
════════════════════════════════════════════════════════════ */
export default function RestoreAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<RestoreStatus>("loading");
  const [stepIdx, setStepIdx] = useState(0);
  const [message, setMessage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");

  /* ── Run on mount ───────────────────────────────────────── */
  useEffect(() => {
    async function restore() {
      if (token) {
        setStatus("error");
        setMessage(
          "No restore token found. Please use the link sent to your email, or request a new restoration email.",
        );
        return;
      }

      try {
        // Animate through steps for UX feedback
        for (let i = 0; i < STEPS.length; i++) {
          setStepIdx(i);
          await new Promise((r) => setTimeout(r, 750));
        }

        // 🔥 Replace with your real API call:
        // const { data } = await restoreAccount({ token });
        // setAccountEmail(data.email);

        // Demo
        setAccountEmail("user@example.com");
        setStatus("success");
        setMessage(
          "Your account is now active again. All your applications, profile data, and history have been fully restored.",
        );
      } catch (err: any) {
        // 410 Gone → link expired, anything else → generic error
        const isExpired = err?.response?.status === 410;
        setStatus(isExpired ? "expired" : "error");
        setMessage(
          isExpired
            ? "This restore link has expired. Restoration links are valid for 24 hours after they are sent."
            : "Account restoration failed. The link may have already been used or is invalid.",
        );
      }
    }

    restore();
  }, [token]);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />

      <div className="auth-wrap">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <div className="auth-logo">
            <BrainCircuit />
          </div>
          <span className="auth-brand">Hakeem</span>
          <p className="auth-subtitle">Account Restoration</p>
        </div>

        <div className="auth-card">
          {/* ══ LOADING ═══════════════════════════════════ */}
          {status === "loading" && (
            <div style={{ textAlign: "center" }}>
              {/* Progress steps */}
              <div className="auth-steps-strip">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`auth-step-chip ${
                      i < stepIdx
                        ? "auth-step-chip--done"
                        : i === stepIdx
                          ? "auth-step-chip--active"
                          : "auth-step-chip--idle"
                    }`}
                  >
                    {i < stepIdx && <CheckCircle size={11} />}
                    {s}
                  </span>
                ))}
              </div>

              <div
                className="auth-verify-icon auth-verify-icon--loading"
                style={{ margin: "0 auto 1rem" }}
              >
                <div className="auth-verify-spinner" />
              </div>

              <div
                className="auth-card-title"
                style={{ textAlign: "center", marginBottom: ".5rem" }}
              >
                Restoring Your Account
              </div>

              <div className="auth-dots">
                <span className="auth-dot" />
                <span className="auth-dot" />
                <span className="auth-dot" />
              </div>

              <p
                style={{
                  textAlign: "center",
                  fontSize: ".88rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                  marginTop: ".5rem",
                }}
              >
                {STEPS[stepIdx]}… please don't close this window.
              </p>
            </div>
          )}

          {/* ══ SUCCESS ═══════════════════════════════════ */}
          {status === "success" && (
            <div style={{ textAlign: "center" }}>
              <div
                className="auth-verify-icon auth-verify-icon--success"
                style={{ margin: "0 auto 1rem" }}
              >
                <ShieldCheck
                  size={40}
                  color="var(--success)"
                  strokeWidth={1.6}
                />
              </div>

              <div className="auth-card-title">Account Restored!</div>

              {/* What was restored */}
              <div
                className="auth-notice auth-notice--green"
                style={{ textAlign: "left", marginBottom: "1rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    marginBottom: ".45rem",
                  }}
                >
                  <MailCheck size={14} style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Account:</strong> {accountEmail}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: ".5rem",
                  }}
                >
                  <Inbox size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>
                    Your profile, applications, interviews, and all account data
                    have been fully restored.
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: ".86rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                  marginBottom: "1.4rem",
                }}
              >
                {message}
              </p>

              <button
                className="auth-btn auth-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={15} /> Sign In Now
              </button>
            </div>
          )}

          {/* ══ EXPIRED ═══════════════════════════════════ */}
          {status === "expired" && (
            <div style={{ textAlign: "center" }}>
              <div
                className="auth-verify-icon"
                style={{
                  margin: "0 auto 1rem",
                  background: "rgba(245,158,11,.1)",
                }}
              >
                <Clock size={38} color="var(--warning)" strokeWidth={1.6} />
              </div>

              <div className="auth-card-title">Restore Link Expired</div>

              <div
                className="auth-notice auth-notice--amber"
                style={{ textAlign: "left", marginBottom: "1rem" }}
              >
                <AlertCircle
                  size={14}
                  style={{
                    flexShrink: 0,
                    float: "left",
                    marginRight: ".5rem",
                    marginTop: 2,
                  }}
                />
                {message}
              </div>

              <p
                style={{
                  fontSize: ".84rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                  marginBottom: "1.4rem",
                }}
              >
                Please request a new account restoration email from the login
                page, or contact support if you need further help.
              </p>

              <button
                className="auth-btn auth-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={15} /> Back to Login
              </button>
              <button
                className="auth-btn auth-btn--outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          )}

          {/* ══ ERROR ═════════════════════════════════════ */}
          {status === "error" && (
            <div style={{ textAlign: "center" }}>
              <div
                className="auth-verify-icon auth-verify-icon--error"
                style={{ margin: "0 auto 1rem" }}
              >
                <XCircle size={40} color="var(--danger)" strokeWidth={1.6} />
              </div>

              <div className="auth-card-title">Restoration Failed</div>

              <div
                className="auth-notice auth-notice--amber"
                style={{ textAlign: "left", marginBottom: "1rem" }}
              >
                <AlertCircle
                  size={14}
                  style={{
                    flexShrink: 0,
                    float: "left",
                    marginRight: ".5rem",
                    marginTop: 2,
                  }}
                />
                {message}
              </div>

              <p
                style={{
                  fontSize: ".84rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                  marginBottom: "1.4rem",
                }}
              >
                If the problem persists, please contact our support team and
                we'll help restore your account manually.
              </p>

              <button
                className="auth-btn auth-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={15} /> Back to Login
              </button>
              <button
                className="auth-btn auth-btn--outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
