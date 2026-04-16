import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import "../RestoreAccount/auth-pages.css";
import api from "../../utils/api";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type CallbackStatus = "loading" | "success" | "error";

/* ════════════════════════════════════════════════════════════
   STEPS
════════════════════════════════════════════════════════════ */
const STEPS = [
  "Verifying with Google",
  "Authenticating account",
  "Loading your profile",
];

/* ════════════════════════════════════════════════════════════
   COMPONENT
   URL shape: /auth/google/callback?code=...&state=...
════════════════════════════════════════════════════════════ */
export default function GoogleCallback() {
  const navigate = useNavigate();

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [stepIdx, setStepIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const calledRef = useRef(false); // prevent double-fire in StrictMode

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    async function handleCallback() {
      try {
        /* Animate steps */
        for (let i = 0; i < STEPS.length; i++) {
          setStepIdx(i);
          await new Promise((r) => setTimeout(r, 700));
        }

        // 🔥 Replace with your real API call:
        const res = await api.post(`/auth/getMe`);

        console.log(res);

        const user = res.data.data.u;
        const token = res.data.data.accessToken;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        setStatus("success");
        // Demo — remove in production
        await new Promise((r) => setTimeout(r, 500));
        if (user.role === "Applicant") {
          window.location.href = "/dashboard";
        } else if (user.role === "Company") {
          window.location.href = "/company/dashboard";
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(
          err?.response?.data?.message ??
            "Authentication failed. Please try again or use a different sign-in method.",
        );
      }
    }

    handleCallback();
  }, []);
  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />

      <div className="auth-wrap">
        {/* Logo */}
        <div className="restore-logo-wrap">
          <div className="restore-logo">
            <BrainCircuit />
          </div>
          <span className="restore-brand">Hakeem</span>
          <p className="restore-subtitle">
            {status === "loading"
              ? "Signing you in…"
              : status === "success"
                ? "Almost there!"
                : "Sign-in failed"}
          </p>
        </div>

        <div className="auth-card" style={{ textAlign: "center" }}>
          {/* ══ LOADING ══ */}
          {status === "loading" && (
            <>
              {/* Google icon + spinner ring */}
              <div
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                  margin: "0 auto 1.2rem",
                }}
              >
                {/* spinner ring */}
                <svg
                  width="72"
                  height="72"
                  viewBox="0 0 72 72"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    animation: "spin .9s linear infinite",
                  }}
                >
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke="rgba(79,70,229,.15)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="32"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeDasharray="50 150"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Google G */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GoogleG size={32} />
                </div>
              </div>

              {/* Step chips */}
              <div
                className="auth-steps-strip"
                style={{ marginBottom: "1rem" }}
              >
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

              <div className="auth-dots" style={{ marginBottom: ".6rem" }}>
                <span className="auth-dot" />
                <span className="auth-dot" />
                <span className="auth-dot" />
              </div>

              <p
                style={{
                  fontSize: ".87rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {STEPS[stepIdx]}… please wait.
              </p>
            </>
          )}

          {/* ══ SUCCESS ══ */}
          {status === "success" && (
            <>
              <div
                className="auth-verify-icon auth-verify-icon--success"
                style={{ margin: "0 auto 1rem" }}
              >
                <CheckCircle
                  size={38}
                  color="var(--success)"
                  strokeWidth={1.8}
                />
              </div>
              <div
                className="auth-card-title"
                style={{ marginBottom: ".4rem" }}
              >
                Signed in!
              </div>
              <p style={{ fontSize: ".87rem", color: "var(--muted)" }}>
                Redirecting you to your dashboard…
              </p>
            </>
          )}

          {/* ══ ERROR ══ */}
          {status === "error" && (
            <>
              <div
                className="auth-verify-icon auth-verify-icon--error"
                style={{ margin: "0 auto 1rem" }}
              >
                <XCircle size={38} color="var(--danger)" strokeWidth={1.8} />
              </div>
              <div
                className="auth-card-title"
                style={{ marginBottom: ".5rem" }}
              >
                Sign-in Failed
              </div>

              <div
                className="auth-notice auth-notice--amber"
                style={{ textAlign: "left", marginBottom: "1.3rem" }}
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
                {errorMsg}
              </div>

              <button
                className="auth-btn auth-btn--primary"
                onClick={() => navigate("/auth", { replace: true })}
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   INLINE GOOGLE "G" SVG  (no external dep)
════════════════════════════════════════════════════════════ */
function GoogleG({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
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
