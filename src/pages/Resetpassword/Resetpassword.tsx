import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BrainCircuit,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import "./Resetpassword.css";
import { useAuth } from "../../contexts/AuthContext";

/* ════════════════════════════════════════════════════════════
   PASSWORD STRENGTH HELPER
════════════════════════════════════════════════════════════ */
function getStrength(pwd: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
  cls: string;
} {
  if (!pwd) return { level: 0, label: "", cls: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: "", cls: "" },
    { label: "Weak", cls: "weak" },
    { label: "Fair", cls: "fair" },
    { label: "Good", cls: "good" },
    { label: "Strong", cls: "strong" },
  ] as const;
  return { level: score as 0 | 1 | 2 | 3 | 4, ...map[score] };
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const { resetPassword } = useAuth();
  const token = searchParams.get("resetPasswordToken");
  const id = searchParams.get("id");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);

  const strength = getStrength(password);
  const passMatch = confirmPassword.length > 0 && password === confirmPassword;
  const misMatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = password.length >= 6 && passMatch && !loading;

  /* ── Validate token on mount ────────────────────────────── */
  useEffect(() => {
    if (!token || !id) setTokenError(true);
  }, [token, id]);

  /* ── Submit ─────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!id || !token) {
      setError("Invalid or expired reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(id, token, password);

      setSuccess(true);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Reset failed or link has expired. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="rp-page">
      {/* Blobs */}
      <div className="rp-blob rp-blob--1" />
      <div className="rp-blob rp-blob--2" />
      <div className="rp-blob rp-blob--3" />

      <div className="rp-wrap">
        {/* Logo */}
        <div className="rp-logo-wrap">
          <div className="rp-logo">
            <BrainCircuit />
          </div>
          <span className="rp-brand">Hakeem</span>
          <p className="rp-subtitle">Password Reset</p>
        </div>

        {/* Card */}
        <div className="rp-card">
          {/* ── INVALID TOKEN ── */}
          {tokenError ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div
                className="rp-success-icon"
                style={{
                  background: "rgba(239,68,68,.08)",
                  margin: "0 auto 1rem",
                }}
              >
                <XCircle size={36} color="var(--danger)" strokeWidth={1.8} />
              </div>
              <div className="rp-success-title">Invalid Reset Link</div>
              <p className="rp-success-sub">
                This link is invalid or has expired. Please request a new
                password reset.
              </p>
              <button
                className="rp-btn rp-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={15} /> Back to Login
              </button>
            </div>
          ) : /* ── SUCCESS ── */
          success ? (
            <div className="rp-success">
              <div className="rp-success-icon">
                <CheckCircle
                  size={36}
                  color="var(--success)"
                  strokeWidth={1.8}
                />
              </div>
              <div className="rp-success-title">Password Reset!</div>
              <p className="rp-success-sub">
                Your password has been updated successfully. You can now sign in
                with your new password.
              </p>
              <button
                className="rp-btn rp-btn--primary"
                onClick={() => navigate("/auth")}
              >
                <ArrowRight size={15} /> Go to Login
              </button>
            </div>
          ) : (
            /* ── FORM ── */
            <>
              <div className="rp-card-title">
                <Lock size={18} style={{ color: "var(--primary)" }} />
                Reset Password
              </div>
              <p className="rp-card-sub">
                Enter a strong new password for your account.
              </p>

              {/* Error */}
              {error && (
                <div className="rp-error">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New password */}
                <div className="rp-field">
                  <label className="rp-label">New Password</label>
                  <div className="rp-input-wrap">
                    <input
                      className={`rp-input ${error && password.length < 6 ? "rp-input--error" : ""}`}
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                    />
                    <button
                      type="button"
                      className="rp-eye"
                      onClick={() => setShowPass((v) => !v)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="rp-strength">
                      <div className="rp-strength-bars">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`rp-strength-bar ${n <= strength.level ? `rp-strength-bar--filled-${strength.cls}` : ""}`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <span
                          className={`rp-strength-label rp-strength-label--${strength.cls}`}
                        >
                          {strength.label} password
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="rp-field">
                  <label className="rp-label">Confirm Password</label>
                  <div className="rp-input-wrap">
                    <input
                      className={`rp-input ${misMatch ? "rp-input--error" : ""}`}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                    />
                    <button
                      type="button"
                      className="rp-eye"
                      onClick={() => setShowConfirm((v) => !v)}
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {passMatch && (
                    <div className="rp-match rp-match--ok">
                      <CheckCircle size={13} /> Passwords match
                    </div>
                  )}
                  {misMatch && (
                    <div className="rp-match rp-match--err">
                      <XCircle size={13} /> Passwords don't match
                    </div>
                  )}
                </div>

                {/* Password requirements */}
                {password.length > 0 && strength.level < 3 && (
                  <div
                    style={{
                      background: "rgba(79,70,229,.05)",
                      border: "1px solid rgba(79,70,229,.12)",
                      borderRadius: 10,
                      padding: ".7rem 1rem",
                      marginBottom: "1rem",
                      fontSize: ".78rem",
                      color: "var(--muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    <strong
                      style={{
                        color: "var(--text)",
                        display: "block",
                        marginBottom: ".2rem",
                      }}
                    >
                      Tip — strong passwords include:
                    </strong>
                    <span
                      style={{
                        color: /[A-Z]/.test(password)
                          ? "var(--success)"
                          : "inherit",
                      }}
                    >
                      ✓ Uppercase letter
                    </span>
                    {"  "}
                    <span
                      style={{
                        color: /[0-9]/.test(password)
                          ? "var(--success)"
                          : "inherit",
                      }}
                    >
                      ✓ Number
                    </span>
                    {"  "}
                    <span
                      style={{
                        color: /[^A-Za-z0-9]/.test(password)
                          ? "var(--success)"
                          : "inherit",
                      }}
                    >
                      ✓ Special character
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className="rp-btn rp-btn--primary"
                  disabled={!canSubmit}
                  style={{ opacity: canSubmit ? 1 : 0.5 }}
                >
                  {loading ? (
                    <>
                      <div className="rp-btn--spinner" /> Resetting…
                    </>
                  ) : (
                    <>
                      <Lock size={15} /> Reset Password
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
