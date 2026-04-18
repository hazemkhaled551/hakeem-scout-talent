import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  Clock,
  Globe,
  CheckCircle,
  Circle,
  XCircle,
  Video,
  Calendar,
  Building2,
  Gift,
  Briefcase,
  Users,
  FileText,
  AlertTriangle,
  Star,
  ArrowRight,
  Link,
  File,
  User2,
  TrendingUp,
  BrainCircuit,
  Minus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import "./Applicationstatus.css";

import {
  getJobsApplicationById,
  responseToOffer,
} from "../../../services/candidateService";
import ApplicantNavbar from "../../../components/ApplicantNavbar";

/* ════════════════════════════════════════════════════════════
   TYPES — mirror the API response
════════════════════════════════════════════════════════════ */
interface Company {
  id: string;
  user: { name: string };
  name: string;
  email: string;
  location: string;
  job_title: string;
  About: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  type: string;
  status: string;
  workMode: string;
  description: string;
  positions: number;
  maxApplications: number;
  applicationsCount: number;
  acceptedCount: number;
  deadline: string;
  skills: string[];
  responsibilities: string[];
  requirements: string;
  company: Company;
}

interface Interview {
  id: string;
  type: string;
  status: string;
  scheduledAt: string;
  meetingLink: string;
  durationMin: number;
  createdAt: string;
}

