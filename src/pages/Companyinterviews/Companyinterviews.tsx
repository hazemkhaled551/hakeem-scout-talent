import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Search,
  Video,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  X,
  Save,
  Link,
  CalendarDays,
  AlertTriangle,
  BrainCircuit,
  Filter,
  MessageSquare,
  Star,
  ArrowRight,
} from "lucide-react";
import Modal from "../../components/Modal/Modal";
import "./Companyinterviews.css";
import {
  getCompanyInterviews,
  completeInterview,
  rescheduleInterview,
  cancelInterview,
  type InterviewDTO,
} from "../../services/interviewService";
import {
  companyIntiatal,
  fmtDate,
  fmtTime,
  formatDateWithTimezone,
} from "../../utils/dateFormat";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type InterviewStatus = "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
type InterviewType = "Technical" | "HR" | "Final";
type ModalType = "reschedule" | "cancel" | "complete" | "view" | "add" | null;

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function badgeClass(s: InterviewStatus) {
  const m: Record<InterviewStatus, string> = {
    Scheduled: "ci-badge--scheduled",
    Completed: "ci-badge--completed",
    Cancelled: "ci-badge--cancelled",
    Rescheduled: "ci-badge--rescheduled",
  };
  return m[s];
}
function rowClass(s: InterviewStatus) {
  return `ci-row ci-row--${s.toLowerCase()}`;
}
function calEvtClass(s: InterviewStatus) {
  return `ci-cal-event ci-cal-event--${s.toLowerCase()}`;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
function firstDay(y: number, m: number) {
  return new Date(y, m, 1).getDay();
}
const TODAY = new Date();

// function emptyForm() {
//   return {
//     candidateName: "",
//     jobTitle: "",
//     type: "Technical" as InterviewType,
//     scheduledAt: "",
//     durationMins: 60,
//     meetingLink: "",
//     location: "",
//     interviewerName: "",
//     notes: "",
//   };
// }

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function CompanyInterviews() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InterviewStatus | "All">(
    "All",
  );
  const [typeFilter, setTypeFilter] = useState<InterviewType | "All">("All");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [calYear, setCalYear] = useState(TODAY.getFullYear());
  const [calMonth, setCalMonth] = useState(TODAY.getMonth());
  const [calDay, setCalDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Offer fields
  const [offerSalary, setOfferSalary] = useState("");
  const [offerStart, setOfferStart] = useState("");
  const [offerNotes, setOfferNotes] = useState("");

  // Another Interview fields
  const [nextType, setNextType] = useState("");
  const [nextScheduledAt, setNextScheduledAt] = useState("");
  const [nextMeetingLink, setNextMeetingLink] = useState("");
  const [newMeetingLink, setNewMeetingLink] = useState("");
  const [nextDuration, setNextDuration] = useState(60);

  // Reschedule form
  const [newDate, setNewDate] = useState("");
  // Cancel form
  const [cancelReason, setCancelReason] = useState("");

  const [fbPublic, setFbPublic] = useState("");
  const [fbRating, setFbRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [fbNextStep, setFbNextStep] = useState<
    "Offered" | "Reject" | "Another Interview"
  >("Offered");
  const [fbInternal, setFbInternal] = useState("");
  // Add form
  // const [addForm, setAddForm] = useState(emptyForm());

  useEffect(() => {
    loadInterviews();
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [statusFilter]);

  async function loadInterviews() {
    try {
      const { data } = await getCompanyInterviews(
        statusFilter === "All" ? "" : statusFilter,
      );
      setInterviews(data.data.type ?? []);
    } catch (err: any) {
      console.error("Error loading interviews:", err.response ?? err);
    }
  }

  /* ── KPIs ───────────────────────────────────────────────── */
  const kpis = useMemo(
    () => ({
      total: interviews.length,
      today: interviews.filter(
        (i) => fmtDate(i.scheduledAt) === fmtDate(TODAY.toISOString()),
      ).length,
      upcoming: interviews.filter((i) => i.status === "Scheduled").length,
      completed: interviews.filter((i) => i.status === "Completed").length,
    }),
    [interviews],
  );

  const filtered = useMemo(
    () =>
      interviews.filter((iv) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            iv.candidateName.toLowerCase().includes(q) ||
            iv.jobTitle.toLowerCase().includes(q) ||
            iv.interviewType.toLowerCase().includes(q)) &&
          (statusFilter === "All" || iv.status === statusFilter) &&
          (typeFilter === "All" || iv.interviewType === typeFilter)
        );
      }),
    [interviews, search, statusFilter, typeFilter],
  );

  /* ── Calendar ───────────────────────────────────────────── */
  const calMap = useMemo(() => {
    const m: Record<number, InterviewDTO[]> = {};
    interviews.forEach((iv) => {
      const d = new Date(iv.scheduledAt);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const day = d.getDate();
        if (!m[day]) m[day] = [];
        m[day].push(iv);
      }
    });
    return m;
  }, [interviews, calYear, calMonth]);

  /* ── Modal helpers ──────────────────────────────────────── */
  function openModal(type: ModalType, iv?: InterviewDTO) {
    setSelected(iv ?? null);
    setModalType(type);
    setError(null);
    setNewDate(iv?.scheduledAt.slice(0, 16) ?? "");
    setCancelReason("");
    setFbPublic("");
    setFbRating(4);
    setFbNextStep("Offered");
    setFbInternal("");
  }
  function closeModal() {
    setModalType(null);
    setSelected(null);
    setError(null);
    // setAddForm(emptyForm());
  }

  /* ── API actions ────────────────────────────────────────── */
  async function handleReschedule() {
    if (!selected || !newDate) return;
    setLoading(true);
    try {
      await rescheduleInterview(selected.id, {
        scheduledAt: newDate,
        meetingLink: newMeetingLink || undefined,
      });
      await loadInterviews();
      closeModal();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error rescheduling.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!selected) return;
    setLoading(true);
    try {
      await cancelInterview(selected.id, {
        reason: cancelReason || undefined,
      });
      await loadInterviews();
      closeModal();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error cancelling.");
    } finally {
      setLoading(false);
    }
  }
  type NextStep = "Offered" | "Another Interview" | "Reject";

  async function handleComplete() {
    if (!selected || !fbPublic) return;
    try {
      setLoading(true);
      const payload: any = {
        publicFeedback: fbPublic,
        rating: fbRating,
        nextStep: fbNextStep,
        nextInterview: {
          type: nextType,
          scheduledAt: formatDateWithTimezone(nextScheduledAt),
          meetingLink: nextMeetingLink,
          durationMin: nextDuration,
        },
        offer: {
          offeredSalary: offerSalary,
          startDate: formatDateWithTimezone(offerStart),
          notes: offerNotes,
        },
        reject: {
          reason: fbInternal,
        },
      };
      await completeInterview(selected.id, payload);

      await loadInterviews();
      closeModal();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Error completing interview.");
    } finally {
      setLoading(false);
    }
  }

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="ci-page">
      {/* HEADER */}
      <header className={`ci-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="ci-logo">H</div>
              <span className="ci-brand">Hakeem</span>
            </div>
            <button
              className="ci-btn ci-btn--outline ci-btn--sm"
              onClick={() => navigate("/company")}
            >
              <ChevronLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="ci-main">
        <div className="d-flex align-items-start justify-content-between mb-4 au">
          <div>
            <h1 className="ci-page-title">Interviews</h1>
            <p className="ci-page-sub">
              Manage and track all candidate interview sessions
            </p>
          </div>
          {/* <button
            className="ci-btn ci-btn--primary"
            onClick={() => openModal("add")}
          >
            <Plus size={15} /> Schedule Interview
          </button> */}
        </div>

        {/* KPIs */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Total",
              value: kpis.total,
              hint: "All time",
              icon: <CalendarDays size={16} />,
              ic: "ci-kpi-icon--indigo",
              vc: "ci-kpi-value--indigo",
              card: "ci-kpi--indigo",
            },
            {
              label: "Today",
              value: kpis.today,
              hint: "Interviews today",
              icon: <Clock size={16} />,
              ic: "ci-kpi-icon--amber",
              vc: "ci-kpi-value--amber",
              card: "ci-kpi--amber",
            },
            {
              label: "Upcoming",
              value: kpis.upcoming,
              hint: "Scheduled + Pending",
              icon: <Video size={16} />,
              ic: "ci-kpi-icon--indigo",
              vc: "ci-kpi-value--indigo",
              card: "ci-kpi--indigo",
            },
            {
              label: "Completed",
              value: kpis.completed,
              hint: "Successfully done",
              icon: <CheckCircle size={16} />,
              ic: "ci-kpi-icon--green",
              vc: "ci-kpi-value--green",
              card: "ci-kpi--green",
            },
          ].map((k, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className={`ci-kpi ${k.card} au d${i + 1}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="ci-kpi-label">{k.label}</span>
                  <div className={`ci-kpi-icon ${k.ic}`}>{k.icon}</div>
                </div>
                <div className={`ci-kpi-value ${k.vc}`}>{k.value}</div>
                <div className="ci-kpi-hint">{k.hint}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="ci-filter-bar mb-4 au d2">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <div className="ci-search-wrap">
                <Search size={14} className="ci-search-icon" />
                <input
                  className="ci-input ci-input--search"
                  placeholder="Search candidate, job, type…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="ci-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as InterviewStatus | "All")
                }
              >
                <option value="All">All Statuses</option>
                {(
                  [
                    "Scheduled",
                    "Pending",
                    "Completed",
                    "Rescheduled",
                    "Cancelled",
                  ] as InterviewStatus[]
                ).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              <select
                className="ci-select"
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as InterviewType | "All")
                }
              >
                <option value="All">All Types</option>
                {(
                  ["Technical", "HR", "Final", "Culture Fit"] as InterviewType[]
                ).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-2">
              {(search || statusFilter !== "All" || typeFilter !== "All") && (
                <button
                  className="ci-btn ci-btn--outline ci-btn--sm ci-btn--full"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setTypeFilter("All");
                  }}
                >
                  <X size={12} /> Clear
                </button>
              )}
            </div>
            <div className="col-6 col-md-2 d-flex justify-content-end">
              <div className="ci-view-toggle">
                <button
                  className={`ci-view-btn ${view === "list" ? "ci-view-btn--active" : ""}`}
                  onClick={() => setView("list")}
                >
                  <List size={14} /> List
                </button>
                <button
                  className={`ci-view-btn ${view === "calendar" ? "ci-view-btn--active" : ""}`}
                  onClick={() => setView("calendar")}
                >
                  <Calendar size={14} /> Cal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="d-flex flex-column gap-3 au d3">
            {filtered.length === 0 ? (
              <div className="ci-empty">
                <div className="ci-empty-icon">
                  <CalendarDays size={22} />
                </div>
                <div className="ci-empty-title">No interviews found</div>
                <span style={{ fontSize: ".84rem" }}>
                  Try adjusting filters or schedule a new interview.
                </span>
              </div>
            ) : (
              filtered.map((iv, idx) => (
                <div
                  key={iv.id}
                  className={`${rowClass(iv.status)} au d${Math.min(idx + 1, 6)}`}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="ci-avatar">
                      {companyIntiatal(iv.application.applicant.name)}
                    </div>
                    <div className="flex-1 min-width-0">
                      <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-1">
                        <div>
                          <div className="ci-candidate-name">
                            {iv.application.applicant.name}
                          </div>
                          <div className="ci-job-title">
                            {iv.application.job.title}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="ci-type-pill">
                            {iv.type === "Technical" ? (
                              <BrainCircuit size={11} />
                            ) : iv.type === "HR" ? (
                              <User size={11} />
                            ) : iv.type === "Final" ? (
                              <CheckCircle size={11} />
                            ) : (
                              <Filter size={11} />
                            )}
                            {iv.type}
                          </span>
                          <span className={`ci-badge ${badgeClass(iv.status)}`}>
                            <span className="ci-badge-dot" />
                            {iv.status}
                          </span>
                        </div>
                      </div>
                      <div className="ci-meta mb-2">
                        <span className="ci-meta-item">
                          <CalendarDays size={12} />
                          {fmtDate(iv.scheduledAt)}
                        </span>
                        <span className="ci-meta-item">
                          <Clock size={12} />
                          {fmtTime(iv.scheduledAt)}
                          {/* {endTime(iv.scheduledAt, iv.durationMin)} */}
                        </span>
                        {iv.meetingLink && (
                          <span className="ci-meta-item">
                            <Video size={12} />
                            Online
                          </span>
                        )}
                        {iv.location && (
                          <span className="ci-meta-item">
                            <MapPin size={12} />
                            {iv.location}
                          </span>
                        )}
                      </div>

                      {/* Feedback summary (if completed) */}
                      {iv.status === "Completed" && iv.feedback && (
                        <div
                          style={{
                            background: "rgba(16,185,129,.05)",
                            border: "1px solid rgba(16,185,129,.18)",
                            borderRadius: 10,
                            padding: ".6rem .85rem",
                            marginBottom: ".6rem",
                            fontSize: ".8rem",
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <MessageSquare
                              size={12}
                              style={{ color: "var(--success)" }}
                            />
                            <strong style={{ color: "var(--text)" }}>
                              Feedback submitted
                            </strong>
                            <span
                              style={{
                                marginLeft: "auto",
                                color: "var(--success)",
                                fontFamily: "Syne",
                                fontWeight: 700,
                              }}
                            >
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={11}
                                  fill={
                                    i < iv.feedback!.rating
                                      ? "var(--warning)"
                                      : "none"
                                  }
                                  stroke="var(--warning)"
                                />
                              ))}
                            </span>
                          </div>
                          <p
                            style={{
                              color: "var(--muted)",
                              lineHeight: 1.55,
                              marginBottom: ".3rem",
                            }}
                          >
                            {iv.feedback.publicFeedback}
                          </p>
                          <span
                            style={{
                              background: "rgba(79,70,229,.08)",
                              color: "var(--primary)",
                              border: "1px solid rgba(79,70,229,.18)",
                              borderRadius: 999,
                              padding: ".14rem .6rem",
                              fontFamily: "Syne",
                              fontWeight: 700,
                              fontSize: ".72rem",
                            }}
                          >
                            Next step: {iv.feedback.nextStep}
                          </span>
                        </div>
                      )}

                      {iv.notes && !iv.feedback && (
                        <p
                          style={{
                            fontSize: ".78rem",
                            color: "var(--muted)",
                            marginBottom: ".6rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {iv.notes}
                        </p>
                      )}

                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="ci-row-btn ci-row-btn--outline"
                          onClick={() => openModal("view", iv)}
                        >
                          <Eye size={12} /> View
                        </button>
                        {(iv.status === "Scheduled" ||
                          iv.status === "Rescheduled") && (
                          <>
                            {iv.meetingLink && (
                              <a
                                href={iv.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="ci-row-btn ci-row-btn--primary"
                                style={{ textDecoration: "none" }}
                              >
                                <Video size={12} /> Join
                              </a>
                            )}
                            <button
                              className="ci-row-btn ci-row-btn--success"
                              onClick={() => openModal("complete", iv)}
                            >
                              <CheckCircle size={12} /> Complete
                            </button>
                            <button
                              className="ci-row-btn ci-row-btn--amber"
                              onClick={() => openModal("reschedule", iv)}
                            >
                              <RotateCcw size={12} /> Reschedule
                            </button>
                            <button
                              className="ci-row-btn ci-row-btn--danger"
                              onClick={() => openModal("cancel", iv)}
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* CALENDAR VIEW */}
        {view === "calendar" && (
          <div className="ci-card au d3">
            <div className="ci-card-header">
              <div className="d-flex align-items-center gap-3">
                <button
                  className="ci-cal-nav-btn"
                  onClick={() => {
                    if (calMonth === 0) {
                      setCalMonth(11);
                      setCalYear((y) => y - 1);
                    } else setCalMonth((m) => m - 1);
                    setCalDay(null);
                  }}
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="ci-cal-month">
                  {MONTHS[calMonth]} {calYear}
                </span>
                <button
                  className="ci-cal-nav-btn"
                  onClick={() => {
                    if (calMonth === 11) {
                      setCalMonth(0);
                      setCalYear((y) => y + 1);
                    } else setCalMonth((m) => m + 1);
                    setCalDay(null);
                  }}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
              <button
                className="ci-btn ci-btn--outline ci-btn--sm"
                onClick={() => {
                  setCalYear(TODAY.getFullYear());
                  setCalMonth(TODAY.getMonth());
                  setCalDay(TODAY.getDate());
                }}
              >
                Today
              </button>
            </div>
            <div className="ci-card-body">
              <div className="ci-cal-grid mb-1">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="ci-cal-dow">
                    {d}
                  </div>
                ))}
              </div>
              <div className="ci-cal-grid">
                {Array.from({ length: firstDay(calYear, calMonth) }, (_, i) => (
                  <div
                    key={`e-${i}`}
                    className="ci-cal-day ci-cal-day--empty"
                  />
                ))}
                {Array.from(
                  { length: daysInMonth(calYear, calMonth) },
                  (_, i) => {
                    const day = i + 1,
                      isToday =
                        day === TODAY.getDate() &&
                        calMonth === TODAY.getMonth() &&
                        calYear === TODAY.getFullYear(),
                      isSel = day === calDay,
                      evts = calMap[day] ?? [];
                    return (
                      <div
                        key={day}
                        className={`ci-cal-day ${isToday ? "ci-cal-day--today" : ""} ${isSel ? "ci-cal-day--selected" : ""}`}
                        onClick={() => setCalDay(day === calDay ? null : day)}
                      >
                        <div className="ci-cal-day-num">{day}</div>
                        {evts.slice(0, 2).map((iv) => (
                          <div
                            key={iv.id}
                            className={calEvtClass(iv.status)}
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal("view", iv);
                            }}
                          >
                            {fmtTime(iv.scheduledAt)}{" "}
                            {iv.candidateName.split(" ")[0]}
                          </div>
                        ))}
                        {evts.length > 2 && (
                          <div className="ci-cal-more">
                            +{evts.length - 2} more
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
              {calDay && (calMap[calDay] ?? []).length > 0 && (
                <div className="ci-day-detail mt-4 asd">
                  <div className="ci-day-detail-title">
                    <CalendarDays
                      size={14}
                      style={{
                        marginRight: ".4rem",
                        verticalAlign: "middle",
                        color: "var(--primary)",
                      }}
                    />
                    {MONTHS[calMonth]} {calDay}, {calYear} ·{" "}
                    {(calMap[calDay] ?? []).length} interview(s)
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {(calMap[calDay] ?? []).map((iv) => (
                      <div
                        key={iv.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: "var(--surface)",
                          borderRadius: 10,
                          padding: ".7rem 1rem",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="ci-avatar"
                            style={{ width: 32, height: 32, fontSize: ".7rem" }}
                          >
                            {iv.candidateInitials}
                          </div>
                          <div>
                            <div
                              style={{
                                fontFamily: "Syne",
                                fontWeight: 700,
                                fontSize: ".85rem",
                              }}
                            >
                              {iv.candidateName}
                            </div>
                            <div
                              style={{
                                fontSize: ".74rem",
                                color: "var(--muted)",
                              }}
                            >
                              {fmtTime(iv.scheduledAt)} · {iv.interviewType}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`ci-badge ${badgeClass(iv.status)}`}>
                            <span className="ci-badge-dot" />
                            {iv.status}
                          </span>
                          <button
                            className="ci-row-btn ci-row-btn--outline"
                            onClick={() => openModal("view", iv)}
                          >
                            <Eye size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ═══════════ MODALS ═══════════ */}

      {/* VIEW */}
      <Modal
        open={modalType === "view"}
        onClose={closeModal}
        title="Interview Details"
        icon={<Eye size={15} />}
        size="md"
        footer={
          <button
            className="ci-btn ci-btn--ghost ci-btn--sm"
            onClick={closeModal}
          >
            Close
          </button>
        }
      >
        {selected && (
          <div className="d-flex flex-column gap-3">
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
                border: "1px solid var(--border)",
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="ci-avatar">{selected.candidateInitials}</div>
                <div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {selected.candidateName}
                  </div>
                  <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {selected.jobTitle}
                  </div>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <span className="ci-type-pill">{selected.interviewType}</span>
                <span className={`ci-badge ${badgeClass(selected.status)}`}>
                  <span className="ci-badge-dot" />
                  {selected.status}
                </span>
              </div>
            </div>
            <div className="row g-2">
              {[
                {
                  label: "Date & Time",
                  val: fmtDate(selected.scheduledAt),
                  icon: <CalendarDays size={13} />,
                },
                {
                  label: "Duration",
                  val: `${selected.durationMins} minutes`,
                  icon: <Clock size={13} />,
                },

                ...(selected.meetingLink
                  ? [
                      {
                        label: "Meeting Link",
                        val: selected.meetingLink,
                        icon: <Link size={13} />,
                      },
                    ]
                  : []),
                ...(selected.location
                  ? [
                      {
                        label: "Location",
                        val: selected.location,
                        icon: <MapPin size={13} />,
                      },
                    ]
                  : []),
              ].map((row) => (
                <div key={row.label} className="col-12">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: ".6rem",
                      fontSize: ".86rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--muted)",
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {row.icon}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: ".7rem",
                          color: "var(--muted)",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: ".04em",
                          marginBottom: ".1rem",
                        }}
                      >
                        {row.label}
                      </div>
                      <div
                        style={{ color: "var(--text)", wordBreak: "break-all" }}
                      >
                        {row.val}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {selected.feedback && (
              <div
                style={{
                  background: "rgba(16,185,129,.05)",
                  borderRadius: 11,
                  padding: ".9rem 1rem",
                  border: "1px solid rgba(16,185,129,.18)",
                }}
              >
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 700,
                    fontSize: ".85rem",
                    marginBottom: ".4rem",
                    color: "var(--text)",
                  }}
                >
                  Interview Feedback
                </div>
                <p
                  style={{
                    fontSize: ".84rem",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    marginBottom: ".5rem",
                  }}
                >
                  {selected.feedback.publicFeedback}
                </p>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={
                          i < selected.feedback!.rating
                            ? "var(--warning)"
                            : "none"
                        }
                        stroke="var(--warning)"
                      />
                    ))}
                  </span>
                  <span
                    style={{
                      background: "rgba(79,70,229,.08)",
                      color: "var(--primary)",
                      border: "1px solid rgba(79,70,229,.18)",
                      borderRadius: 999,
                      padding: ".14rem .65rem",
                      fontFamily: "Syne",
                      fontWeight: 700,
                      fontSize: ".72rem",
                      display: "flex",
                      alignItems: "center",
                      gap: ".3rem",
                    }}
                  >
                    <ArrowRight size={11} /> Next: {selected.feedback.nextStep}
                  </span>
                </div>
              </div>
            )}
            {(selected.status === "Scheduled" ||
              selected.status === "Rescheduled") && (
              <div className="d-flex gap-2 flex-wrap">
                {selected.meetingLink && (
                  <a
                    href={selected.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="ci-btn ci-btn--primary ci-btn--sm"
                    style={{ textDecoration: "none" }}
                  >
                    <Video size={13} /> Join
                  </a>
                )}
                <button
                  className="ci-btn ci-btn--success ci-btn--sm"
                  onClick={() => {
                    closeModal();
                    setTimeout(() => openModal("complete", selected), 100);
                  }}
                >
                  <CheckCircle size={13} /> Complete
                </button>
                <button
                  className="ci-btn ci-btn--amber   ci-btn--sm"
                  onClick={() => {
                    closeModal();
                    setTimeout(() => openModal("reschedule", selected), 100);
                  }}
                >
                  <RotateCcw size={13} /> Reschedule
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* COMPLETE + FEEDBACK ── feeds ApplicantInterviews */}
      <Modal
        open={modalType === "complete"}
        onClose={closeModal}
        title="Complete Interview & Add Feedback"
        icon={<MessageSquare size={15} />}
        size="md"
        footer={
          <>
            <button
              className="ci-btn ci-btn--ghost ci-btn--sm"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ci-btn ci-btn--success ci-btn--sm"
              onClick={handleComplete}
              disabled={!fbPublic || loading}
              style={{ opacity: fbPublic && !loading ? 1 : 0.45 }}
            >
              <CheckCircle size={13} />
              {loading ? "Saving…" : "Submit Feedback"}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          {/* Info note */}
          <div
            style={{
              fontSize: ".84rem",
              color: "var(--muted)",
              background: "var(--surface)",
              borderRadius: 10,
              padding: ".8rem 1rem",
              border: "1px solid var(--border)",
            }}
          >
            <strong style={{ color: "var(--text)" }}>Note: </strong>
            The public feedback and next step will be{" "}
            <strong>visible to the candidate</strong> in their Interviews page.
          </div>

          {/* Rating */}
          <div>
            <label className="ci-label">Rating</label>
            <div className="d-flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFbRating(n as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <Star
                    size={22}
                    fill={n <= fbRating ? "var(--warning)" : "none"}
                    stroke="var(--warning)"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Public feedback */}
          <div className="ci-field">
            <label className="ci-label">
              Public Feedback <span style={{ color: "var(--danger)" }}>*</span>{" "}
              <span
                style={{
                  color: "var(--muted)",
                  fontWeight: 400,
                  textTransform: "none",
                }}
              >
                (visible to candidate)
              </span>
            </label>
            <textarea
              className="ci-textarea"
              placeholder="Describe the candidate's performance, strengths, and areas for improvement…"
              value={fbPublic}
              onChange={(e) => setFbPublic(e.target.value)}
            />
          </div>

          {/* ── Next Step ── */}
          <div className="ci-field">
            <label className="ci-label">
              Next Step <span style={{ color: "var(--danger)" }}>*</span>
            </label>

            {/* Segmented / tab-style picker */}
            <div
              style={{
                display: "flex",
                gap: ".5rem",
                marginTop: ".4rem",
                flexWrap: "wrap",
              }}
            >
              {(["Offered", "Another Interview", "Reject"] as NextStep[]).map(
                (opt) => {
                  const active = fbNextStep === opt;
                  const color =
                    opt === "Offered"
                      ? "var(--success)"
                      : opt === "Reject"
                        ? "var(--danger)"
                        : "var(--primary)";
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFbNextStep(opt)}
                      style={{
                        flex: 1,
                        minWidth: 110,
                        padding: ".55rem .9rem",
                        borderRadius: 10,
                        border: `1.5px solid ${active ? color : "var(--border)"}`,
                        background: active
                          ? opt === "Offered"
                            ? "rgba(16,185,129,.08)"
                            : opt === "Reject"
                              ? "rgba(239,68,68,.07)"
                              : "rgba(79,70,229,.08)"
                          : "var(--surface)",
                        color: active ? color : "var(--muted)",
                        fontFamily: "Syne",
                        fontWeight: 700,
                        fontSize: ".82rem",
                        cursor: "pointer",
                        transition: "all .18s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: ".35rem",
                      }}
                    >
                      {opt === "Offered" && <CheckCircle size={13} />}
                      {opt === "Another Interview" && <RotateCcw size={13} />}
                      {opt === "Reject" && <XCircle size={13} />}
                      {opt}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* ── Offer sub-fields ── */}
          {fbNextStep === "Offered" && (
            <div
              style={{
                background: "rgba(16,185,129,.04)",
                border: "1px solid rgba(16,185,129,.18)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
              }}
            >
              <p
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".78rem",
                  color: "var(--success)",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: ".75rem",
                }}
              >
                Offer Details
              </p>
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div className="ci-field">
                    <label className="ci-label">Offered Salary</label>
                    <input
                      className="ci-input"
                      placeholder="e.g. $90,000 / year"
                      value={offerSalary}
                      onChange={(e) => setOfferSalary(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="ci-field">
                    <label className="ci-label">Start Date</label>
                    <input
                      className="ci-input"
                      type="date"
                      value={offerStart}
                      onChange={(e) => setOfferStart(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="ci-field">
                    <label className="ci-label">Offer Notes</label>
                    <textarea
                      className="ci-textarea"
                      placeholder="Any additional offer details…"
                      value={offerNotes}
                      onChange={(e) => setOfferNotes(e.target.value)}
                      style={{ minHeight: 70 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Another Interview sub-fields ── */}
          {fbNextStep === "Another Interview" && (
            <div
              style={{
                background: "rgba(79,70,229,.04)",
                border: "1px solid rgba(79,70,229,.18)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
              }}
            >
              <p
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".78rem",
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: ".05em",
                  marginBottom: ".75rem",
                }}
              >
                Next Interview Details
              </p>
              <div className="row g-2">
                <div className="col-12 col-sm-6">
                  <div className="ci-field">
                    <label className="ci-label">Interview Type</label>
                    <select
                      className="ci-select"
                      value={nextType}
                      onChange={(e) => setNextType(e.target.value)}
                    >
                      <option value="">Select Interview Type</option>
                      {["Technical", "HR", "Final", "Culture Fit"].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="ci-field">
                    <label className="ci-label">Scheduled At</label>
                    <input
                      className="ci-input"
                      type="datetime-local"
                      value={nextScheduledAt}
                      onChange={(e) => setNextScheduledAt(e.target.value)}
                    />
                  </div>
                  <div className="ci-field">
                    <label className="ci-label">Duration (minutes)</label>
                    <input
                      className="ci-input"
                      type="number"
                      value={nextDuration}
                      onChange={(e) => setNextDuration(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="ci-field">
                    <label className="ci-label">Meeting Link</label>
                    <input
                      className="ci-input"
                      type="url"
                      placeholder="https://meet.google.com/…"
                      value={nextMeetingLink}
                      onChange={(e) => setNextMeetingLink(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Internal note */}
          {fbNextStep === "Reject" && (
            <div className="ci-field">
              <label className="ci-label">
                Internal Note{" "}
                <span
                  style={{
                    color: "var(--muted)",
                    fontWeight: 400,
                    textTransform: "none",
                  }}
                >
                  (recruiter-only)
                </span>
              </label>
              <textarea
                className="ci-textarea"
                placeholder="Private notes not shared with the candidate…"
                value={fbInternal}
                onChange={(e) => setFbInternal(e.target.value)}
                style={{ minHeight: 70 }}
              />
            </div>
          )}

          {error && (
            <p style={{ color: "var(--danger)", fontSize: ".8rem" }}>{error}</p>
          )}
        </div>
      </Modal>

      {/* RESCHEDULE */}
      <Modal
        open={modalType === "reschedule"}
        onClose={closeModal}
        title="Reschedule Interview"
        icon={<RotateCcw size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="ci-btn ci-btn--ghost ci-btn--sm"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="ci-btn ci-btn--primary ci-btn--sm"
              onClick={handleReschedule}
              disabled={!newDate || loading}
              style={{ opacity: newDate && !loading ? 1 : 0.45 }}
            >
              <Save size={13} />
              {loading ? "Saving…" : "Confirm"}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>
            Rescheduling interview for{" "}
            <strong style={{ color: "var(--text)" }}>
              {selected?.candidateName}
            </strong>
            . The candidate will be notified.
          </div>
          <div className="ci-field">
            <label className="ci-label">
              New Date & Time <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              className="ci-input"
              type="datetime-local"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="ci-field">
            <label className="ci-label">
              Meeting Link <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              className="ci-input"
              type="url"
              placeholder="https://meet.google.com/…"
              value={newMeetingLink}
              onChange={(e) => setNewMeetingLink(e.target.value)}
            />
          </div>

          {error && (
            <p style={{ color: "var(--danger)", fontSize: ".8rem" }}>{error}</p>
          )}
        </div>
      </Modal>

      {/* CANCEL */}
      <Modal
        open={modalType === "cancel"}
        onClose={closeModal}
        title="Cancel Interview"
        icon={<XCircle size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="ci-btn ci-btn--ghost ci-btn--sm"
              onClick={closeModal}
              disabled={loading}
            >
              Go Back
            </button>
            <button
              className="ci-btn ci-btn--danger ci-btn--sm"
              onClick={handleCancel}
              disabled={loading}
              style={{ opacity: loading ? 0.45 : 1 }}
            >
              <XCircle size={13} />
              {loading ? "Cancelling…" : "Cancel Interview"}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          <div
            style={{
              background: "rgba(239,68,68,.05)",
              border: "1px solid rgba(239,68,68,.18)",
              borderRadius: 11,
              padding: ".9rem 1rem",
              fontSize: ".85rem",
              lineHeight: 1.65,
            }}
          >
            <AlertTriangle
              size={14}
              style={{
                color: "var(--danger)",
                marginRight: ".4rem",
                verticalAlign: "middle",
              }}
            />
            Cancelling interview with <strong>{selected?.candidateName}</strong>
            . This cannot be undone.
          </div>
          <div className="ci-field">
            <label className="ci-label">Reason (optional)</label>
            <textarea
              className="ci-textarea"
              placeholder="Internal reason…"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          {error && (
            <p style={{ color: "var(--danger)", fontSize: ".8rem" }}>{error}</p>
          )}
        </div>
      </Modal>

      {/* ADD NEW */}
    </div>
  );
}
