import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import "./Forgotpasswordpage.css";
import { useAuth } from "../../contexts/AuthContext";


export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const {forgetPassword} = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
    
      await forgetPassword(email);
      setSent(true);

    } catch (error: any) {
      setError(error?.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />

      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon">
            <BrainCircuit size={28} color="#fff" />
          </div>
          <span className="auth-logo__name">Hakeem</span>
        </div>

        <div className="auth-card">
          {/* Shimmer line on top */}
          <div className="auth-card__shimmer" />

          {sent ? (
            <div className="auth-success">
              <div className="auth-success__icon">
                <CheckCircle size={36} color="var(--success)" />
              </div>
              <h2 className="auth-success__title">Check your inbox</h2>
              <p className="auth-success__desc">
                If an account exists for <strong>{email}</strong>, a reset link
                has been sent.
              </p>
              <button
                className="btn btn--primary w-100"
                onClick={() => navigate("/auth")}
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
            </div>
          ) : (
            <>
              <div className="auth-card__header">
                <div className="auth-card__icon-wrap">
                  <Mail size={22} color="var(--primary)" />
                </div>
                <div>
                  <h2 className="auth-card__title">Forgot Password?</h2>
                  <p className="auth-card__desc">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail className="auth-input-icon" size={16} />
                    <input
                      type="email"
                      className={`auth-input ${error ? "auth-input--error" : ""}`}
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {error && <p className="auth-error">{error}</p>}
                </div>

                <button
                  type="submit"
                  className="btn btn--primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn__spinner" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>

                <button
                  type="button"
                  className="btn btn--ghost w-100"
                  onClick={() => navigate("/auth")}
                >
                  <ArrowLeft size={15} />
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
