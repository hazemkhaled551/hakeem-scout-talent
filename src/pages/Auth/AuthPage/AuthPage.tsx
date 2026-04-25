import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "./AuthPage.css";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabMode = "login" | "register";
type Strength = "weak" | "medium" | "strong" | "";

const IndustryName = {
  SOFTWARE_DEVELOPMENT: "Software Development",
  ARTIFICIAL_INTELLIGENCE: "Artificial Intelligence & Machine Learning",
  DATA_SCIENCE: "Data Science & Big Data",
  CYBERSECURITY: "Cybersecurity",
  CLOUD_COMPUTING: "Cloud Computing",
  NETWORKING: "Networking & Infrastructure",
  EMBEDDED_SYSTEMS: "Embedded Systems & IoT",
  GAME_DEVELOPMENT: "Game Development",
  UI_UX_DESIGN: "UI/UX Design",
  BLOCKCHAIN: "Blockchain & FinTech",
  AR_VR: "AR / VR (Augmented & Virtual Reality)",
  HARDWARE: "Hardware & Electronics",
} as const;
type IndustryName = (typeof IndustryName)[keyof typeof IndustryName];

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  location: string;
  linkedin: string;
  industry: IndustryName | "";
  password: string;
  confirmPassword: string;
  type: "applicant" | "company";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPasswordStrength(pw: string): Strength {
  if (!pw) return "";
  if (pw.length < 6) return "weak";
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (pw.length >= 8 && score >= 2) return "strong";
  return "medium";
}

