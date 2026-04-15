import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
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
  industry: IndustryName | ""; // 👈 جديد
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
  weak: "Weak password",
  medium: "Medium — add numbers or symbols",
  strong: "Strong password",
};

// ─── Left Panel Data ──────────────────────────────────────────────────────────
const statCards = [
  {
    iconClass: "auth-stat-icon--purple",
    icon: "AI",
    label: "AI matches processed today",
    value: "2,847 matches",
  },
  {
    iconClass: "auth-stat-icon--cyan",
    icon: "4m",
    label: "Average time-to-shortlist",
    value: "Under 4 minutes",
  },
  {
    iconClass: "auth-stat-icon--green",
    icon: "98%",
    label: "Bias-free hires this month",
    value: "98.6% clean",
  },
];

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

  // derived — safe to call here since it's just a pure function, no side effects
  const strength: Strength = getPasswordStrength(regForm.password);

  // ── Handlers ────────────────────────────────────────────────────────────────
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

      console.log(user);

      if (user?.role === "Applicant") {
        navigate("/dashboard");
      } else if (user?.role === "Company") {
        navigate("/company/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      setAlert({
        type: "error",
        msg: error.response?.data?.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ── BUG WAS HERE: validation block was sitting naked in the component body
  //    (outside any function), so React ran setAlert on every render → infinite loop.
  //    Fixed by wrapping everything inside handleRegisterSubmit. ─────────────────
  async function handleRegisterSubmit() {
    if (
      !regForm.fullName ||
      !regForm.email ||
      !regForm.phone ||
      !regForm.jobTitle ||
      !regForm.location ||
      !regForm.password ||
      !regForm.confirmPassword
    ) {
      setAlert({ type: "error", msg: "Please fill in all fields." });
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
        msg: res.data.message || "Account created successfully",
      });
    } catch (error: any) {
      setAlert({
        type: "error",
        msg: error?.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
      <aside className="auth-left">
        <div className="auth-left-blob auth-left-blob--1" />
        <div className="auth-left-blob auth-left-blob--2" />
        <div className="auth-left-blob auth-left-blob--3" />

        <div className="auth-logo">
          <div className="auth-logo-box">H</div>
          <span className="auth-logo-name">Hakeem</span>
        </div>

        <div className="auth-left-body">
          <h2 className="auth-left-title">
            Smarter Hiring
            <br />
            <span className="highlight">Starts Here</span>
          </h2>
          <p className="auth-left-sub">
            Join 180+ companies using Hakeem to find top talent faster — with
            zero bias and full transparency.
          </p>

          <div className="auth-stat-cards">
            {statCards.map((card, i) => (
              <div key={i} className="auth-stat-card">
                <div className={`auth-stat-icon ${card.iconClass}`}>
                  {card.icon}
                </div>
                <div>
                  <div className="auth-stat-label">{card.label}</div>
                  <div className="auth-stat-value">{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-left-quote">
          <p className="auth-quote-text">
            "Hakeem didn't just save us time — it helped us build a more diverse
            and talented team."
          </p>
          <div className="auth-quote-author">
            <div className="auth-quote-avatar">L</div>
            <div>
              <div className="auth-quote-name">Layla Hassan</div>
              <div className="auth-quote-role">Head of Talent, Noon</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
      <main className="auth-right">
        <div className="auth-form-wrapper">
          <a href="/" className="auth-back">
            ← Back to home
          </a>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => handleTabSwitch("login")}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => handleTabSwitch("register")}
            >
              Create Account
            </button>
          </div>

          {alert && (
            <div className={`auth-alert auth-alert--${alert.type}`}>
              <span>{alert.type === "error" ? "!" : "✓"}</span>
              {alert.msg}
            </div>
          )}

          {/* ── LOGIN FORM ──────────────────────────────────── */}
          {mode === "login" && (
            <div key="login">
              <h1 className="auth-form-title">Welcome back</h1>
              <p className="auth-form-sub">
                Sign in to your Hakeem account to continue.
              </p>

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@company.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="auth-pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="auth-options">
                <label className="auth-remember">
                  <input
                    type="checkbox"
                    checked={loginForm.remember}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, remember: e.target.checked })
                    }
                  />
                  Remember me
                </label>
                <div className="d-flex flex-column ">
                  <Link to="/forget-password" className="auth-forgot">
                    Forgot password?
                  </Link>
                  <Link to="/request-restore" className="auth-forgot">
                    Restore Email?
                  </Link>
                </div>
              </div>

              <button
                className="auth-submit"
                onClick={handleLoginSubmit}
                disabled={loading}
              >
                {loading && <span className="auth-spinner" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>

              <div className="auth-divider">or continue with</div>

              <div className="auth-socials">
                <button
                  type="button"
                  className="auth-social-btn"
                  onClick={googleLogin}
                >
                  Continue with Google
                </button>
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ───────────────────────────────── */}
          {mode === "register" && (
            <div key="register">
              <h1 className="auth-form-title">Create your account</h1>
              <p className="auth-form-sub">
                Start your 14-day free trial. No credit card required.
              </p>

              {/* Account type */}
              <div className="auth-type-select">
                <button
                  type="button"
                  className={`auth-type-btn ${regForm.type === "applicant" ? "active" : ""}`}
                  onClick={() => setRegForm({ ...regForm, type: "applicant" })}
                >
                  Applicant
                </button>
                <button
                  type="button"
                  className={`auth-type-btn ${regForm.type === "company" ? "active" : ""}`}
                  onClick={() => setRegForm({ ...regForm, type: "company" })}
                >
                  Company
                </button>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Sarah Johnson"
                      value={regForm.fullName}
                      onChange={(e) =>
                        setRegForm({ ...regForm, fullName: e.target.value })
                      }
                    />
                  </div>
                </div>
                {regForm.type === "applicant" && (
                  <div className="auth-field">
                    <label className="auth-label">Phone</label>
                    <div className="auth-input-wrap">
                      <input
                        className="auth-input"
                        type="tel"
                        placeholder="+20 10 0000 0000"
                        value={regForm.phone}
                        onChange={(e) =>
                          setRegForm({ ...regForm, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-label">Email address</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="you@company.com"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({ ...regForm, email: e.target.value })
                    }
                  />
                </div>
              </div>

              {regForm.type === "applicant" && (
                <div className="auth-field">
                  <label className="auth-label">Industry</label>
                  <div className="auth-input-wrap">
                    <select
                      className="auth-input"
                      value={regForm.industry}
                      onChange={(e) =>
                        setRegForm({
                          ...regForm,
                          industry: e.target.value as IndustryName,
                        })
                      }
                    >
                      <option value="" disabled>
                        Select industry
                      </option>
                      {Object.values(IndustryName).map((industry) => (
                        <option key={industry} value={industry}>
                          {industry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="auth-row">
                {regForm.type === "applicant" && (
                  <div className="auth-field">
                    <label className="auth-label">Job Title</label>
                    <div className="auth-input-wrap">
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="Frontend Developer"
                        value={regForm.jobTitle}
                        onChange={(e) =>
                          setRegForm({ ...regForm, jobTitle: e.target.value })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="auth-field">
                  <label className="auth-label">Location</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Cairo, Egypt"
                      value={regForm.location}
                      onChange={(e) =>
                        setRegForm({ ...regForm, location: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  LinkedIn URL <span className="auth-optional">(optional)</span>
                </label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={regForm.linkedin}
                    onChange={(e) =>
                      setRegForm({ ...regForm, linkedin: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="auth-row">
                <div className="auth-field">
                  <label className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <input
                      className="auth-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Create a password"
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm({ ...regForm, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  {regForm.password && (
                    <div className="auth-strength">
                      <div className="auth-strength-bar">
                        <div
                          className={`auth-strength-fill auth-strength-fill--${strength}`}
                        />
                      </div>
                      <span className="auth-strength-label">
                        {strengthLabel[strength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrap">
                    <input
                      className={`auth-input ${
                        regForm.confirmPassword &&
                        regForm.confirmPassword !== regForm.password
                          ? "error"
                          : ""
                      }`}
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
                      className="auth-pw-toggle"
                      onClick={() => setShowCPw(!showCPw)}
                    >
                      {showCPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  {regForm.confirmPassword &&
                    regForm.confirmPassword !== regForm.password && (
                      <p className="auth-error-msg">Passwords do not match</p>
                    )}
                </div>
              </div>

              <button
                className="auth-submit"
                onClick={handleRegisterSubmit}
                disabled={loading}
              >
                {loading && <span className="auth-spinner" />}
                {loading ? "Creating account…" : "Create Free Account"}
              </button>

              <p className="auth-terms">
                By creating an account you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
