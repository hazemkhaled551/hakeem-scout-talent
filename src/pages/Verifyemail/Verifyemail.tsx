import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BrainCircuit,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import "./VerifyEmail.css";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type VerifyStatus = "loading" | "success" | "error";

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Verifying your email address…");
  const [step, setStep] = useState("Checking token");

  /* ── API call ──────────────────────────────────────────── */
  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification token.");
        return;
      }

      try {
        // Animate steps for UX
        setStep("Checking token");
        await new Promise((r) => setTimeout(r, 600));
        setStep("Confirming identity");
        await new Promise((r) => setTimeout(r, 700));
        setStep("Activating account");
        await new Promise((r) => setTimeout(r, 600));

        // 🔥 Replace with your real API call:
        // await verifyEmail({ token });

        setStatus("success");
        setMessage(
          "Your email has been verified successfully. You can now sign in.",
        );
      } catch {
        setStatus("error");
        setMessage(
          "Verification failed. The link may have expired or already been used.",
        );
      }
    }

    verify();
  }, [token]);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="vf-page">
      {/* Background blobs */}
      <div className="vf-blob vf-blob--1" />
      <div className="vf-blob vf-blob--2" />
      <div className="vf-blob vf-blob--3" />

      <div className="vf-wrap">
        {/* Logo */}
        <div className="vf-logo-wrap">
          <div className="vf-logo">
            <BrainCircuit />
          </div>
          <span className="vf-brand">Hakeem</span>
          <p className="vf-subtitle">Email Verification</p>
        </div>

        {/* Card */}
        <div className="vf-card">
          {/* ── LOADING ── */}
          {status === "loading" && (
            <>
              <div className="vf-icon-wrap vf-icon-wrap--loading">
                <div className="vf-spinner" />
              </div>
              <h2 className="vf-title">Verifying Your Account</h2>
              <div className="vf-dots">
                <span className="vf-dot" />
                <span className="vf-dot" />
                <span className="vf-dot" />
              </div>
              <span className="vf-step">{step}…</span>
              <p className="vf-msg">
                Please wait while we confirm your email address.
              </p>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <>
              <div className="vf-icon-wrap vf-icon-wrap--success">
                <CheckCircle
                  size={40}
                  color="var(--success)"
                  strokeWidth={1.8}
                />
              </div>
              <h2 className="vf-title">Email Verified!</h2>
              <p className="vf-msg vf-msg--success">{message}</p>
              <button
                className="vf-btn vf-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={16} /> Go to Login
              </button>
            </>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <>
              <div className="vf-icon-wrap vf-icon-wrap--error">
                <XCircle size={40} color="var(--danger)" strokeWidth={1.8} />
              </div>
              <h2 className="vf-title">Verification Failed</h2>
              <p className="vf-msg vf-msg--error">{message}</p>
              <button
                className="vf-btn vf-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={16} /> Back to Login
              </button>
              <div className="vf-divider">or</div>
              <button
                className="vf-btn vf-btn--outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={15} /> Retry Verification
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
