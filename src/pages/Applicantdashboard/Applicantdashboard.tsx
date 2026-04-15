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
} from "lucide-react";
import "./Applicantdashboard.css";
// import { useUser } from "../../contexts/UserContext";
import Loader from "../../components/Loader";
import {
  getCompletion,
  getDashboardStats,
  getApplicantJobs,
} from "../../services/userService";
import { formatDate } from "../../utils/format";
import ApplicantNavbar from "../../components/ApplicantNavbar";
import ProfileCompletion from "../../components/ProfileCompletion/ProfileCompletion";

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
  const [completion, setCompletion] = useState<any>({});

  async function loadDashboard() {
    try {
      const statsData = await getDashboardStats();

      setStats(statsData.data.data);
      const appsData = await getApplicantJobs();
      console.log(appsData.data.data);

      setApps(appsData.data.data);
      const completionData = await getCompletion();
      setCompletion(completionData.data.data);
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

        {/* ── Profile Completion ──────────────────────────────── */}
        <ProfileCompletion
          percentage={completion.percentage}
          sections={completion.sections}
        />

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
              hint: "+3 this week",
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
            {
              label: "AI Match",
              value: "87%",
              hint: "Avg score",
              icon: <BrainCircuit size={16} />,
              iconClass: "dk-stat-icon--indigo",
              numClass: "dk-stat-num--indigo",
              cardClass: "dk-stat-card--indigo",
            },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
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

        {/* ── Applications ────────────────────────────────────── */}
        <div className="dk-card anim-fade-up delay-3">
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
                      {/* <div className="dk-app-company">{app.company}</div> */}
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