interface Offer {
  id: string;
  offeredSalary: string;
  startDate: string;
  notes: string;
  expiresAt: string;
  respondedAt: string | null;
  status: "Pending" | "Accepted" | "Rejected";
  createdAt: string;
}
interface AiResult {
  analysis_report: {
    job_relevance: {
      title_match: string;
      required_experience_met: boolean;
      primary_framework_match?: string;
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
    recommendation: string; // "Proceed to Interview" | "Reject" | "Consider" etc.
  };
}

interface ApplicationData {
  id: string;
  status: string;
  about: string;
  result?: AiResult;
  job: Job;
  createdAt: string;
  hiredDetails: string | null;
  hiredAt: string | null;
  screenAt: string | null;
  offer: Offer | null;
  sendOfferAt: string | null;
  interviews: Interview[];
  interviewAt: string | null;
  reject: string | null;
  rejectAt: string | null;
}

function fmtDate(iso: string | null, opts?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(
    "en-US",
    opts ?? {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function fmtDateTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
}

function fmtSalary(min: string, max: string) {
  const f = (v: string) => {
    const n = parseFloat(v);
    return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${v}`;
  };
  return `${f(min)} – ${f(max)}`;
}

function fmtType(t: string) {
  return t.replace("_", " ");
}

function getInitials(name: string) {
  return name
    ?.split(" ")
    ?.map((n) => n[0])
    ?.join("")
    ?.slice(0, 2)
    ?.toUpperCase();
}

/* ── Status pipeline config ──────────────────────────────── */
type PipelineKey =
  | "New"
  | "Screening"
  | "interview"
  | "offered"
  | "Hired"
  | "Rejected";

function getPipeline(data: ApplicationData): Array<{
  key: PipelineKey;
  label: string;
  date: string | null;
  state: "done" | "active" | "pending" | "rejected";
}> {
  const s = data.status;

  const isRejected = s === "Rejected";

  // Base stages always present
  const stages: Array<{
    key: PipelineKey;
    label: string;
    date: string | null;
  }> = [
    { key: "New", label: "New", date: data.createdAt },
    { key: "Screening", label: "Screening", date: data.screenAt },
    { key: "interview", label: "Interview", date: data.interviewAt },
    { key: "offered", label: "Offer Received", date: data.sendOfferAt },
    { key: "Hired", label: "Hired", date: data.hiredAt },
  ];

  // Priority order for "reached" determination
  const ORDER: PipelineKey[] = [
    "New",
    "Screening",
    "interview",
    "offered",
    "Hired",
  ];
  const currentIdx = isRejected
    ? ORDER.findIndex((k) => {
        // which stage were they rejected from?
        if (data.rejectAt) {
          if (data.interviewAt) return k === "interview";
          if (data.screenAt) return k === "Screening";
        }
        return k === "New";
      })
    : ORDER.findIndex(
        (k) =>
          k === s ||
          (s === "Offered" && k === "offered") ||
          (s === "Hired" && k === "Hired"),
      );

  const result = stages.map((st, i) => {
    let state: "done" | "active" | "pending" | "rejected" = "pending";
    if (isRejected) {
      if (i <= currentIdx) state = i < currentIdx ? "done" : "rejected";
    } else {
      if (i < currentIdx) state = "done";
      if (i === currentIdx) state = "active";
    }
    return { ...st, state };
  });

  // Append Rejected at the end if status is rejected
  if (isRejected) {
    result.push({
      key: "Rejected",
      label: "Application Closed",
      date: data.rejectAt,
      state: "rejected",
    });
  }

  return result;
}

function ivBadgeClass(status: string) {
  const m: Record<string, string> = {
    Completed: "as-iv-badge--completed",
    Scheduled: "as-iv-badge--scheduled",
    Cancelled: "as-iv-badge--cancelled",
    Pending: "as-iv-badge--pending",
  };
  return m[status] ?? "as-iv-badge--pending";
}

function statusBadgeClass(s: string) {
  const m: Record<string, string> = {
    New: "as-status--applied",
    Screening: "as-status--screening",
    Interview: "as-status--interview",
    Offered: "as-status--offered",
    Hired: "as-status--hired",
    Rejected: "as-status--rejected",
  };
  return m[s] ?? "as-status--applied";
}

/* progress percentage for the timeline line */
function timelineProgress(pipeline: ReturnType<typeof getPipeline>) {
  const done = pipeline.filter((s) => s.state === "done").length;
  const total = pipeline.length - 1;
  return total <= 0 ? 100 : Math.round((done / total) * 100);
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */

function AiAnalysisCard({ result }: { result: AiResult }) {
  const r = result.analysis_report;
  const score = r.match_score;

  const scoreColor =
    score >= 70
      ? "var(--success)"
      : score >= 45
        ? "var(--warning)"
        : "var(--danger)";

  const scoreGrad =
    score >= 70
      ? "linear-gradient(90deg,var(--success),#059669)"
      : score >= 45
        ? "linear-gradient(90deg,var(--warning),#d97706)"
        : "linear-gradient(90deg,var(--danger),#dc2626)";

  const rec = r.recommendation ?? "";
  const isPositive =
    rec.toLowerCase().includes("proceed") ||
    rec.toLowerCase().includes("accept");
  const isNegative = rec.toLowerCase().includes("reject");

  const recBg = isPositive
    ? "rgba(16,185,129,.07)"
    : isNegative
      ? "rgba(239,68,68,.07)"
      : "rgba(245,158,11,.07)";
  const recBorder = isPositive
    ? "rgba(16,185,129,.22)"
    : isNegative
      ? "rgba(239,68,68,.22)"
      : "rgba(245,158,11,.22)";
  const recColor = isPositive ? "#065f46" : isNegative ? "#991b1b" : "#92400e";

  return (
    <div
      className="as-card au d4"
      style={{ borderTop: "3px solid var(--primary)" }}
    >
      {/* ── Header ── */}
      <div className="as-card-header">
        <BrainCircuit size={15} style={{ color: "var(--primary)" }} />
        <span className="as-card-title">AI Application Analysis</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: ".7rem",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
          }}
        >
          <CheckCircle size={11} style={{ color: "var(--success)" }} /> Analysis
          complete
        </span>
      </div>

      <div className="as-card-body d-flex flex-column gap-3">
        {/* ── Score + Recommendation ── */}
        <div className="row g-3">
          <div className="col-6">
            <div
              style={{
                fontSize: ".7rem",
                color: "var(--muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".05em",
                marginBottom: ".5rem",
              }}
            >
              Match Score
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: ".3rem",
                marginBottom: ".5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: "2rem",
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  color: "var(--muted)",
                  marginBottom: ".15rem",
                }}
              >
                /100
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "var(--border)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 999,
                  width: `${score}%`,
                  background: scoreGrad,
                  transition: "width .8s ease",
                }}
              />
            </div>
          </div>

          <div className="col-6">
            <div
              style={{
                fontSize: ".7rem",
                color: "var(--muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".05em",
                marginBottom: ".5rem",
              }}
            >
              Recommendation
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: ".45rem",
                background: recBg,
                border: `1px solid ${recBorder}`,
                borderRadius: 12,
                padding: ".55rem .9rem",
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: ".82rem",
                color: recColor,
                lineHeight: 1.4,
              }}
            >
              {isPositive && <ThumbsUp size={14} />}
              {isNegative && <ThumbsDown size={14} />}
              {!isPositive && !isNegative && <Minus size={14} />}
              {rec}
            </div>
          </div>
        </div>

        {/* ── Job Relevance ── */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 11,
            padding: ".85rem 1rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: ".72rem",
              color: "var(--primary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: ".6rem",
              display: "flex",
              alignItems: "center",
              gap: ".3rem",
            }}
          >
            <Briefcase size={11} /> Job Relevance
          </div>
          <div className="row g-2" style={{ fontSize: ".82rem" }}>
            <div className="col-12 col-sm-4">
              <span style={{ color: "var(--muted)" }}>Title match: </span>
              <strong
                style={{
                  color:
                    r.job_relevance.title_match === "High"
                      ? "var(--success)"
                      : "var(--warning)",
                }}
              >
                {r.job_relevance.title_match}
              </strong>
            </div>
            <div className="col-12 col-sm-4">
              <span style={{ color: "var(--muted)" }}>Experience: </span>
              <strong
                style={{
                  color: r.job_relevance.required_experience_met
                    ? "var(--success)"
                    : "var(--danger)",
                }}
              >
                {r.job_relevance.required_experience_met
                  ? "✓ Met"
                  : "✗ Not met"}
              </strong>
            </div>
            {r.job_relevance.primary_framework_match && (
              <div className="col-12 col-sm-4">
                <span style={{ color: "var(--muted)" }}>Framework: </span>
                <strong style={{ color: "var(--text)" }}>
                  {r.job_relevance.primary_framework_match}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* ── Skills ── */}
        <div className="row g-2">
          {r.skill_assessment.matched_skills.length > 0 && (
            <div className="col-12 col-sm-6">
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--success)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: ".4rem",
                  display: "flex",
                  alignItems: "center",
                  gap: ".3rem",
                }}
              >
                <CheckCircle size={11} /> Matched (
                {r.skill_assessment.matched_skills.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                {r.skill_assessment.matched_skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: "rgba(16,185,129,.08)",
                      border: "1px solid rgba(16,185,129,.2)",
                      color: "#065f46",
                      borderRadius: 8,
                      padding: ".18rem .62rem",
                      fontSize: ".74rem",
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {r.skill_assessment.missing_skills.length > 0 && (
            <div className="col-12 col-sm-6">
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--danger)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: ".4rem",
                  display: "flex",
                  alignItems: "center",
                  gap: ".3rem",
                }}
              >
                <XCircle size={11} /> Missing (
                {r.skill_assessment.missing_skills.length})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                {r.skill_assessment.missing_skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: "rgba(239,68,68,.07)",
                      border: "1px solid rgba(239,68,68,.18)",
                      color: "#991b1b",
                      borderRadius: 8,
                      padding: ".18rem .62rem",
                      fontSize: ".74rem",
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {r.skill_assessment.soft_skills.length > 0 && (
            <div className="col-12">
              <div
                style={{
                  fontSize: ".72rem",
                  color: "var(--muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: ".4rem",
                }}
              >
                Soft Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                {r.skill_assessment.soft_skills.map((s) => (
                  <span
                    key={s}
                    style={{
                      background: "rgba(79,70,229,.07)",
                      border: "1px solid rgba(79,70,229,.15)",
                      color: "var(--primary)",
                      borderRadius: 8,
                      padding: ".18rem .62rem",
                      fontSize: ".74rem",
                      fontWeight: 600,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Experience ── */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: 11,
            padding: ".85rem 1rem",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: ".72rem",
              color: "var(--primary)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: ".6rem",
              display: "flex",
              alignItems: "center",
              gap: ".3rem",
            }}
          >
            <TrendingUp size={11} /> Experience Evaluation
          </div>
          <div className="row g-2" style={{ fontSize: ".82rem" }}>
            <div className="col-12 col-sm-4">
              <span style={{ color: "var(--muted)" }}>Years: </span>
              <strong>{r.experience_evaluation.years_of_experience}</strong>
            </div>
            <div className="col-12 col-sm-4">
              <span style={{ color: "var(--muted)" }}>Industry: </span>
              <strong>{r.experience_evaluation.industry_alignment}</strong>
            </div>
            <div className="col-12 col-sm-4">
              <span style={{ color: "var(--muted)" }}>Proficiency: </span>
              <strong
                style={{
                  color:
                    r.experience_evaluation.technical_proficiency === "Strong"
                      ? "var(--success)"
                      : "var(--text)",
                }}
              >
                {r.experience_evaluation.technical_proficiency}
              </strong>
            </div>
          </div>
        </div>

        {/* ── Summary ── */}
        {r.summary && (
          <div
            style={{
              background: "rgba(79,70,229,.04)",
              border: "1px solid rgba(79,70,229,.12)",
              borderRadius: 11,
              padding: ".85rem 1rem",
            }}
          >
            <div
              style={{
                fontSize: ".72rem",
                color: "var(--primary)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".05em",
                marginBottom: ".4rem",
                display: "flex",
                alignItems: "center",
                gap: ".3rem",
              }}
            >
              <TrendingUp size={11} /> AI Summary
            </div>
            <p
              style={{
                fontSize: ".84rem",
                color: "var(--muted)",
                lineHeight: 1.75,
              }}
            >
              {r.summary}
            </p>
          </div>
        )}

        <p
          style={{
            fontSize: ".72rem",
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          This analysis is AI-generated and intended to assist, not replace,
          human judgement.
        </p>
      </div>
    </div>
  );
}
export default function ApplicationStatus() {
  // const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fn = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", fn);
  //   return () => window.removeEventListener("scroll", fn);
  // }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getJobsApplicationById(id!);
        console.log(res.data.data);

        setData(res.data.data);
      } catch (error: any) {
        console.error(
          "Failed to load application status:",
          error?.response?.data?.message || error.message,
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="as-page">
        <div className="as-loader">
          <div className="as-spinner" />
          Loading application status…
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pipeline = getPipeline(data);
  const progress = timelineProgress(pipeline);

  async function handleOfferResponse(accept: string) {
    try {
      await responseToOffer(data?.offer?.id, {
        status: accept,
      });
      // Refresh data to reflect changes
      const res = await getJobsApplicationById(id!);
      setData(res.data.data);
    } catch (error: any) {
      console.error(
        "Failed to respond to offer:",
        error?.response?.data?.message || error.message,
      );
    }
  }
  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="as-page">
      {/* HEADER */}

      <ApplicantNavbar />
      <main className="as-main">
        {/* ── HERO ──────────────────────────────────────── */}
        <div className="as-hero mb-4 au">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-start gap-3">
              <div className="as-company-logo">
                {getInitials(data.job.company.user.name)}
              </div>
              <div>
                <div className="as-job-title">{data.job.title}</div>
                <div className="as-company-name d-flex align-items-center gap-1">
                  <Building2 size={13} /> {data.job.company.user.name}
                </div>
                <div className="as-meta-row mt-1">
                  <span className="as-meta-item">
                    <MapPin size={13} />
                    {data.job.location}
                  </span>
                  <span className="as-meta-item">
                    <DollarSign size={13} />
                    {fmtSalary(data.job.minSalary, data.job.maxSalary)}
                  </span>
                  <span className="as-meta-item">
                    <Clock size={13} />
                    {fmtType(data.job.type)}
                  </span>
                  <span className="as-meta-item">
                    <Globe size={13} />
                    {data.job.workMode}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column align-items-end gap-2">
              <span
                className={`as-status-badge ${statusBadgeClass(data.status)}`}
              >
                <span className="as-status-badge-dot" />
                {data.status}
              </span>
              <span style={{ fontSize: ".76rem", color: "var(--muted)" }}>
                Applied {fmtDate(data.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* ── LEFT COLUMN ────────────────────────────── */}
          <div className="col-12 col-lg-7 d-flex flex-column gap-4">
            {/* Timeline */}
            <div className="as-card au d1">
              <div className="as-card-header">
                <ArrowRight size={15} style={{ color: "var(--primary)" }} />
                <span className="as-card-title">Application Timeline</span>
              </div>
              <div className="as-card-body">
                <div
                  className="as-timeline"
                  style={
                    { "--progress": `${progress}%` } as React.CSSProperties
                  }
                >
                  {pipeline.map((step) => (
                    <div key={step.key} className="as-tl-item">
                      {/* dot */}
                      <div className={`as-tl-dot as-tl-dot--${step.state}`}>
                        {step.state === "done" && (
                          <CheckCircle
                            size={13}
                            color="#fff"
                            strokeWidth={2.5}
                          />
                        )}
                        {step.state === "active" && (
                          <Circle size={8} color="#fff" fill="#fff" />
                        )}
                        {step.state === "rejected" && (
                          <XCircle size={13} color="#fff" strokeWidth={2.5} />
                        )}
                      </div>

                      {/* content */}
                      <div
                        className={`as-tl-title ${step.state === "pending" ? "as-tl-title--pending" : ""}`}
                      >
                        {step.label}
                      </div>
                      {step.date && (
                        <div className="as-tl-date">
                          {fmtDateTime(step.date)}
                        </div>
                      )}
                      {step.state === "pending" && !step.date && (
                        <div className="as-tl-date">Pending</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <AiAnalysisCard result={data.result!} />
            {/* Interviews */}
            {data.interviews.length > 0 && (
              <div className="as-card au d2">
                <div className="as-card-header">
                  <Video size={15} style={{ color: "var(--primary)" }} />
                  <span className="as-card-title">
                    Interviews
                    <span
                      style={{
                        marginLeft: ".5rem",
                        background: "rgba(79,70,229,.08)",
                        color: "var(--primary)",
                        border: "1px solid rgba(79,70,229,.16)",
                        borderRadius: 999,
                        padding: ".08rem .5rem",
                        fontSize: ".72rem",
                        fontFamily: "Syne",
                        fontWeight: 700,
                      }}
                    >
                      {data.interviews.length}
                    </span>
                  </span>
                </div>
                <div className="as-card-body d-flex flex-column gap-2">
                  {data.interviews.map((iv) => (
                    <div key={iv.id} className="as-interview-card">
                      <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-2">
                        <div
                          style={{
                            fontFamily: "Syne",
                            fontWeight: 700,
                            fontSize: ".88rem",
                          }}
                        >
                          {iv.type} Interview
                        </div>
                        <span
                          className={`as-iv-badge ${ivBadgeClass(iv.status)}`}
                        >
                          {iv.status === "Completed" && (
                            <CheckCircle size={11} />
                          )}
                          {iv.status === "Scheduled" && <Calendar size={11} />}
                          {iv.status === "Cancelled" && <XCircle size={11} />}
                          {iv.status}
                        </span>
                      </div>
                      <div
                        className="d-flex flex-wrap gap-3"
                        style={{ fontSize: ".8rem", color: "var(--muted)" }}
                      >
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={12} />
                          {fmtDateTime(iv.scheduledAt)}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <Clock size={12} />
                          {iv.durationMin} min
                        </span>
                        {iv.meetingLink && (
                          <a
                            href={
                              iv.meetingLink.startsWith("http")
                                ? iv.meetingLink
                                : `https://${iv.meetingLink}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="d-flex align-items-center gap-1"
                            style={{
                              color: "var(--primary)",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            <Link size={12} /> Join Link
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cover letter / About */}
            {data.about && (
              <div className="as-card au d3">
                <div className="as-card-header">
                  <FileText size={15} style={{ color: "var(--primary)" }} />
                  <span className="as-card-title">Your Application Note</span>
                </div>
                <div className="as-card-body">
                  <p
                    style={{
                      fontSize: ".87rem",
                      color: "var(--muted)",
                      lineHeight: 1.75,
                    }}
                  >
                    {data.about}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────── */}
          <div className="col-12 col-lg-5 d-flex flex-column gap-4">
            {/* Offer card */}
            {data.offer && (
              <div className="au d1">
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  style={{
                    fontSize: ".72rem",
                    fontFamily: "Syne",
                    fontWeight: 700,
                    color: "var(--success)",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                  }}
                >
                  <Gift size={13} /> Offer Received
                </div>
                <div className="as-offer-card">
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-3 flex-wrap">
                    <div>
                      <div className="as-offer-label">Offered Salary</div>
                      <div className="as-offer-salary">
                        ${parseFloat(data.offer.offeredSalary).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`as-offer-badge as-offer-badge--${data.offer.status.toLowerCase()}`}
                    >
                      {data.offer.status === "Pending" && <Star size={11} />}
                      {data.offer.status === "Accepted" && (
                        <CheckCircle size={11} />
                      )}
                      {data.offer.status === "Rejected" && (
                        <XCircle size={11} />
                      )}
                      {data.offer.status}
                    </span>
                  </div>

                  <div
                    className="d-flex flex-column gap-2 mb-3"
                    style={{ fontSize: ".82rem" }}
                  >
                    <div
                      className="d-flex align-items-center gap-2"
                      style={{ color: "var(--muted)" }}
                    >
                      <Calendar size={13} />
                      <span>
                        <strong style={{ color: "var(--text)" }}>
                          Start Date:
                        </strong>{" "}
                        {fmtDate(data.offer.startDate)}
                      </span>
                    </div>
                    <div
                      className="d-flex align-items-center gap-2"
                      style={{ color: "var(--muted)" }}
                    >
                      <AlertTriangle size={13} />
                      <span>
                        <strong style={{ color: "var(--text)" }}>
                          Expires:
                        </strong>{" "}
                        {fmtDate(data.offer.expiresAt)}
                      </span>
                    </div>
                  </div>

                  {data.offer.notes && (
                    <div
                      className="as-notice as-notice--green"
                      style={{ fontSize: ".81rem", marginBottom: ".9rem" }}
                    >
                      {data.offer.notes}
                    </div>
                  )}

                  {data.offer.status === "Pending" && (
                    <div className="d-flex gap-2">
                      <button
                        className="as-btn as-btn--success"
                        style={{ flex: 1 }}
                        onClick={() => handleOfferResponse("Accepted")}
                      >
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button
                        className="as-btn as-btn--outline"
                        style={{
                          flex: 1,
                          color: "var(--danger)",
                          borderColor: "rgba(239,68,68,.3)",
                        }}
                        onClick={() => handleOfferResponse("Rejected")}
                      >
                        <XCircle size={14} /> Decline
                      </button>
                    </div>
                  )}

                  {data.offer.status === "Accepted" && (
                    <div
                      className="as-notice as-notice--green"
                      style={{ fontSize: ".8rem" }}
                    >
                      <CheckCircle
                        size={13}
                        style={{
                          marginRight: ".4rem",
                          verticalAlign: "middle",
                        }}
                      />
                      You accepted this offer on{" "}
                      {fmtDate(data.offer.respondedAt)}.
                    </div>
                  )}

                  {data.offer.status === "Rejected" && (
                    <div
                      className="as-notice as-notice--amber"
                      style={{ fontSize: ".8rem" }}
                    >
                      <XCircle
                        size={13}
                        style={{
                          marginRight: ".4rem",
                          verticalAlign: "middle",
                        }}
                      />
                      You declined this offer on{" "}
                      {fmtDate(data.offer.respondedAt)}.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job details */}
            <div className="as-card au d2">
              <div className="as-card-header">
                <Briefcase size={15} style={{ color: "var(--primary)" }} />
                <span className="as-card-title">Job Details</span>
              </div>
              <div className="as-card-body">
                <div>
                  {[
                    {
                      label: "Location",
                      val: data.job.location,
                      icon: <MapPin size={14} />,
                    },
                    {
                      label: "Salary",
                      val: fmtSalary(data.job.minSalary, data.job.maxSalary),
                      icon: <DollarSign size={14} />,
                    },
                    {
                      label: "Type",
                      val: fmtType(data.job.type),
                      icon: <Clock size={14} />,
                    },
                    {
                      label: "Work Mode",
                      val: data.job.workMode,
                      icon: <Globe size={14} />,
                    },
                    {
                      label: "Deadline",
                      val: fmtDate(data.job.deadline),
                      icon: <Calendar size={14} />,
                    },
                    {
                      label: "Positions",
                      val: `${data.job.positions} open position${data.job.positions > 1 ? "s" : ""}`,
                      icon: <Users size={14} />,
                    },
                    {
                      label: "Max Applications",
                      val: `${data.job.maxApplications} applications allowed`,
                      icon: <File size={14} />,
                    },
                    {
                      label: "Applications Received",
                      val: `${data.job.applicationsCount} application${data.job.applicationsCount !== 1 ? "s" : ""} received`,
                      icon: <Users size={14} />,
                    },
                    {
                      label: "Positions Filled",
                      val: `${data.job.acceptedCount} positions filled`,
                      icon: <User2 size={14} />,
                    },
                  ].map((row) => (
                    <div key={row.label} className="as-detail-row">
                      <span className="as-detail-icon">{row.icon}</span>
                      <div>
                        <div className="as-detail-label">{row.label}</div>
                        <div className="as-detail-val">{row.val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {data.job.skills.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      className="as-detail-label"
                      style={{ marginBottom: ".5rem" }}
                    >
                      Skills Required
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {data.job.skills.map((s) => (
                        <span key={s} className="as-skill">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {data.job.description && (
                  <div style={{ marginTop: "1rem" }}>
                    <div
                      className="as-detail-label"
                      style={{ marginBottom: ".35rem" }}
                    >
                      About the Role
                    </div>
                    <p
                      style={{
                        fontSize: ".83rem",
                        color: "var(--muted)",
                        lineHeight: 1.7,
                      }}
                    >
                      {data.job.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Company info */}
            <div className="as-card au d3">
              <div className="as-card-header">
                <Building2 size={15} style={{ color: "var(--primary)" }} />
                <span className="as-card-title">About the Company</span>
              </div>
              <div className="as-card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="as-company-logo"
                    style={{ width: 42, height: 42, fontSize: ".85rem" }}
                  >
                    {getInitials(data.job.company.user.name)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "Syne",
                        fontWeight: 700,
                        fontSize: ".95rem",
                      }}
                    >
                      {data.job.company.user.name}
                    </div>
                    <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                      {data.job.company.location}
                    </div>
                  </div>
                </div>
                {data.job.company.About && (
                  <p
                    style={{
                      fontSize: ".83rem",
                      color: "var(--muted)",
                      lineHeight: 1.7,
                    }}
                  >
                    {data.job.company.About}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
