import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Briefcase,
  Clock,
  TrendingUp,
  BrainCircuit,
  CheckCircle,
  AlertCircle,
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
import { formatDate } from "../../utils/dateFormat";

// ─── Types ────────────────────────────────────────────────────────────────────
// interface Application {
//   id: number;
//   position: string;
//   company: string;
//   status: "Interview" | "Under Review" | "Rejected" | string;
//   appliedDate: string;
//   matchScore: number;
//   location: string;
//   nextAction: string | null;
// }

// ─── Data ─────────────────────────────────────────────────────────────────────
// const applications: Application[] = [
//   {
//     id: 1,
//     position: "Senior Software Engineer",
//     company: "TechCorp Inc.",
//     status: "Interview",
//     appliedDate: "Jan 10, 2026",
//     matchScore: 92,
//     location: "Remote",
//     nextAction: "Interview on Jan 20, 2026 at 2:00 PM",
//   },
//   {
//     id: 2,
//     position: "Full Stack Developer",
//     company: "InnovateLabs",
//     status: "Under Review",
//     appliedDate: "Jan 8, 2026",
//     matchScore: 88,
//     location: "San Francisco, CA",
//     nextAction: null,
//   },
//   {
//     id: 3,
//     position: "Frontend Engineer",
//     company: "DesignStudio",
//     status: "Under Review",
//     appliedDate: "Jan 5, 2026",
//     matchScore: 85,
//     location: "New York, NY",
//     nextAction: "Complete technical assessment",
//   },
//   {
//     id: 4,
//     position: "Backend Developer",
//     company: "DataFlow Systems",
//     status: "Rejected",
//     appliedDate: "Dec 28, 2025",
//     matchScore: 76,
//     location: "Austin, TX",
//     nextAction: null,
//   },
// ];

const profileChecks = [
  { label: "Basic Info", done: true },
  { label: "Work Experience", done: true },
  { label: "Skills Assessment", done: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusBadge(status: string) {
  switch (status) {
    case "Interview":
      return "dk-badge dk-badge--interview";
    case "New":
      return "dk-badge dk-badge--review";
    case "Rejected":
      return "dk-badge dk-badge--rejected";
    default:
      return "dk-badge dk-badge--default";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicantDashboard() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  // const [profileCompletion] = useState(75);
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
      // console.log(statsData.data.data);

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

  // console.log(user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) {
    return <Loader fullPage text="Loading dashboard..." />;
  }
  return (
    <div className="dk-page">
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className={`dk-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="dk-logo-box">H</div>
              <span className="dk-brand-name">Hakeem</span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span
                className="dk-profile-pill"
                onClick={() => navigate("/applicant/profile")}
              >
                <User size={13} />
                Profile
              </span>
              <span
                className="dk-profile-pill"
                onClick={() => navigate("/applicant/interview")}
              >
                <Calendar size={13} />
                Interviews
              </span>
              <button
                className="dk-btn-outline dk-btn-sm"
                onClick={() => navigate("/")}
              >
                <LogOut size={13} className="me-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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
        <div className="dk-card dk-profile-card mb-4 anim-fade-up delay-1">
          <div className="dk-card-body">
            <div className="d-flex align-items-start justify-content-between mb-1">
              <div>
                <div className="dk-card-title">Complete Your Profile</div>
                <div className="dk-card-sub">
                  Complete your profile to get better job matches
                </div>
              </div>
              <span className="dk-profile-badge">{completion.percentage}%</span>
            </div>

            <div className="dk-progress-track">
              <div
                className="dk-progress-fill"
                style={
                  {
                    "--fill": `${completion.percentage}%`,
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="row g-3 mt-1">
              {profileChecks.map((item, i) => (
                <div key={i} className="col-md-4">
                  <div className="dk-check-item">
                    {item.done ? (
                      <CheckCircle size={17} className="dk-check-done" />
                    ) : (
                      <AlertCircle size={17} className="dk-check-pending" />
                    )}
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                      onClick={() => navigate(`/jobs/${app.job.id}`)}
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
