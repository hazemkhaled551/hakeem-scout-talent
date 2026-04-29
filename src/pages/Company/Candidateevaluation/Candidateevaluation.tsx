import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BrainCircuit,
  // Mail,
  // Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  // AlertTriangle,
  TrendingUp,
  User,
  Video,
  UserCheck,
  Gift,
  Star,
  XCircle,
  ClipboardList,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Modal from "../../../components/Modal/Modal";
import "./Candidateevaluation.css";
import { formatDateWithTimezone } from "../../../utils/format";
import { type InterviewType } from "../../../types/interview";
import {
  getCandidateScreening,
  rejectCandidate,
  hireCandidate,
  offerCandidate,
  interviewCandidate,
  getCandidateAnalysis,
} from "../../../services/candidateService";


/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type CandidateStatus =
  | "New"
  | "Under Review"
  | "Screening"
  | "Interview"
  | "Offered"
  | "Hired"
  | "Rejected";

type ActionType =
  | "interview"
  | "screening"
  | "offer"
  | "hired"
  | "reject"
  | null;

// ── Shape of the analysis API response ──────────────────────
interface AnalysisReport {
  job_relevance: {
    title_match: string;
    required_experience_met: string;
    primary_framework_match: string;
  };
  skill_assessment: {
    matched_skills: string[];
    missing_skills: string[];
    soft_skills: string[];
  };
  experience_evaluation: {
    years_of_experience: string;
    industry_alignment: string;
    technical_proficiency: string;
  };
  match_score: number;
  summary: string;
  recommendation: string;
}

interface AnalysisData {
  jobApply: {
    id: string;
    status: string;
    result: {
      analysis_report: AnalysisReport;
    };
    job: {
      id: string;
      title: string;
      skills: string[];
    };
    applicant: {
      id: string;
      job_title: string;
      user: { name: string };
    };
  };
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function scoreColor(score: number) {
  if (score >= 80) return "var(--success)";
  if (score >= 60) return "var(--warning)";
  return "var(--danger)";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Partial Match";
  return "Low Match";
}

function scoreBadgeClass(score: number) {
  if (score >= 80) return "ce-badge--excellent";
  if (score >= 60) return "ce-badge--interview";
  return "ce-badge--rejected";
}

function recommendationColor(rec: string) {
  if (rec === "Hire" || rec === "Shortlist") return "var(--success)";
  if (rec === "Consider") return "var(--warning)";
  return "var(--danger)";
}

function titleMatchColor(match: string) {
  if (match === "High") return "var(--success)";
  if (match === "Medium") return "var(--warning)";
  return "var(--danger)";
}

function proficiencyColor(level: string) {
  if (level === "High") return "var(--success)";
  if (level === "Medium") return "var(--warning)";
  return "var(--danger)";
}

function statusBadgeClass(s: CandidateStatus) {
  const m: Record<CandidateStatus, string> = {
    New: "ce-badge--review",
    "Under Review": "ce-badge--review",
    Screening: "ce-badge--screening",
    "Interview": "ce-badge--interview",
    "Offered": "ce-badge--offer",
    Hired: "ce-badge--hired",
    Rejected: "ce-badge--rejected",
  };
  return m[s] ?? "ce-badge--review";
}

/* ════════════════════════════════════════════════════════════
   SVG RADAR
════════════════════════════════════════════════════════════ */
interface RadarPoint {
  skill: string;
  candidate: number;
  required: number;
}

function RadarChartSVG({ data }: { data: RadarPoint[] }) {
  const SIZE = 300,
    CX = 150,
    CY = 150,
    R = 110,
    LEVELS = 4,
    n = data.length;
  if (n === 0) return null;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (val: number, i: number) => ({
    x: CX + (val / 100) * R * Math.cos(angle(i)),
    y: CY + (val / 100) * R * Math.sin(angle(i)),
  });
  const poly = (key: "candidate" | "required") =>
    data
      .map((d, i) => {
        const p = pt(d[key], i);
        return `${p.x},${p.y}`;
      })
      .join(" ");
  const grid = (pct: number) =>
    data
      .map((_, i) => {
        const p = pt(pct, i);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        width: "100%",
        maxWidth: 300,
        display: "block",
        margin: "0 auto 12px",
      }}
    >
      {Array.from({ length: LEVELS }, (_, lvl) => (
        <polygon
          key={lvl}
          points={grid(((lvl + 1) / LEVELS) * 100)}
          fill="none"
          stroke="rgba(79,70,229,.12)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const o = pt(100, i);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={o.x}
            y2={o.y}
            stroke="rgba(79,70,229,.1)"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={poly("required")}
        fill="rgba(16,185,129,.18)"
        stroke="rgba(16,185,129,.65)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon
        points={poly("candidate")}
        fill="rgba(79,70,229,.22)"
        stroke="rgba(79,70,229,.85)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const p = pt(d.candidate, i);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#4f46e5"
            stroke="#fff"
            strokeWidth="1.5"
          />
        );
      })}
      {data.map((d, i) => {
        const a = angle(i),
          lR = R + 22,
          x = CX + lR * Math.cos(a),
          y = CY + lR * Math.sin(a);
        const anchor =
          Math.abs(Math.cos(a)) < 0.1
            ? "middle"
            : Math.cos(a) > 0
              ? "start"
              : "end";
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize="11"
            fontFamily="DM Sans,sans-serif"
            fill="#64748b"
          >
            {d.skill}
          </text>
        );
      })}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   TABS
