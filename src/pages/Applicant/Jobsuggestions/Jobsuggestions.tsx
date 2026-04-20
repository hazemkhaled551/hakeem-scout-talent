import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  Star,
  Zap,
  Brain,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import "../../../styles/Jobs.css";
import "./Jobsuggestions.css";
import { fmt } from "../../../utils/format";
import ApplicantNavbar from "../../../components/ApplicantNavbar";
import { recommendJobs } from "../../../services/jobService";

/* ════════════════════════════════════════════════════════════
   TYPE  (mirrors real API response)
════════════════════════════════════════════════════════════ */
interface SuggestedJob {
  job: any;
  id: string;
  title: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  type: string;
  status: string; // "Published" | "Closed" | "ApplicationsFull" etc.
  workMode: string;
  seniority: string;
  description: string;
  positions: number;
  maxApplications: number;
  applicationsCount: number;
  deadline: string;
  skills: string[];
  company: { id: string; About: string | null };
  // AI fields
  final_score: number; // 0–1 float
  matched_skills: string[];
  missing_skills: string[];
  seniority_match: number; // 1 = match, 0 = no match
  similarity_score: number; // 0–1
  skill_match_score: number; // 0–1
  experience_match_score: number; // 0–1
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
/** final_score is 0–1 → convert to 0–100 display */
function pct(v: number) {
  return Math.round(v * 100);
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
function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "closed") return { cls: "js-status--closed", label: "Closed" };
  if (s === "applicationsfull")
    return { cls: "js-status--full", label: "Full" };
  return { cls: "js-status--open", label: "Open" };
}