const strengthLabel: Record<Strength, string> = {
  "": "",
  weak: "Weak",
  medium: "Medium",
  strong: "Strong ✓",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState<TabMode>("login");
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    msg: string;
  } | null>(null);

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });

  const [regForm, setRegForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    phone: "",
    jobTitle: "",
    location: "",
    linkedin: "",
    password: "",
    industry: "",
    confirmPassword: "",
    type: "applicant",
  });

  const strength: Strength = getPasswordStrength(regForm.password);

  function handleTabSwitch(t: TabMode) {
    setMode(t);
    setAlert(null);
  }

  async function handleLoginSubmit() {
    if (!loginForm.email || !loginForm.password) {
      setAlert({ type: "error", msg: "Please fill in all fields." });
      return;
    }
    try {
      setLoading(true);
      setAlert(null);
      const user = await login(
        loginForm.email,
        loginForm.password,
        loginForm.remember,
      );
      if (user?.role === "Applicant") navigate("/dashboard");
      else if (user?.role === "Company") navigate("/company/dashboard");
      else if (user?.role === "Admin") navigate("/admin");
    } catch (error: any) {
      setAlert({
        type: "error",
        msg: error?.response?.data?.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit() {
    if (
      !regForm.fullName ||
      !regForm.email ||
      !regForm.location ||
      !regForm.password ||
      !regForm.confirmPassword
    ) {
      setAlert({ type: "error", msg: "Please fill in all required fields." });
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setAlert({ type: "error", msg: "Passwords do not match." });
      return;
    }
    try {
      setLoading(true);
      setAlert(null);
      const payload =
        regForm.type === "applicant"
          ? {
              name: regForm.fullName,
              email: regForm.email,
              password: regForm.password,
              location: regForm.location,
              linkedIn_profile: regForm.linkedin,
              role: "Applicant",
              applicant: {
                phone: regForm.phone,
                job_title: regForm.jobTitle,
                industry: regForm.industry,
              },
            }
          : {
              name: regForm.fullName,
              email: regForm.email,
              password: regForm.password,
              location: regForm.location,
              linkedIn_profile: regForm.linkedin,
              role: "Company",
            };

      const res = await register(payload);
      setAlert({
        type: "success",
        msg: res.data.message || "Account created successfully!",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        msg:
          error?.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ap-root">
      {/* ── Animated background ── */}
      <div className="ap-bg">
        <div className="ap-orb ap-orb--1" />
        <div className="ap-orb ap-orb--2" />
        <div className="ap-orb ap-orb--3" />
        <div className="ap-orb ap-orb--4" />
        <div className="ap-mesh" />
      </div>

      {/* ── Top nav ── */}
      <nav className="ap-nav">
        <a href="/" className="ap-logo">
          <div className="ap-logo-icon">H</div>
          <span className="ap-logo-name">Hakeem</span>
        </a>
        <a href="/" className="ap-nav-back">
          ← Back to home
        </a>
      </nav>

      {/* ── Main ── */}
      <main className="ap-main">
        {/* Eyebrow + headline */}
        <div className="ap-headline">
          <span className="ap-eyebrow">✦ AI-Powered Hiring</span>
          <h1 className="ap-title">
            {mode === "login" ? "Welcome back" : "Get started for free"}
          </h1>
          <p className="ap-subtitle">
            {mode === "login"
              ? "Sign in to continue building smarter teams with Hakeem."
              : "Join 180+ companies hiring faster, fairer, and smarter."}
          </p>
        </div>

        {/* ── Card ── */}
        <div className="ap-card">
          {/* Tabs */}
          <div className="ap-tabs">
            <button
              className={`ap-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => handleTabSwitch("login")}
            >
              Sign In
            </button>
            <button
              className={`ap-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => handleTabSwitch("register")}
            >
              Create Account
            </button>
            <div
              className={`ap-tab-indicator ${mode === "register" ? "right" : ""}`}
            />
          </div>

          {/* Alert */}
          {alert && (
            <div className={`ap-alert ap-alert--${alert.type}`}>
              <span className="ap-alert-icon">
                {alert.type === "error" ? "✕" : "✓"}
              </span>
              {alert.msg}
            </div>
          )}

          {/* ══ LOGIN FORM ══ */}
          {mode === "login" && (
            <div className="ap-form" key="login">
              <div className="ap-grid">
                <div className="ap-field ap-span-2">
                  <label className="ap-label">Email address</label>
                  <input
                    className="ap-input"
                    type="email"
                    placeholder="you@company.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="ap-field ap-span-2">
                  <label className="ap-label">Password</label>
                  <div className="ap-input-wrap">
                    <input
                      className="ap-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="ap-eye"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="ap-row-between">
                <label className="ap-check">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, remember: e.target.checked })
                    }
                  />
                  Remember me
                </label>
                <div className="ap-links">
                  <Link to="/forget-password" className="ap-link">
                    Forgot password?
                  </Link>
                  <Link to="/request-restore" className="ap-link">
                    Restore email?
                  </Link>
                </div>
              </div>

              <button
                className="ap-btn-primary"
                onClick={handleLoginSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ap-spinner" /> Signing in…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>

              <div className="ap-or">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="ap-btn-google"
                onClick={googleLogin}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {/* ══ REGISTER FORM ══ */}
          {mode === "register" && (
            <div className="ap-form" key="register">
              {/* Type selector */}
              <div className="ap-type-row">
                <button
                  type="button"
                  className={`ap-type-card ${regForm.type === "applicant" ? "active" : ""}`}
                  onClick={() => setRegForm({ ...regForm, type: "applicant" })}
                >
                  {/* <span className="ap-type-emoji">👤</span> */}
                  <strong>Applicant</strong>
                  <span>Looking for a job</span>
                </button>
                <button
                  type="button"
                  className={`ap-type-card ${regForm.type === "company" ? "active" : ""}`}
                  onClick={() => setRegForm({ ...regForm, type: "company" })}
                >
                  {/* <span className="ap-type-emoji">🏢</span> */}
                  <strong>Company</strong>
                  <span>Hiring talent</span>
                </button>
              </div>

              <div className="ap-grid">
                {/* Name */}
                <div className="ap-field">
                  <label className="ap-label">
                    Full Name <em className="ap-req">*</em>
                  </label>
                  <input
                    className="ap-input"
                    type="text"
                    placeholder="Sarah Johnson"
                    value={regForm.fullName}
                    onChange={(e) =>
                      setRegForm({ ...regForm, fullName: e.target.value })
                    }
                  />
                </div>

                {/* Phone / Location depending on type */}
                {regForm.type === "applicant" ? (
                  <div className="ap-field">
                    <label className="ap-label">Phone</label>
                    <input
                      className="ap-input"
                      type="tel"
                      placeholder="+20 10 0000 0000"
                      value={regForm.phone}
                      onChange={(e) =>
                        setRegForm({ ...regForm, phone: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <div className="ap-field">
                    <label className="ap-label">
                      Location <em className="ap-req">*</em>
                    </label>
                    <input
                      className="ap-input"
                      type="text"
                      placeholder="Cairo, Egypt"
                      value={regForm.location}
                      onChange={(e) =>
                        setRegForm({ ...regForm, location: e.target.value })
                      }
                    />
                  </div>
                )}

                {/* Email */}
                <div className="ap-field ap-span-2">
                  <label className="ap-label">
                    Email address <em className="ap-req">*</em>
                  </label>
                  <input
                    className="ap-input"
                    type="email"
                    placeholder="you@company.com"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({ ...regForm, email: e.target.value })
                    }
                  />
                </div>

                {/* Applicant-only fields */}
                {regForm.type === "applicant" && (
                  <>
                    <div className="ap-field">
                      <label className="ap-label">Industry</label>
                      <div className="ap-input-wrap">
                        <select
                          className="ap-input ap-select"
                          value={regForm.industry}
                          onChange={(e) =>
                            setRegForm({
                              ...regForm,
                              industry: e.target.value as IndustryName,
                            })
                          }
                        >
                          <option value="" disabled>
                            Select your industry
                          </option>
                          {Object.values(IndustryName).map((ind) => (
                            <option key={ind} value={ind}>
                              {ind}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">Job Title</label>
                      <input
                        className="ap-input"
                        type="text"
                        placeholder="Frontend Developer"
                        value={regForm.jobTitle}
                        onChange={(e) =>
                          setRegForm({ ...regForm, jobTitle: e.target.value })
                        }
                      />
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">
                        Location <em className="ap-req">*</em>
                      </label>
                      <input
                        className="ap-input"
                        type="text"
                        placeholder="Cairo, Egypt"
                        value={regForm.location}
                        onChange={(e) =>
                          setRegForm({ ...regForm, location: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* LinkedIn */}
                <div
                  className={`ap-field ${regForm.type === "company" ? "ap-span-2" : ""}`}
                >
                  <label className="ap-label">
                    LinkedIn URL <span className="ap-opt">(optional)</span>
                  </label>
                  <input
                    className="ap-input"
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={regForm.linkedin}
                    onChange={(e) =>
                      setRegForm({ ...regForm, linkedin: e.target.value })
                    }
                  />
                </div>

                {/* Password */}
                <div className="ap-field">
                  <label className="ap-label">
                    Password <em className="ap-req">*</em>
                  </label>
                  <div className="ap-input-wrap">
                    <input
                      className="ap-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Create a password"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm({ ...regForm, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="ap-eye"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  {regForm.password && (
                    <div className="ap-strength">
                      <div className="ap-strength-track">
                        <div
                          className={`ap-strength-bar ap-strength-bar--${strength}`}
                        />
                      </div>
                      <span
                        className={`ap-strength-lbl ap-strength-lbl--${strength}`}
                      >
                        {strengthLabel[strength]}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="ap-field">
                  <label className="ap-label">
                    Confirm Password <em className="ap-req">*</em>
                  </label>
                  <div className="ap-input-wrap">
                    <input
                      className={`ap-input${regForm.confirmPassword && regForm.confirmPassword !== regForm.password ? " ap-input--err" : ""}`}
                      type={showCPw ? "text" : "password"}
                      placeholder="Repeat password"
                      value={regForm.confirmPassword}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      className="ap-eye"
                      onClick={() => setShowCPw(!showCPw)}
                    >
                      {showCPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  {regForm.confirmPassword &&
                    regForm.confirmPassword !== regForm.password && (
                      <p className="ap-field-err">Passwords do not match</p>
                    )}
                </div>
              </div>

              <button
                className="ap-btn-primary"
                onClick={handleRegisterSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="ap-spinner" /> Creating account…
                  </>
                ) : (
                  "Create Free Account →"
                )}
              </button>

              <p className="ap-terms">
                By creating an account you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>

        {/* Trust row */}
        <div className="ap-trust">
          <span>🔒 SSL Secured</span>
          <span className="ap-dot" />
          <span>✦ 2,800+ daily matches</span>
          <span className="ap-dot" />
          <span>◈ 98.6% bias-free</span>
        </div>
      </main>
    </div>
  );
}
