import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "../AuthPage/AuthPage.css";

/* ── Password strength ── */
type StrengthLevel = 0 | 1 | 2 | 3 | 4;
interface Strength {
  level: StrengthLevel;
  label: string;
  cls: string;
}

function getStrength(pwd: string): Strength {
  if (!pwd) return { level: 0, label: "", cls: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: "", cls: "" },
    { label: "Weak", cls: "weak" },
    { label: "Fair", cls: "medium" },
    { label: "Good", cls: "medium" },
    { label: "Strong ✓", cls: "strong" },
  ] as const;
  return { level: score as StrengthLevel, ...map[score] };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);

  const strength = getStrength(password);
  const passMatch = confirm.length > 0 && password === confirm;
  const misMatch = confirm.length > 0 && password !== confirm;
  const canSubmit = password.length >= 6 && passMatch && !loading;

  useEffect(() => {
    if (!token) setTokenError(true);
  }, [token]);

  async function handleSubmit() {
    setError("");
    if (!token) {
      setError("Invalid or expired reset link.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Reset failed or link has expired. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  }

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
          <span className="ap-eyebrow">🔒 Secure Reset</span>
          <h1 className="ap-title">
            {tokenError
              ? "Invalid Link"
              : success
                ? "Password Updated!"
                : "Reset your password"}
          </h1>
          <p className="ap-subtitle">
            {tokenError
              ? "This link is invalid or has expired."
              : success
                ? "Your password has been updated. You can now sign in."
                : "Enter a strong new password for your Hakeem account."}
          </p>
        </div>

        <div className="ap-card ap-card--sm">
          {/* ── INVALID TOKEN ── */}
          {tokenError && (
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--error">✕</div>
              <p className="ap-state-hint">
                Please request a new password reset from the login page.
              </p>
              <button
                className="ap-btn-primary"
                onClick={() => navigate("/auth")}
              >
                ← Back to Login
              </button>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {!tokenError && success && (
            <div className="ap-state-block">
              <div className="ap-state-icon ap-state-icon--success">✓</div>
              <p className="ap-state-hint">
                You can now sign in with your new password.
              </p>
              <button
                className="ap-btn-primary"
                onClick={() => navigate("/auth")}
              >
                Sign In →
              </button>
            </div>
          )}

          {/* ── FORM ── */}
          {!tokenError && !success && (
            <div className="ap-form">
              {error && (
                <div className="ap-alert ap-alert--error">
                  <span className="ap-alert-icon">✕</span>
                  {error}
                </div>
              )}

              <div className="ap-grid">
                {/* New password */}
                <div className="ap-field ap-span-2">
                  <label className="ap-label">New Password</label>
                  <div className="ap-input-wrap">
                    <input
                      className="ap-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                    />
                    <button
                      type="button"
                      className="ap-eye"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  {password && (
                    <div className="ap-strength">
                      <div className="ap-strength-track">
                        <div
                          className={`ap-strength-bar ap-strength-bar--${strength.cls}`}
                          style={{ width: `${(strength.level / 4) * 100}%` }}
                        />
                      </div>
                      <span
                        className={`ap-strength-lbl ap-strength-lbl--${strength.cls}`}
                      >
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="ap-field ap-span-2">
                  <label className="ap-label">Confirm Password</label>
                  <div className="ap-input-wrap">
                    <input
                      className={`ap-input${misMatch ? " ap-input--err" : ""}`}
                      type={showCPw ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        setError("");
                      }}
                    />
                    <button
                      type="button"
                      className="ap-eye"
                      onClick={() => setShowCPw(!showCPw)}
                    >
                      {showCPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  {passMatch && (
                    <p className="ap-field-ok">✓ Passwords match</p>
                  )}
                  {misMatch && (
                    <p className="ap-field-err">Passwords do not match</p>
                  )}
                </div>
              </div>

              {/* Tips box */}
              {password && strength.level < 3 && (
                <div className="ap-tips-box">
                  <strong>Tip — strong passwords include:</strong>
                  <div className="ap-tips-row">
                    <span className={/[A-Z]/.test(password) ? "ok" : ""}>
                      ✓ Uppercase
                    </span>
                    <span className={/[0-9]/.test(password) ? "ok" : ""}>
                      ✓ Number
                    </span>
                    <span className={/[^A-Za-z0-9]/.test(password) ? "ok" : ""}>
                      ✓ Symbol
                    </span>
                  </div>
                </div>
              )}

              <button
                className="ap-btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{ opacity: canSubmit ? 1 : 0.55 }}
              >
                {loading ? (
                  <>
                    <span className="ap-spinner" /> Resetting…
                  </>
                ) : (
                  "Reset Password →"
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