function daysLeft(deadline: string) {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function fmtSalary(min: string, max: string) {
  const f = (v: string) => {
    const n = parseFloat(v);
    return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  };
  return `${f(min)} – ${f(max)}`;
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function JobSuggestions() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<SuggestedJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchJobs() {
    try {
      const { data } = await recommendJobs();
      setJobs(data.data.recommendation ?? []);
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchJobs();
      setLoading(false);
    }
    load();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    fetchJobs().finally(() => setRefreshing(false));
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="jb-page">
      <ApplicantNavbar />

      <main className="jb-main au">
        {/* ── Heading ─────────────────────────────────── */}
        <div className="mb-4 au">
          <button
            className="js-back-btn mb-3"
            onClick={() => navigate("/jobs")}
          >
            <ChevronLeft size={15} /> Back to Jobs
          </button>

          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <div className="js-ai-icon">
                  <Brain size={18} />
                </div>
                <h1
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: "clamp(1.5rem,3vw,2rem)",
                    letterSpacing: "-.03em",
                    margin: 0,
                  }}
                >
                  AI Job Suggestions
                </h1>
              </div>
              <p
                style={{
                  fontSize: ".9rem",
                  color: "var(--muted)",
                  marginTop: ".3rem",
                }}
              >
                Curated picks based on your profile, skills, and career goals
              </p>
            </div>

            <button
              className={`jb-btn jb-btn--outline js-refresh-btn`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? "spin" : ""} />
              {refreshing ? "Refreshing…" : "Refresh Suggestions"}
            </button>
          </div>
        </div>

        {/* ── Banner ──────────────────────────────────── */}
        <div className="js-banner mb-4 au d1">
          <Zap size={15} className="js-banner-icon" />
          <span>
            Suggestions are generated from your{" "}
            <strong>profile & resume</strong>. The more you apply, the smarter
            the picks get.
          </span>
        </div>

        {/* ── Count ───────────────────────────────────── */}
        <div className="d-flex align-items-center gap-2 mb-3 au d2">
          <Sparkles size={13} style={{ color: "var(--primary)" }} />
          <span className="jl-count">
            <strong style={{ color: "var(--text)" }}>{jobs.length}</strong>{" "}
            suggestion{jobs.length !== 1 ? "s" : ""} for you
          </span>
        </div>

        {/* ── Cards ───────────────────────────────────── */}
        {loading ? (
          <div className="jl-empty au d2">
            <div className="jl-empty-icon">
              <Brain size={22} />
            </div>
            <span>Loading suggestions…</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="jl-empty au d2">
            <div className="jl-empty-icon">
              <Sparkles size={22} />
            </div>
            <div className="jl-empty-title">No suggestions right now</div>
            <span style={{ fontSize: ".85rem" }}>
              Click Refresh to get new AI picks
            </span>
            <button
              className="jb-btn jb-btn--primary mt-2"
              onClick={handleRefresh}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {jobs.map((job, i) => {
              const badge = statusBadge(job.job.status);
              const days = daysLeft(job.job.deadline);
              const score = job.final_score; // 0–1

              return (
                <div
                  key={job.id}
                  className={`jl-job-card js-job-card au d${Math.min(i + 2, 6)}`}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  {/* AI Pick ribbon */}
                  <div className="js-ribbon">
                    <Star size={10} fill="currentColor" /> AI Pick
                  </div>

                  {/* ── Header: title + badges ─────────── */}
                  <div
                    className="d-flex align-items-start gap-3 mb-3"
                    style={{ paddingRight: "5rem" }}
                  >
                    <div className="flex-1 min-width-0">
                      <div className="jl-job-title mb-1">{job.job.title}</div>
                      <div className="jb-meta">
                        <span className="jb-meta-item">
                          <Building2 size={13} />
                          Company
                        </span>
                        <span className="jb-meta-item">
                          <MapPin size={13} />
                          {job.job.location}
                        </span>
                        <span className="jb-meta-item">
                          <DollarSign size={13} />
                          {fmtSalary(job.job.minSalary, job.job.maxSalary)}
                        </span>
                        <span className="jb-meta-item">
                          <Clock size={13} />
                          {fmt(job.type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Status + seniority + deadline ─────── */}
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <span className={`js-status ${badge.cls}`}>
                      {badge.label}
                    </span>
                    <span
                      className={`js-seniority ${job.seniority_match == 1 ? "js-seniority--match" : ""}`}
                    >
                      {job.seniority_match == 1 ? (
                        <CheckCircle size={11} />
                      ) : (
                        <TrendingUp size={11} />
                      )}
                      {job.job.seniority}
                    </span>
                    <span className="jb-badge jb-badge--indigo">
                      {job.job.workMode}
                    </span>
                    {days > 0 && (
                      <span
                        className={`js-deadline ${days <= 7 ? "js-deadline--urgent" : ""}`}
                      >
                        <AlertTriangle size={10} />
                        {days}d left
                      </span>
                    )}
                  </div>

                  {/* ── Skills ───────────────────────────── */}
                  {(job.matched_skills.length > 0 ||
                    job.missing_skills.length > 0) && (
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {job.matched_skills.map((s) => (
                        <span key={s} className="js-skill-matched">
                          {s}
                        </span>
                      ))}
                      {job.missing_skills.map((s) => (
                        <span key={s} className="js-skill-missing">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── AI Score block ────────────────────── */}
                  <div className="js-score-block mb-3">
                    {/* Main score */}
                    <div className="d-flex align-items-end gap-3 mb-2">
                      <div>
                        <div
                          className="js-score-main-num"
                          style={{ color: scoreText(score) }}
                        >
                          {pct(score)}
                          <span
                            style={{
                              fontSize: ".9rem",
                              fontWeight: 500,
                              color: "var(--muted)",
                              marginLeft: ".2rem",
                            }}
                          >
                            / 100
                          </span>
                        </div>
                        <div className="js-score-sub">AI Match Score</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="js-score-bar-track">
                          <div
                            className="js-score-bar-fill"
                            style={
                              {
                                "--w": `${pct(score)}%`,
                                background: scoreGradient(score),
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sub-scores */}
                    <div>
                      {[
                        {
                          label: "Similarity",
                          val: job.similarity_score,
                          icon: <Brain size={11} />,
                        },
                        {
                          label: "Skill Match",
                          val: job.skill_match_score,
                          icon: <CheckCircle size={11} />,
                        },
                        {
                          label: "Experience",
                          val: job.experience_match_score,
                          icon: <TrendingUp size={11} />,
                        },
                      ].map(({ label, val, icon }) => (
                        <div key={label} className="js-sub-score">
                          <span className="js-sub-score-label d-flex align-items-center gap-1">
                            {icon} {label}
                          </span>
                          <span
                            className="js-sub-score-val"
                            style={{ color: scoreText(val) }}
                          >
                            {pct(val)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Actions ──────────────────────────── */}
                  <div
                    className="d-flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="jb-btn jb-btn--outline jb-btn--sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </button>
                    {job.status === "Published" && (
                      <button
                        className="jb-btn jb-btn--primary jb-btn--sm"
                        onClick={() => navigate(`/jobs/${job.id}/apply`)}
                      >
                        Apply Now
                      </button>
                    )}
                    {job.status !== "Published" && (
                      <span
                        style={{
                          fontSize: ".78rem",
                          color: "var(--muted)",
                          alignSelf: "center",
                        }}
                      >
                        {job.status === "Closed"
                          ? "Position closed"
                          : "Applications full"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
