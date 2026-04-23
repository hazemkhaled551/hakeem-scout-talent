import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import "./SelectRolePage.css";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "Applicant" | "Company" | null;
type Step = 1 | 2;

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

interface ExtraForm {
  phone: string;
  jobTitle: string;
  location: string;
  linkedin: string;
  industry: IndustryName | "";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SelectRolePage() {
  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "";
  const { selectRole } = useAuth();

  const [form, setForm] = useState<ExtraForm>({
    phone: "",
    jobTitle: "",
    location: "",
    linkedin: "",
    industry: "",
  });

  // Step 1 → 2
  function handleRoleContinue() {
    if (!selected) return;
    setError(null);
    setStep(2);
  }

  // Final submit
  async function handleSubmit() {
    if (!form.location) {
      setError("Location is required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const payload: any = {
        role: selected,
        location: form.location,
        linkedIn_profile: form.linkedin,
      };

      if (selected === "Applicant") {
        payload.applicant = {
          phone: form.phone,
          job_title: form.jobTitle,
          industry: form.industry,
        };
      }

      const res = await selectRole(id, payload);
      const user = res.data.user;
      const token = res.data.accessToken;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (user.role === "Applicant") navigate("/dashboard");
      else if (user.role === "Company") navigate("/company/dashboard");
    } catch (e: any) {
      setError(
        e?.response?.data?.message || "Something went wrong, please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sr-root">
      {/* Background */}
      <div className="sr-bg">
        <div className="sr-orb sr-orb--1" />
        <div className="sr-orb sr-orb--2" />
        <div className="sr-orb sr-orb--3" />
        <div className="sr-orb sr-orb--4" />
        <div className="sr-mesh" />
      </div>

      {/* Nav */}
      <nav className="sr-nav">
        <a href="/" className="sr-logo">
          <div className="sr-logo-icon">H</div>
          <span className="sr-logo-name">Hakeem</span>
        </a>
        <div className="sr-steps">
          <div className={`sr-step ${step >= 1 ? "done" : ""}`}>
            <span>1</span> Role
          </div>
          <div className="sr-step-line" />
          <div className={`sr-step ${step >= 2 ? "done" : ""}`}>
            <span>2</span> Details
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="sr-main">
        {/* Headline */}
        <div className="sr-headline">
          <span className="sr-eyebrow">✦ Almost there</span>
          <h1 className="sr-title">
            {step === 1 ? "How will you use Hakeem?" : "Complete your profile"}
          </h1>
          <p className="sr-subtitle">
            {step === 1
              ? "Choose your role to get started. You can update this later."
              : selected === "Applicant"
                ? "A few more details to personalize your experience."
                : "Tell us a bit about your company."}
          </p>
        </div>

        {/* Card */}
        <div className="sr-card">
          {/* Progress bar */}
          <div className="sr-progress">
            <div
              className="sr-progress-fill"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="sr-alert">
              <span className="sr-alert-icon">✕</span>
              {error}
            </div>
          )}

          {/* ── STEP 1: Role ── */}
          {step === 1 && (
            <div className="sr-form" key="step1">
              <div className="sr-role-grid">
                <button
                  className={`sr-role-card ${selected === "Applicant" ? "active" : ""}`}
                  onClick={() => setSelected("Applicant")}
                >
                  {selected === "Applicant" && (
                    <span className="sr-role-check">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  <span className="sr-role-badge">Most Popular</span>
                  {/* <div className="sr-role-emoji">👤</div> */}
                  <strong className="sr-role-label">Applicant</strong>
                  <p className="sr-role-desc">
                    Find opportunities, build your profile, and land your next
                    role
                  </p>
                </button>

                <button
                  className={`sr-role-card ${selected === "Company" ? "active" : ""}`}
                  onClick={() => setSelected("Company")}
                >
                  {selected === "Company" && (
                    <span className="sr-role-check">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                  {/* <div className="sr-role-emoji">🏢</div> */}
                  <strong className="sr-role-label ">Company</strong>
                  <p className="sr-role-desc">
                    Post jobs, review candidates, and grow your team with AI
                  </p>
                </button>
              </div>

              <button
                className="sr-btn-primary"
                onClick={handleRoleContinue}
                disabled={!selected}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2: Details ── */}
          {step === 2 && (
            <div className="sr-form" key="step2">
              <div className="sr-grid">
                {/* Location — always */}
                <div
                  className={`sr-field ${selected === "Company" ? "sr-span-2" : ""}`}
                >
                  <label className="sr-label">
                    Location <em className="sr-req">*</em>
                  </label>
                  <input
                    className="sr-input"
                    type="text"
                    placeholder="Cairo, Egypt"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>

                {/* Applicant-only fields */}
                {selected === "Applicant" && (
                  <>
                    <div className="sr-field">
                      <label className="sr-label">Phone</label>
                      <input
                        className="sr-input"
                        type="tel"
                        placeholder="+20 10 0000 0000"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="sr-field">
                      <label className="sr-label">Industry</label>
                      <div className="sr-input-wrap">
                        <select
                          className="sr-input sr-select"
                          value={form.industry}
                          onChange={(e) =>
                            setForm({
                              ...form,
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

                    <div className="sr-field">
                      <label className="sr-label">Job Title</label>
                      <input
                        className="sr-input"
                        type="text"
                        placeholder="Frontend Developer"
                        value={form.jobTitle}
                        onChange={(e) =>
                          setForm({ ...form, jobTitle: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                {/* LinkedIn — always */}
                <div
                  className={`sr-field ${selected === "Company" ? "sr-span-2" : ""}`}
                >
                  <label className="sr-label">
                    LinkedIn URL <span className="sr-opt">(optional)</span>
                  </label>
                  <input
                    className="sr-input"
                    type="url"
                    placeholder="https://linkedin.com/in/yourname"
                    value={form.linkedin}
                    onChange={(e) =>
                      setForm({ ...form, linkedin: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="sr-btn-row">
                <button
                  className="sr-btn-secondary"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  ← Back
                </button>
                <button
                  className="sr-btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="sr-spinner" /> Setting up…
                    </>
                  ) : (
                    "Finish & Enter →"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trust */}
        <div className="sr-trust">
          <span>🔒 SSL Secured</span>
          <span className="sr-dot" />
          <span>✦ 180+ companies</span>
          <span className="sr-dot" />
          <span>◈ Free to start</span>
        </div>
      </main>
    </div>
  );
}