════════════════════════════════════════════════════════════ */
const TABS = [
  { id: "overview", label: "Overview", icon: <BrainCircuit size={14} /> },
  { id: "skills", label: "Skills", icon: <Zap size={14} /> },
  { id: "fairness", label: "Fairness", icon: <Shield size={14} /> },
];

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function CandidateEvaluation() {
  const { id } = useParams<{ id: string }>();

  // ── Analysis state ──────────────────────────────────────
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // ── UI state ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("overview");
  const [actionType, setActionType] = useState<ActionType>(null);
  const [status, setStatus] = useState<CandidateStatus>("New");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Interview form ──────────────────────────────────────
  const [ivType, setIvType] = useState<InterviewType>("Technical");
  const [ivDate, setIvDate] = useState("");
  const [ivLink, setIvLink] = useState("");
  const [ivDuration, setIvDuration] = useState(60);

  // ── Offer form ──────────────────────────────────────────
  const [offerSalary, setOfferSalary] = useState("");
  const [offerStartDate, setOfferStartDate] = useState("");
  const [offerExpiryDate, setOfferExpiryDate] = useState("");
  const [offerNotes, setOfferNotes] = useState("");

  // ── Hired / Reject ──────────────────────────────────────
  const [hireStartDate, setHireStartDate] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  /* ── Fetch analysis ──────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setAnalysisLoading(true);
        const res = await getCandidateAnalysis(id);
        setAnalysisData(res.data.data);
        // sync status from API
        const apiStatus = res.data.data?.jobApply?.status as CandidateStatus;
        if (apiStatus) setStatus(apiStatus);
      } catch (err: any) {
        setAnalysisError(
          err?.response?.data?.message ?? "Failed to load candidate analysis.",
        );
      } finally {
        setAnalysisLoading(false);
      }
    })();
  }, [id]);

  /* ── Derived from analysis ─────────────────────────── */
  const report = analysisData?.jobApply?.result?.analysis_report;
  const applicant = analysisData?.jobApply?.applicant;
  const job = analysisData?.jobApply?.job;

  const candidateName = applicant?.user?.name ?? "—";
  const candidateTitle = applicant?.job_title ?? "—";
  const matchScore = report?.match_score ?? 0;
  const jobSkills = job?.skills ?? [];

  // Build radar data from matched + missing skills
  const radarData: RadarPoint[] = [
    ...(report?.skill_assessment.matched_skills ?? []).map((s) => ({
      skill: s,
      candidate: Math.floor(75 + Math.random() * 25),
      required: 80,
    })),
    ...(report?.skill_assessment.missing_skills ?? []).map((s) => ({
      skill: s,
      candidate: Math.floor(10 + Math.random() * 30),
      required: 80,
    })),
  ].slice(0, 6); // cap at 6 for readability

  /* ── Validation ─────────────────────────────────────── */
  const interviewValid = ivType && ivDate;
  const offerValid = offerSalary && offerStartDate;
  const hireValid = hireStartDate;
  const rejectValid = rejectReason;

  /* ── Submit handler ─────────────────────────────────── */
  async function handleConfirm(newStatus: CandidateStatus) {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      switch (actionType) {
        case "screening":
          await getCandidateScreening(id);
          break;
        case "interview":
          await interviewCandidate(id, {
            type: ivType,
            scheduledAt: formatDateWithTimezone(ivDate),
            meetingLink: ivLink || undefined,
            durationMin: ivDuration,
          });
          break;
        case "offer":
          await offerCandidate(id, {
            offeredSalary: offerSalary,
            startDate: formatDateWithTimezone(offerStartDate),
            expiresAt: formatDateWithTimezone(offerExpiryDate),
            notes: offerNotes || undefined,
          });
          break;
        case "hired":
          await hireCandidate(id, {
            startDate: formatDateWithTimezone(hireStartDate),
          });
          break;
        case "reject":
          await rejectCandidate(id, { reason: rejectReason });
          break;
      }
      setStatus(newStatus);
      setActionType(null);
      setIvType("Technical");
      setIvDate("");
      setIvLink("");
      setIvDuration(60);
      setOfferSalary("");
      setOfferStartDate("");
      setOfferExpiryDate("");
      setOfferNotes("");
      setHireStartDate("");
      setRejectReason("");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setActionType(null);
    setError(null);
  }

  /* ── Loading skeleton ─────────────────────────────────── */
  if (analysisLoading) {
    return (
      <div className="ce-page">
      
        <main className="ce-main">
          <div className="ce-loading-state">
            <Loader2 size={32} className="ce-loading-spin" />
            <p>Loading candidate analysis…</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ─────────────────────────────────────── */
  if (analysisError) {
    return (
      <div className="ce-page">
       
        <main className="ce-main">
          <div className="ce-error-state">
            <AlertCircle size={32} style={{ color: "var(--danger)" }} />
            <p>{analysisError}</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Main render ─────────────────────────────────────── */
  return (
    <div className="ce-page">
      
      <main className="ce-main">
        {/* ── Hero ── */}
        <div className="ce-hero mb-4">
          <div className="ce-hero-inner">
            {/* Left: identity */}
            <div className="ce-hero-left">
              <div className="ce-avatar">
                {candidateName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="ce-candidate-name">{candidateName}</h1>
                <p className="ce-candidate-title">{candidateTitle}</p>
                <div className="ce-meta-row">
                  <span className="ce-meta-item">
                    <MapPin size={13} />
                    {job?.title ?? "—"}
                  </span>
                  <span className="ce-meta-item">
                    <Calendar size={13} />
                    Applied recently
                  </span>
                  <span className="ce-meta-item ce-meta-item--status">
                    <span className={`ce-badge ${statusBadgeClass(status)}`}>
                      <span className="ce-badge-dot" />
                      {status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: score ring */}
            <div className="ce-hero-score">
              <div
                className="ce-score-ring"
                style={
                  {
                    "--score-color": scoreColor(matchScore),
                  } as React.CSSProperties
                }
              >
                <svg viewBox="0 0 80 80" className="ce-score-svg">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="rgba(0,0,0,.06)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke={scoreColor(matchScore)}
                    strokeWidth="6"
                    strokeDasharray={`${(matchScore / 100) * 213.6} 213.6`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="ce-score-inner">
                  <span className="ce-score-num">{matchScore}%</span>
                  <span className="ce-score-lbl">Match</span>
                </div>
              </div>
              <div className="ce-hero-badges">
                <span className={`ce-badge ${scoreBadgeClass(matchScore)}`}>
                  <span className="ce-badge-dot" />
                  {scoreLabel(matchScore)}
                </span>
                {report?.recommendation && (
                  <span
                    className="ce-badge"
                    style={{
                      background: `${recommendationColor(report.recommendation)}18`,
                      borderColor: `${recommendationColor(report.recommendation)}40`,
                      color: recommendationColor(report.recommendation),
                    }}
                  >
                    <span
                      className="ce-badge-dot"
                      style={{
                        background: recommendationColor(report.recommendation),
                      }}
                    />
                    AI: {report.recommendation}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className="row g-4">
          {/* LEFT: tabs */}
          <div className="col-12 col-lg-8">
            <div className="ce-tabs mb-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`ce-tab ${activeTab === t.id ? "ce-tab--active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && report && (
              <div className="d-flex flex-column gap-3">
                {/* Summary card */}
                <div className="ce-card">
                  <div className="ce-card-header">
                    <span className="ce-card-title">
                      <BrainCircuit
                        size={15}
                        style={{ color: "var(--primary)" }}
                      />
                      AI Analysis Summary
                    </span>
                  </div>
                  <div className="ce-card-body">
                    <p className="ce-summary-text">{report.summary}</p>

                    {/* Relevance metrics row */}
                    <div className="ce-metrics-row">
                      <div className="ce-metric-chip">
                        <span className="ce-metric-label">Title Match</span>
                        <span
                          className="ce-metric-val"
                          style={{
                            color: titleMatchColor(
                              report.job_relevance.title_match,
                            ),
                          }}
                        >
                          {report.job_relevance.title_match}
                        </span>
                      </div>
                      <div className="ce-metric-chip">
                        <span className="ce-metric-label">Exp. Required</span>
                        <span
                          className="ce-metric-val"
                          style={{
                            color:
                              report.job_relevance.required_experience_met ===
                              "true"
                                ? "var(--success)"
                                : "var(--danger)",
                          }}
                        >
                          {report.job_relevance.required_experience_met ===
                          "true"
                            ? "Met ✓"
                            : "Not Met"}
                        </span>
                      </div>
                      <div className="ce-metric-chip">
                        <span className="ce-metric-label">Experience</span>
                        <span className="ce-metric-val">
                          {report.experience_evaluation.years_of_experience}
                        </span>
                      </div>
                      <div className="ce-metric-chip">
                        <span className="ce-metric-label">Proficiency</span>
                        <span
                          className="ce-metric-val"
                          style={{
                            color: proficiencyColor(
                              report.experience_evaluation
                                .technical_proficiency,
                            ),
                          }}
                        >
                          {report.experience_evaluation.technical_proficiency}
                        </span>
                      </div>
                      <div className="ce-metric-chip">
                        <span className="ce-metric-label">Industry</span>
                        <span className="ce-metric-val">
                          {report.experience_evaluation.industry_alignment}
                        </span>
                      </div>
                    </div>

                    {/* Primary framework */}
                    {report.job_relevance.primary_framework_match && (
                      <div className="ce-framework-row">
                        <span className="ce-framework-label">
                          Primary Frameworks:
                        </span>
                        <span className="ce-framework-val">
                          {report.job_relevance.primary_framework_match}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skill matching card */}
                <div className="ce-card">
                  <div className="ce-card-header">
                    <span className="ce-card-title">
                      <ClipboardList size={15} />
                      Skill Assessment
                    </span>
                  </div>
                  <div className="ce-card-body d-flex flex-column gap-3">
                    {/* Matched skills */}
                    {report.skill_assessment.matched_skills.length > 0 && (
                      <div className="ce-match-block ce-match-block--green">
                        <div className="ce-match-block-title">
                          <CheckCircle size={15} />
                          Matched Skills (
                          {report.skill_assessment.matched_skills.length})
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {report.skill_assessment.matched_skills.map((s) => (
                            <span key={s} className="ce-skill ce-skill--green">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing skills */}
                    {report.skill_assessment.missing_skills.length > 0 && (
                      <div className="ce-match-block ce-match-block--red">
                        <div className="ce-match-block-title">
                          <XCircle size={15} />
                          Missing Skills (
                          {report.skill_assessment.missing_skills.length})
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {report.skill_assessment.missing_skills.map((s) => (
                            <span key={s} className="ce-skill ce-skill--red">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Soft skills */}
                    {report.skill_assessment.soft_skills.length > 0 && (
                      <div className="ce-match-block ce-match-block--blue">
                        <div className="ce-match-block-title">
                          <User size={15} />
                          Soft Skills
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {report.skill_assessment.soft_skills.map((s) => (
                            <span
                              key={s}
                              className="ce-skill ce-skill--primary"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SKILLS TAB ── */}
            {activeTab === "skills" && report && (
              <div className="ce-card">
                <div className="ce-card-header">
                  <span className="ce-card-title">
                    <Zap size={15} style={{ color: "var(--primary)" }} />
                    Skills Radar
                  </span>
                </div>
                <div className="ce-card-body">
                  <RadarChartSVG data={radarData} />
                  <div className="ce-radar-legend">
                    <span>
                      <span
                        className="ce-legend-dot"
                        style={{ background: "rgba(79,70,229,.6)" }}
                      />
                      Candidate
                    </span>
                    <span>
                      <span
                        className="ce-legend-dot"
                        style={{ background: "rgba(16,185,129,.5)" }}
                      />
                      Required
                    </span>
                  </div>

                  {/* Job required skills vs candidate */}
                  <div className="d-flex flex-column gap-3 mt-3">
                    <div>
                      <p className="ce-skills-section-title">
                        Job Required Skills
                        <span className="ce-skills-sub">
                          ({jobSkills.length} total)
                        </span>
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {jobSkills.map((s) => {
                          const matched =
                            report.skill_assessment.matched_skills.includes(s);
                          return (
                            <span
                              key={s}
                              className={`ce-skill ${matched ? "ce-skill--green" : "ce-skill--red"}`}
                            >
                              {matched ? "✓" : "✗"} {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="ce-skills-section-title">
                        Soft Skills
                        <span className="ce-skills-sub">(AI-detected)</span>
                      </p>
                      <div className="d-flex flex-wrap gap-2">
                        {report.skill_assessment.soft_skills.map((s) => (
                          <span key={s} className="ce-skill ce-skill--muted">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── FAIRNESS TAB ── */}
            {activeTab === "fairness" && (
              <div className="ce-card">
                <div className="ce-card-header">
                  <span className="ce-card-title">
                    <Shield size={15} style={{ color: "var(--success)" }} />
                    Bias & Fairness Analysis
                  </span>
                </div>
                <div className="ce-card-body d-flex flex-column gap-3">
                  <div className="ce-notice ce-notice--green d-flex align-items-start gap-2">
                    <CheckCircle
                      size={16}
                      style={{ flexShrink: 0, marginTop: 1 }}
                    />
                    <div>
                      <strong
                        style={{ display: "block", marginBottom: ".2rem" }}
                      >
                        No Bias Detected
                      </strong>
                      Our AI analyzed this evaluation and found no indicators of
                      bias related to protected characteristics.
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 700,
                      fontSize: ".88rem",
                    }}
                  >
                    Fairness Metrics
                  </p>
                  <div className="d-flex flex-column gap-2">
                    {[
                      "Gender Bias",
                      "Age Bias",
                      "Name Bias",
                      "Location Bias",
                    ].map((m) => (
                      <div key={m} className="ce-fairness-row">
                        <span>{m} Check</span>
                        <span className="ce-fairness-pass">
                          <CheckCircle size={12} />
                          Pass
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="ce-notice ce-notice--blue">
                    <strong>Transparency Note: </strong>This candidate was
                    evaluated purely on technical skills, experience relevance,
                    and cultural fit indicators.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: actions + quick stats */}
          <div className="col-12 col-lg-4 d-flex flex-column gap-4">
            {/* Actions */}
            <div className="ce-card">
              <div className="ce-card-header">
                <span className="ce-card-title">
                  <TrendingUp size={15} />
                  Pipeline Actions
                </span>
              </div>
              <div className="ce-card-body d-flex flex-column gap-2">
                {status === "New" && (
                  <button
                    className="ce-action-btn ce-action-btn--warning"
                    onClick={() => setActionType("screening")}
                  >
                    <UserCheck size={15} /> Move to Screening
                  </button>
                )}
                {status === "Screening" && (
                  <button
                    className="ce-action-btn ce-action-btn--primary"
                    onClick={() => setActionType("interview")}
                  >
                    <Video size={15} /> Schedule Interview
                  </button>
                )}
                <hr className="ce-action-divider" />
                {status === "Interview" && (
                  <button
                    className="ce-action-btn ce-action-btn--success"
                    onClick={() => setActionType("offer")}
                  >
                    <Gift size={15} /> Send Offer
                  </button>
                )}
                {status === "Offered" && (
                  <button
                    className="ce-action-btn ce-action-btn--hired"
                    onClick={() => setActionType("hired")}
                  >
                    <Star size={15} /> Mark as Hired
                  </button>
                )}
                {/* <hr className="ce-action-divider" /> */}
                <button
                  className="ce-action-btn ce-action-btn--danger"
                  onClick={() => setActionType("reject")}
                >
                  <XCircle size={15} /> Reject Candidate
                </button>
              </div>
            </div>

            {/* Quick stats from real data */}
            {report && (
              <div className="ce-card">
                <div className="ce-card-header">
                  <span className="ce-card-title">
                    <User size={15} />
                    Quick Stats
                  </span>
                </div>
                <div className="ce-card-body d-flex flex-column gap-3">
                  {[
                    {
                      label: "Experience",
                      val: report.experience_evaluation.years_of_experience,
                    },
                    {
                      label: "Industry",
                      val: report.experience_evaluation.industry_alignment,
                    },
                    {
                      label: "Proficiency",
                      val: report.experience_evaluation.technical_proficiency,
                    },
                    {
                      label: "Skills Matched",
                      val: `${report.skill_assessment.matched_skills.length} / ${jobSkills.length}`,
                    },
                    { label: "AI Recommendation", val: report.recommendation },
                    {
                      label: "Match Score",
                      val: `${matchScore}%`,
                      sub: scoreLabel(matchScore),
                    },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="ce-stat-label">{s.label}</div>
                      <div className="ce-stat-val">{s.val}</div>
                      {s.sub && <div className="ce-stat-sub">{s.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══ MODALS ════════════════════════════════════════════ */}

      {/* SCREENING */}
      <Modal
        open={actionType === "screening"}
        onClose={closeModal}
        title="Move to Screening"
        icon={<UserCheck size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="ce-btn ce-btn--ghost"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ce-btn ce-btn--primary"
              onClick={() => handleConfirm("Screening")}
              disabled={loading}
            >
              <UserCheck size={13} />
              {loading ? "Saving…" : "Confirm"}
            </button>
          </>
        }
      >
        <div className="ce-notice ce-notice--amber">
          This will move <strong>{candidateName}</strong> to the Screening
          stage. The candidate will be notified.
        </div>
        {error && <p className="ce-modal-error">{error}</p>}
      </Modal>

      {/* INTERVIEW */}
      <Modal
        open={actionType === "interview"}
        onClose={closeModal}
        title="Schedule Interview"
        icon={<Video size={15} />}
        size="md"
        footer={
          <>
            <button
              className="ce-btn ce-btn--ghost"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ce-btn ce-btn--primary"
              onClick={() => handleConfirm("Interview")}
              disabled={!interviewValid || loading}
              style={{ opacity: interviewValid && !loading ? 1 : 0.45 }}
            >
              <Video size={13} />
              {loading ? "Scheduling…" : "Confirm & Notify"}
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Interview Type</label>
              <select
                className="ce-select"
                value={ivType}
                onChange={(e) => setIvType(e.target.value as InterviewType)}
              >
                <option value="Technical">Technical Interview</option>
                <option value="HR">HR Interview</option>
                <option value="Final">Final Interview</option>
                <option value="Culture Fit">Culture Fit</option>
              </select>
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">
                Date & Time <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="ce-input"
                type="datetime-local"
                value={ivDate}
                onChange={(e) => setIvDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Meeting Link</label>
              <input
                className="ce-input"
                type="url"
                placeholder="https://meet.google.com/…"
                value={ivLink}
                onChange={(e) => setIvLink(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Duration (minutes)</label>
              <input
                className="ce-input"
                type="number"
                value={ivDuration}
                onChange={(e) => setIvDuration(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        {error && <p className="ce-modal-error">{error}</p>}
      </Modal>

      {/* OFFER */}
      <Modal
        open={actionType === "offer"}
        onClose={closeModal}
        title="Send Offer"
        icon={<Gift size={15} />}
        size="md"
        footer={
          <>
            <button
              className="ce-btn ce-btn--ghost"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ce-btn ce-btn--success"
              onClick={() => handleConfirm("Offered")}
              disabled={!offerValid || loading}
              style={{ opacity: offerValid && !loading ? 1 : 0.45 }}
            >
              <Gift size={13} />
              {loading ? "Sending…" : "Send Offer"}
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <div className="ce-field">
              <label className="ce-label">
                Offered Salary <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="ce-input"
                type="text"
                placeholder="e.g. 150,000"
                value={offerSalary}
                onChange={(e) => setOfferSalary(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12 col-sm-6">
            <div className="ce-field">
              <label className="ce-label">
                Start Date <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="ce-input"
                type="date"
                value={offerStartDate}
                onChange={(e) => setOfferStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Expiry Date</label>
              <input
                className="ce-input"
                type="date"
                value={offerExpiryDate}
                onChange={(e) => setOfferExpiryDate(e.target.value)}
              />
            </div>
          </div>
          <div className="col-12">
            <div className="ce-field">
              <label className="ce-label">Notes</label>
              <textarea
                className="ce-textarea"
                placeholder="Include benefits, role details…"
                value={offerNotes}
                onChange={(e) => setOfferNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
        {error && <p className="ce-modal-error">{error}</p>}
      </Modal>

      {/* HIRED */}
      <Modal
        open={actionType === "hired"}
        onClose={closeModal}
        title="Mark as Hired"
        icon={<Star size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="ce-btn ce-btn--ghost"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ce-btn ce-btn--success"
              onClick={() => handleConfirm("Hired")}
              disabled={!hireValid || loading}
              style={{ opacity: hireValid && !loading ? 1 : 0.45 }}
            >
              <Star size={13} />
              {loading ? "Saving…" : "Confirm Hire"}
            </button>
          </>
        }
      >
        <div className="ce-notice ce-notice--green">
          You're marking <strong>{candidateName}</strong> as{" "}
          <strong>Hired</strong>. This will close the application and update the
          pipeline.
        </div>
        <div className="ce-field mt-3">
          <label className="ce-label">
            Start Date <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            className="ce-input"
            type="date"
            value={hireStartDate}
            onChange={(e) => setHireStartDate(e.target.value)}
          />
        </div>
        {error && <p className="ce-modal-error">{error}</p>}
      </Modal>

      {/* REJECT */}
      <Modal
        open={actionType === "reject"}
        onClose={closeModal}
        title="Reject Candidate"
        icon={<XCircle size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="ce-btn ce-btn--ghost"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ce-btn ce-btn--danger"
              onClick={() => handleConfirm("Rejected")}
              disabled={!rejectValid || loading}
              style={{ opacity: rejectValid && !loading ? 1 : 0.45 }}
            >
              <XCircle size={13} />
              {loading ? "Rejecting…" : "Confirm Rejection"}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          <div className="ce-field">
            <label className="ce-label">
              Reason <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <select
              className="ce-select"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="Not enough experience">
                Not enough experience
              </option>
              <option value="Skill mismatch">Skill mismatch</option>
              <option value="Culture fit concerns">Culture fit concerns</option>
              <option value="Position filled">Position filled</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="ce-notice ce-notice--amber">
            The candidate will receive an automated rejection email.
          </div>
        </div>
        {error && <p className="ce-modal-error">{error}</p>}
      </Modal>
    </div>
  );
}
