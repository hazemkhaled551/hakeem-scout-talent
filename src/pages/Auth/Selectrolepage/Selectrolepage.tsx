import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BrainCircuit,
  UserSearch,
  Building2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import "../Forgotpasswordpage/Forgotpasswordpage.css";
import { useAuth } from "../../../contexts/AuthContext";

type Role = "Applicant" | "Company" | null;

const roles = [
  {
    id: "Applicant" as Role,
    icon: UserSearch,
    label: "Applicant",
    desc: "Find opportunities, build your profile, and land your next role",
    badge: "Most Popular",
  },
  {
    id: "Company" as Role,
    icon: Building2,
    label: "Company",
    desc: "Post jobs, review candidates, and grow your team with AI",
    badge: null,
  },
];

export default function SelectRolePage() {
  const [selected, setSelected] = useState<Role>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  const { selectRole } = useAuth();

  const handleContinue = async () => {
    if (!selected) return;
    try {
      console.log(selected);

      setLoading(true);
      const res = await selectRole(id, selected);
      console.log(res);

      const user = res.data.user;
      const token = res.data.accessToken;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (user.role === "Applicant") {
        window.location.href = "/dashboard";
      } else if (user.role === "Company") {
        window.location.href = "/company/dashboard";
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
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
          <div className="auth-card__shimmer" />

          <div className="auth-card__header">
            <div className="auth-card__icon-wrap">
              <Sparkles size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 className="auth-card__title">Choose your role</h2>
              <p className="auth-card__desc">
                Select how you'll be using Hakeem
              </p>
            </div>
          </div>

          <div className="role-grid">
            {roles.map(({ id, icon: Icon, label, desc, badge }) => (
              <button
                key={id}
                className={`role-card ${selected === id ? "role-card--active" : ""}`}
                onClick={() => setSelected(id)}
              >
                {badge && <span className="role-card__badge">{badge}</span>}

                <div className="role-card__icon">
                  <Icon size={28} />
                </div>
                <div className="role-card__body">
                  <span className="role-card__label">{label}</span>
                  <span className="role-card__desc">{desc}</span>
                </div>

                <div
                  className={`role-card__check ${selected === id ? "role-card__check--visible" : ""}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7l4 4 6-6"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <button
            className="btn btn--primary w-100"
            disabled={!selected || loading}
            onClick={handleContinue}
          >
            {loading ? (
              <span className="btn__spinner" />
            ) : (
              <>
                Continue
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
