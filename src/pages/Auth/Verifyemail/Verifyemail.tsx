import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../AuthPage/AuthPage.css";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("Checking token");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Invalid or missing verification data.");
        return;
      }
      try {
        setStep("Checking token");
        await new Promise((r) => setTimeout(r, 400));
        setStep("Confirming identity");
        await verifyEmail(token);
        setStep("Activating account");
        await new Promise((r) => setTimeout(r, 400));
        setStatus("success");
        setMessage("Your email has been verified. You can now sign in.");
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err?.response?.data?.message ||
            "Verification failed. The link may have expired or already been used.",
        );
      }
    }
    verify();
  }, [token]); // eslint-disable-line

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
      </nav>

      <main className="ap-main">
        <div className="ap-headline">
          <span className="ap-eyebrow">
            {status === "loading"
              ? "⏳ Verifying"
              : status === "success"
                ? "✓ Verified"
                : "✕ Failed"}
          </span>
          <h1 className="ap-title">
            {status === "loading"
              ? "Verifying your email"
              : status === "success"
                ? "Email verified!"
                : "Verification failed"}
          </h1>
          <p className="ap-subtitle">
            {status === "loading"
              ? "Please wait while we confirm your email address."
              : message}
          </p>
        </div>

        <div className="ap-card ap-card--sm">
          {/* ── LOADING ── */}
          {status === "loading" && (
            <div className="ap-callback-loading">
              <div className="ap-verify-spinner-wrap">
                <div className="ap-verify-spinner" />
              </div>
              <div className="ap-dots">
                <span />
                <span />
                <span />
              </div>
              <p className="ap-callback-sub">
                {step}… please don't close this window.
              </p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--success">✓</div>
              <p className="ap-state-hint">
                Your account is now active and ready to use.
              </p>
              <button
                className="ap-btn-primary"
                onClick={() => navigate("/auth")}
              >
                Sign In →
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--error">✕</div>
              <p className="ap-state-hint">{message}</p>
              <button
                className="ap-btn-primary"
                onClick={() => navigate("/auth")}
              >
                ← Back to Login
              </button>
              <button
                className="ap-btn-ghost"
                onClick={() => window.location.reload()}
              >
                ↺ Retry Verification
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
