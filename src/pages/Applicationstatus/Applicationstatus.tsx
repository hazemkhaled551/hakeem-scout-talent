import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
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
} from "lucide-react";
import "./ApplicationStatus.css";

import {
  getJobsApplicationById,
  responseToOffer,
} from "../../services/candidateService";

/* ════════════════════════════════════════════════════════════
   TYPES — mirror the API response
════════════════════════════════════════════════════════════ */
interface Company {
  id: string;
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

interface ApplicationData {
  id: string;
  status: string;
  about: string;
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
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ── Status pipeline config ──────────────────────────────── */
type PipelineKey =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offered"
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
    { key: "Applied", label: "Applied", date: data.createdAt },
    { key: "Screening", label: "Screening", date: data.screenAt },
    { key: "Interview", label: "Interview", date: data.interviewAt },
    { key: "Offered", label: "Offer Received", date: data.sendOfferAt },
    { key: "Hired", label: "Hired", date: data.hiredAt },
  ];

  // Priority order for "reached" determination
  const ORDER: PipelineKey[] = [
    "Applied",
    "Screening",
    "Interview",
    "Offered",
    "Hired",
  ];
  const currentIdx = isRejected
    ? ORDER.findIndex((k) => {
        // which stage were they rejected from?
        if (data.rejectAt) {
          if (data.interviewAt) return k === "Interview";
          if (data.screenAt) return k === "Screening";
        }
        return k === "Applied";
      })
    : ORDER.findIndex(
        (k) =>
          k === s ||
          (s === "Offered" && k === "Offered") ||
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
    Applied: "as-status--applied",
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
export default function ApplicationStatus() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

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
      <header className={`as-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="as-logo">H</div>
              <span className="as-brand">Hakeem</span>
            </div>
            <button
              className="as-btn as-btn--ghost as-btn--sm"
              style={{ border: "1.5px solid var(--border)", borderRadius: 10 }}
              onClick={() => navigate("/applicant")}
            >
              <ChevronLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="as-main">
        {/* ── HERO ──────────────────────────────────────── */}
        <div className="as-hero mb-4 au">
          <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
            <div className="d-flex align-items-start gap-3">
              <div className="as-company-logo">
                {getInitials(data.job.company.name)}
              </div>
              <div>
                <div className="as-job-title">{data.job.title}</div>
                <div className="as-company-name d-flex align-items-center gap-1">
                  <Building2 size={13} /> {data.job.company.name}
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
                    {getInitials(data.job.company.name)}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "Syne",
                        fontWeight: 700,
                        fontSize: ".95rem",
                      }}
                    >
                      {data.job.company.name}
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
