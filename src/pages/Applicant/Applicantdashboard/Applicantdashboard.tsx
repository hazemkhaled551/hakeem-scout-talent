import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Clock,
  TrendingUp,
  BrainCircuit,
  MapPin,
  Calendar,
  ChevronRight,
  Video,
  ClipboardList,
  Sparkles,
  Building2,
  DollarSign,
  Star,
} from "lucide-react";
import "./Applicantdashboard.css";
// import { useUser } from "../../contexts/UserContext";
import Loader from "../../../components/Loader";
import {
  getDashboardStats,
  getApplicantJobs,
} from "../../../services/userService";
import { formatDate } from "../../../utils/format";
import ApplicantNavbar from "../../../components/ApplicantNavbar";
import { recommendJobs } from "../../../services/jobService";

// ─── Mock AI Suggestions (3 only) ─────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusBadge(status: string) {
  switch (status) {
    case "interview":
      return "dk-badge dk-badge--interview";
    case "New":
      return "dk-badge dk-badge--review";
    case "Rejected":
      return "dk-badge dk-badge--rejected";
    case "Offered":
      return "dk-badge dk-badge--green";
    default:
      return "dk-badge dk-badge--default";
  }
}

function scoreGradient(score: number) {
  if (score >= 0.65)
    return "linear-gradient(90deg,var(--success,#10b981),#059669)";
  if (score >= 0.4)
    return "linear-gradient(90deg,var(--warning,#f59e0b),#d97706)";
  return "linear-gradient(90deg,var(--accent,#06b6d4),#0891b2)";
}
function scoreText(score: number) {
  if (score >= 0.65) return "var(--success,#10b981)";
  if (score >= 0.4) return "var(--warning,#f59e0b)";
  return "var(--accent,#06b6d4)";
}
function pct(v: number) {
  return Math.round(v * 100);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;

  console.log(user);

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<any>({});
  const [apps, setApps] = useState<any[]>([]);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  // const [completion, setCompletion] = useState<any>({});

  async function loadDashboard() {
    try {
      const statsData = await getDashboardStats();

      setStats(statsData.data.data);
      const appsData = await getApplicantJobs();
      console.log(appsData.data.data);

      setApps(appsData.data.data);
      const { data } = await recommendJobs();
      setAISuggestions(data.data.recommendation ?? []);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return <Loader fullPage text="Loading dashboard..." />;
  }
  return (
    <div className="dk-page">
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <ApplicantNavbar />

      {/* ══ MAIN ════════════════════════════════════════════════ */}
      <main className="dk-main">
        {/* Welcome */}
        <div className="mb-4 anim-fade-up">
          <h1 className="dk-welcome-title">Welcome Back, {user?.name}</h1>
          <p className="dk-welcome-sub">
            Track your applications and complete your profile
          </p>
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-3 anim-fade-up delay-2">
          <span className="dk-section-title">Statistics</span>
          <span className="dk-section-meta">Last 3 months</span>
        </div>

        <div className="row g-3 mb-4">
          {[
            {
              label: "Total Applications",
              value: stats.totalApplicant,
              hint: "Total jobs applied",
              icon: <Briefcase size={16} />,
              iconClass: "dk-stat-icon--gray",
              numClass: "dk-stat-num--default",
              cardClass: "dk-stat-card--gray",
            },
            {
              label: "In Review",
              value: stats.inReview,
              hint: "Pending decision",
              icon: <Clock size={16} />,
              iconClass: "dk-stat-icon--blue",
              numClass: "dk-stat-num--blue",
              cardClass: "dk-stat-card--blue",
            },
            {
              label: "Interviews",
              value: stats.interview,
              hint: "Scheduled",
              icon: <TrendingUp size={16} />,
              iconClass: "dk-stat-icon--green",
              numClass: "dk-stat-num--green",
              cardClass: "dk-stat-card--green",
            },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-4">
              <div
                className={`dk-card dk-stat-card ${s.cardClass} anim-count-up delay-${i + 2}`}
              >
                <div className="dk-card-body">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="dk-stat-label">{s.label}</span>
                    <div className={`dk-stat-icon ${s.iconClass}`}>
                      {s.icon}
                    </div>
                  </div>
                  <div className={`dk-stat-num ${s.numClass}`}>{s.value}</div>
                  <div className="dk-stat-hint">{s.hint}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── AI Job Suggestions ──────────────────────────────── */}
        <div className="dk-card anim-fade-up delay-3 mb-4">
          <div className="dk-card-body">
            {/* Header */}
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
              <div>
                <div className="dk-card-title" style={{ fontSize: "1.05rem" }}>
                  <Sparkles
                    size={16}
                    className="me-2 dk-title-icon"
                    style={{ color: "var(--primary)" }}
                  />
                  AI Job Suggestions
                </div>
                <div className="dk-card-sub">
                  Curated picks based on your profile and skills
                </div>
              </div>
              <button
                className="dk-btn-primary"
                onClick={() => navigate("/jobs/suggestions")}
              >
                View All Suggestions
                <ChevronRight size={14} className="ms-1" />
              </button>
            </div>

            {/* 3 suggestion cards */}
            <div className="row g-3">
              {aiSuggestions.map((job) => (
                <div key={job.id} className="col-12 col-md-4">
                  <div
                    className="dk-suggestion-card"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    {/* AI badge */}
                    <div className="dk-suggestion-ribbon">
                      <Star size={9} fill="currentColor" />
                      AI Pick
                    </div>

                    {/* Title + company */}
                    <div className="dk-suggestion-title">{job.job.title}</div>
                    <div className="dk-suggestion-meta">
                      <span>
                        <Building2 size={11} />
                        {job.company?.name}
                      </span>
                      <span>
                        <MapPin size={11} />
                        {job.job.location}
                      </span>
                      <span>
                        <DollarSign size={11} />
                        {job.job.minSalary.toLocaleString()} –{" "}
                        {job.job.maxSalary.toLocaleString()}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="dk-suggestion-tags">
                      {job.job.skills.slice(0, 3).map((s: string) => (
                        <span key={s} className="jb-tag">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Match score */}
                    <div className="dk-suggestion-match">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="jl-match-label">AI Match</span>
                        <span
                          className="jl-match-num"
                          style={{ color: scoreText(job.final_score) }}
                        >
                          {pct(job.final_score)}%
                        </span>
                      </div>
                      <div className="jb-track">
                        <div
                          className="jb-fill"
                          style={
                            {
                              "--w": `${job.final_score * 100}%`,
                              background: scoreGradient(job.final_score),
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>

                    {/* Apply button */}
                    <button
                      className="dk-btn-primary w-100 mt-3"
                      style={{ fontSize: ".8rem", padding: ".45rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/jobs/${job.id}/apply`);
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Applications ────────────────────────────────────── */}
        <div className="dk-card anim-fade-up delay-4">
          <div className="dk-card-body">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
              <div>
                <div className="dk-card-title" style={{ fontSize: "1.05rem" }}>
                  <ClipboardList size={16} className="me-2 dk-title-icon" />
                  My Applications
                </div>
                <div className="dk-card-sub">
                  Track the status of your job applications
                </div>
              </div>
              <button
                className="dk-btn-primary"
                onClick={() => navigate("/jobs")}
              >
                Explore New Jobs
                <ChevronRight size={14} className="ms-1" />
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {apps.map((app) => (
                <div key={app.job.id} className="dk-app-item">
                  {/* Title + badge */}
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                    <div>
                      <div className="dk-app-position">{app.job.title}</div>
                    </div>
                    <span className={getStatusBadge(app.status)}>
                      <span className="dk-badge-dot" />
                      {app.status}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="row g-3 mb-3">
                    <div className="col-4">
                      <div className="dk-app-meta-label">
                        <Calendar size={11} className="me-1" />
                        Applied
                      </div>
                      <div className="dk-app-meta-value">
                        {formatDate(app.createdAt)}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="dk-app-meta-label">
                        <BrainCircuit size={11} className="me-1" />
                        AI Match
                      </div>
                      <div className="dk-app-meta-value dk-app-meta-value--indigo">
                        {app.matchScore}%
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="dk-app-meta-label">
                        <MapPin size={11} className="me-1" />
                        Location
                      </div>
                      <div className="dk-app-meta-value">
                        {app.job.location}
                      </div>
                    </div>
                  </div>

                  {/* Next action */}
                  {app.nextAction && (
                    <div className="dk-app-action-row mb-3">
                      <span className="dk-action-dot" />
                      {app.nextAction}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="dk-btn-outline dk-btn-sm"
                      onClick={() =>
                        navigate(`/applicant/app-status/${app.id}`)
                      }
                    >
                      View Details
                    </button>
                    {app.status === "Interview" && (
                      <button className="dk-btn-success">
                        <Video size={13} className="me-1" />
                        Join Interview
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
