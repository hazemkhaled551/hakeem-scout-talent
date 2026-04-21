import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import "../AuthPage/AuthPage.css";

type Status = "loading" | "success" | "error";

const STEPS = [
  "Verifying with Google",
  "Authenticating account",
  "Loading your profile",
];

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [stepIdx, setStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    async function handleCallback() {
      try {
        for (let i = 0; i < STEPS.length; i++) {
          setStepIdx(i);
          await new Promise((r) => setTimeout(r, 700));
        }

        const res = await api.post("/auth/getMe");
        const user = res.data.data.u;
        const token = res.data.data.accessToken;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        setStatus("success");
        await new Promise((r) => setTimeout(r, 600));

        if (user.role === "Applicant") window.location.href = "/dashboard";
        else if (user.role === "Company")
          window.location.href = "/company/dashboard";
        else window.location.href = `/auth/select-role?id=${user._id}`;
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.message ??
            "Authentication failed. Please try again or use a different sign-in method.",
        );
      }
    }

    handleCallback();
  }, []); // eslint-disable-line

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
              ? "⏳ Authenticating"
              : status === "success"
                ? "✓ Signed in"
                : "✕ Failed"}
          </span>
          <h1 className="ap-title">
            {status === "loading"
              ? "Signing you in…"
              : status === "success"
                ? "You're in!"
                : "Sign-in failed"}
          </h1>
          <p className="ap-subtitle">
            {status === "loading"
              ? "Please wait while we verify your Google account."
              : status === "success"
                ? "Redirecting you to your dashboard…"
                : "Something went wrong during authentication."}
          </p>
        </div>

        <div className="ap-card ap-card--sm">
          {/* ── LOADING ── */}
          {status === "loading" && (
            <div className="ap-callback-loading">
              {/* Google G + spinner ring */}
              <div className="ap-google-ring">
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  className="ap-ring-svg"
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke="rgba(91,80,240,.12)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke="var(--p)"
                    strokeWidth="3"
                    strokeDasharray="50 150"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="ap-google-g">
                  <GoogleG size={30} />
                </div>
              </div>

              {/* Step chips */}
              <div className="ap-step-chips">
                {STEPS.map((s, i) => (
                  <span
                    key={s}
                    className={`ap-step-chip ${
                      i < stepIdx ? "done" : i === stepIdx ? "active" : ""
                    }`}
                  >
                    {i < stepIdx ? "✓ " : i === stepIdx ? "◌ " : "○ "}
                    {s}
                  </span>
                ))}
              </div>

              <div className="ap-dots">
                <span />
                <span />
                <span />
              </div>
              <p className="ap-callback-sub">{STEPS[stepIdx]}… please wait.</p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--success">✓</div>
              <p className="ap-state-hint">Taking you to your dashboard now…</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--error">✕</div>
              <div
                className="ap-alert ap-alert--error"
                style={{ textAlign: "left" }}
              >
                <span className="ap-alert-icon">!</span>
                {errorMsg}
              </div>
              <button
                className="ap-btn-primary"
                onClick={() => navigate("/auth", { replace: true })}
              >
                ← Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Inline Google G SVG ── */
function GoogleG({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
