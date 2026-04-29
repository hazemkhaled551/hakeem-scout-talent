import { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import {
  Video,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BrainCircuit,
  User,
  Building2,
  CalendarDays,
  ExternalLink,
  AlertTriangle,
  Star,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  Clock3,
  DollarSign,
} from "lucide-react";
import Modal from "../../../components/Modal/Modal";
import "./Applicantinterviews.css";
import {
  getApplicantInterviews,
  applicantCancelInterview,
} from "../../../services/interviewService";
import {
  companyIntiatal,
  fmtDate,
  fmtTime,
  fmtDateLong,
} from "../../../utils/format";

import {
  type ExtendedInterviewDTO,
  type InterviewStatus,
  type InterviewType,
  type OfferResponse,
} from "../../../types/interview";

/* ════════════════════════════════════════════════════════════
        TYPES
      ════════════════════════════════════════════════════════════ */

type ModalType = "view" | "cancel" | "feedback" | "offer" | null;

/* ════════════════════════════════════════════════════════════
        HELPERS
      ════════════════════════════════════════════════════════════ */
function badgeClass(s: InterviewStatus) {
  const m: Record<InterviewStatus, string> = {
    Scheduled: "ai-badge--scheduled",
    Completed: "ai-badge--completed",
    Cancelled: "ai-badge--cancelled",

    Rescheduled: "ai-badge--rescheduled",
  };
  return m[s];
}
function cardClass(s: InterviewStatus) {
  return `ai-card ai-card--${s.toLowerCase()}`;
}

function countdown(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
  };
}
const typeIcon = (t: InterviewType): React.ReactNode =>
  ({
    Technical: <BrainCircuit size={11} />,
    HR: <User size={11} />,
    Final: <CheckCircle size={11} />,
    "Culture Fit": <Building2 size={11} />,
  })[t];

function isUpcoming(iv: ExtendedInterviewDTO) {
  return iv.status === "Scheduled" || iv.status === "Rescheduled";
}

function nextStepColor(ns?: string) {
  if (!ns) return {};
  const m: Record<string, { bg: string; color: string; border: string }> = {
    Offer: {
      bg: "rgba(16,185,129,.1)",
      color: "#065f46",
      border: "1px solid rgba(16,185,129,.25)",
    },
    Reject: {
      bg: "rgba(239,68,68,.08)",
      color: "#991b1b",
      border: "1px solid rgba(239,68,68,.2)",
    },
    "Another Interview": {
      bg: "rgba(79,70,229,.08)",
      color: "var(--primary)",
      border: "1px solid rgba(79,70,229,.2)",
    },
    Hold: {
      bg: "rgba(245,158,11,.08)",
      color: "#92400e",
      border: "1px solid rgba(245,158,11,.2)",
    },
  };
  return m[ns] ?? {};
}

/* ════════════════════════════════════════════════════════════
        COMPONENT
      ════════════════════════════════════════════════════════════ */
export default function ApplicantInterviews() {
  // const navigate = useNavigate();

  const [interviews, setInterviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selected, setSelected] = useState<any | null>(null);

  const [cancelReason, setCancelReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Offer response state
  const [offerAction, setOfferAction] = useState<OfferResponse>(null);
  const [offerLoading, setOfferLoading] = useState(false);

  useEffect(() => {
    loadInterviews();
  }, []);

  async function loadInterviews() {
    try {
      const { data } = await getApplicantInterviews();
      setInterviews((data.data.interviews as ExtendedInterviewDTO[]) ?? []);
    } catch (error: any) {
      console.error("Failed to load interviews:", error.message || error);
    }
  }

  /* ── Derived ─────────────────────────────────────────────── */
  const upcoming = useMemo(
    () =>
      interviews
        .filter(isUpcoming)
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
    [interviews],
  );
  const past = useMemo(
    () =>
      interviews
        .filter((iv) => !isUpcoming(iv))
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime(),
        ),
    [interviews],
  );

  const nextIv = upcoming[0] ?? null;
  const ct = nextIv ? countdown(nextIv.scheduledAt) : null;

  const newFeedbackCount = past.filter(
    (iv) => iv.status === "Completed" && iv.feedback,
  ).length;

  /* pending offer count — offer received but no response yet */
  const pendingOfferCount = past.filter(
    (iv) =>
      iv.status === "Completed" &&
      iv.feedback?.nextStep === "Offer" &&
      !iv.feedback?.offerResponse,
  ).length;

  /* ── Checklist ───────────────────────────────────────────── */

  /* ── Modal helpers ───────────────────────────────────────── */
  function openModal(type: ModalType, iv: ExtendedInterviewDTO) {
    setSelected(iv);
    setModalType(type);
    setCancelReason("");
    // reset offer state on each open
    setOfferAction(iv.feedback?.offerResponse ?? null);
  }
  function closeModal() {
    setModalType(null);
    setSelected(null);
    setOfferAction(null);
  }

  /* ── Cancel ─────────────────────────────────────────────── */
  async function handleCantAttend() {
    if (!selected) return;
    setLoading(true);
    try {
      await applicantCancelInterview(selected.id, cancelReason || undefined);
      await loadInterviews();
      closeModal();
    } catch {
      setInterviews((p) =>
        p.map((iv) =>
          iv.id === selected.id
            ? { ...iv, status: "Cancelled" as InterviewStatus }
            : iv,
        ),
      );
      closeModal();
    } finally {
      setLoading(false);
    }
  }

  /* ── Offer response ──────────────────────────────────────── */
  async function handleOfferResponse(action: "accept" | "rejected") {
    if (!selected) return;
    setOfferLoading(true);
    try {
      // TODO: await respondToOffer(selected.id, action);
      // Optimistic update
      setInterviews((p) =>
        p.map((iv) =>
          iv.id === selected.id && iv.feedback
            ? { ...iv, feedback: { ...iv.feedback, offerResponse: action } }
            : iv,
        ),
      );
      setOfferAction(action);
    } catch (e) {
      console.error(e);
    } finally {
      setOfferLoading(false);
    }
  }

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="ai-page">
      {/* HEADER */}
   

      <main className="ai-main">
        <div className="mb-4 au">
          <h1 className="ai-page-title">My Interviews</h1>
          <p className="ai-page-sub">
            Track all your sessions, prepare effectively, and review recruiter
            feedback
          </p>
        </div>

        {/* KPIs */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Upcoming",
              value: upcoming.length,
              hint: "Scheduled + Pending",
              icon: <CalendarDays size={15} />,
              ic: "ai-kpi-icon--indigo",
              vc: "ai-kpi-value--indigo",
              card: "ai-kpi--indigo",
            },
            {
              label: "Next In",
              value: ct ? `${ct.d}d ${ct.h}h` : "—",
              hint: nextIv?.company?.name ?? "No upcoming",
              icon: <Clock size={15} />,
              ic: "ai-kpi-icon--amber",
              vc: "ai-kpi-value--amber",
              card: "ai-kpi--amber",
            },
            {
              label: "Completed",
              value: past.filter((i) => i.status === "Completed").length,
              hint: "Successfully attended",
              icon: <CheckCircle size={15} />,
              ic: "ai-kpi-icon--green",
              vc: "ai-kpi-value--green",
              card: "ai-kpi--green",
            },
            {
              label: "New Feedback",
              value: newFeedbackCount,
              hint: "From recruiters",
              icon: <MessageSquare size={15} />,
              ic: "ai-kpi-icon--cyan",
              vc: "ai-kpi-value--cyan",
              card: "ai-kpi--cyan",
            },
          ].map((k, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className={`ai-kpi ${k.card} au d${i + 1}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="ai-kpi-label">{k.label}</span>
                  <div className={`ai-kpi-icon ${k.ic}`}>{k.icon}</div>
                </div>
                <div className={`ai-kpi-value ${k.vc}`}>{k.value}</div>
                <div className="ai-kpi-hint">{k.hint}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pending offer banner */}
        {pendingOfferCount > 0 && (
          <div
            className="mb-4 au d1"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,.08), rgba(6,182,212,.06))",
              border: "1px solid rgba(16,185,129,.25)",
              borderRadius: 14,
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontSize: "1.3rem" }}>🎉</span>
              <div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: ".92rem",
                    color: "#065f46",
                  }}
                >
                  You have {pendingOfferCount} pending offer
                  {pendingOfferCount > 1 ? "s" : ""}!
                </div>
                <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
                  Review and respond to your offer
                  {pendingOfferCount > 1 ? "s" : ""} in the Past tab.
                </div>
              </div>
            </div>
            <button
              className="ai-btn ai-btn--sm"
              style={{
                background: "var(--success)",
                color: "#fff",
                border: "none",
                flexShrink: 0,
              }}
              onClick={() => setActiveTab("past")}
            >
              View Offer{pendingOfferCount > 1 ? "s" : ""} →
            </button>
          </div>
        )}

        {/* Next interview countdown banner */}
        {nextIv && (
          <div className="ai-next-banner mb-4 au d2">
            <div className="ai-next-label">Next Interview</div>
            <div className="ai-next-title">{nextIv.application.job.title}</div>
            <div className="ai-next-company d-flex align-items-center gap-1">
              <Building2 size={13} /> {nextIv?.application?.job?.company?.name}
              <span className="ai-type-pill ms-2">
                {typeIcon(nextIv.type)}
                {nextIv.type}
              </span>
            </div>
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mt-1">
              <div>
                <div className="ai-next-meta mb-3">
                  <span className="ai-next-meta-item">
                    <CalendarDays size={13} />
                    {fmtDate(nextIv.scheduledAt)}
                  </span>
                  <span className="ai-next-meta-item">
                    <Clock size={13} />
                    {fmtTime(nextIv.scheduledAt)}
                  </span>
                  {nextIv.meetingLink && (
                    <span className="ai-next-meta-item">
                      <Video size={13} />
                      Online
                    </span>
                  )}
                  {nextIv.location && (
                    <span className="ai-next-meta-item">
                      <MapPin size={13} />
                      {nextIv.location}
                    </span>
                  )}
                </div>
                {ct && (
                  <div className="ai-countdown">
                    <div className="ai-countdown-unit">
                      <span className="ai-countdown-num">{ct.d}</span>
                      <span className="ai-countdown-label">Days</span>
                    </div>
                    <span className="ai-countdown-sep">:</span>
                    <div className="ai-countdown-unit">
                      <span className="ai-countdown-num">{ct.h}</span>
                      <span className="ai-countdown-label">Hours</span>
                    </div>
                    <span className="ai-countdown-sep">:</span>
                    <div className="ai-countdown-unit">
                      <span className="ai-countdown-num">{ct.m}</span>
                      <span className="ai-countdown-label">Mins</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="d-flex flex-column gap-2 align-items-start align-items-sm-end">
                {nextIv.meetingLink && (
                  <a
                    href={nextIv.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="ai-join-btn"
                    style={{ textDecoration: "none" }}
                  >
                    <Video size={16} /> Join Interview
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="ai-tabs mb-4 au d3">
          <button
            className={`ai-tab ${activeTab === "upcoming" ? "ai-tab--active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming{" "}
            {upcoming.length > 0 && (
              <span className="ai-tab-count">{upcoming.length}</span>
            )}
          </button>
          <button
            className={`ai-tab ${activeTab === "past" ? "ai-tab--active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past{" "}
            {past.length > 0 && (
              <span className="ai-tab-count">{past.length}</span>
            )}
            {pendingOfferCount > 0 && activeTab !== "past" && (
              <span
                className="ai-tab-count"
                style={{ background: "var(--success)", color: "#fff" }}
              >
                {pendingOfferCount} offer{pendingOfferCount > 1 ? "s" : ""}
              </span>
            )}
          </button>
        </div>

        {/* Interview list */}
        {(activeTab === "upcoming" ? upcoming : past).length === 0 ? (
          <div className="ai-empty au">
            <div className="ai-empty-icon">
              <CalendarDays size={22} />
            </div>
            <div className="ai-empty-title">
              {activeTab === "upcoming"
                ? "No upcoming interviews"
                : "No past interviews"}
            </div>
            <span style={{ fontSize: ".84rem" }}>
              {activeTab === "upcoming"
                ? "Keep applying — interviews will show up here."
                : "Completed and cancelled interviews will appear here."}
            </span>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {(activeTab === "upcoming" ? upcoming : past).map((iv, idx) => (
              <div
                key={iv.id}
                className={`${cardClass(iv.status)} au d${Math.min(idx + 1, 6)}`}
              >
                <div className="d-flex align-items-start gap-3 mb-3">
                  <div className="ai-company-logo">
                    {companyIntiatal(iv?.application?.job?.company?.name)}
                  </div>
                  <div className="flex-1 min-width-0">
                    <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap mb-1">
                      <div>
                        <div className="ai-card-job">
                          {iv.application.job.title}
                        </div>
                        <div className="ai-card-company d-flex align-items-center gap-1">
                          <Building2 size={12} />{" "}
                          {iv?.application?.job?.company?.name}
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="ai-type-pill">
                          {typeIcon(iv.type)}
                          {iv.type}
                        </span>
                        <span className={`ai-badge ${badgeClass(iv.status)}`}>
                          <span className="ai-badge-dot" />
                          {iv.status}
                        </span>
                      </div>
                    </div>
                    <div className="ai-meta-row mb-2">
                      <span className="ai-meta-item">
                        <CalendarDays size={12} />
                        {fmtDate(iv.scheduledAt)}
                      </span>
                      <span className="ai-meta-item">
                        <Clock size={12} />
                        {fmtTime(iv.scheduledAt)}
                      </span>
                      {iv.meetingLink && (
                        <span className="ai-meta-item">
                          <Video size={12} />
                          Online
                        </span>
                      )}
                      {iv.location && (
                        <span className="ai-meta-item">
                          <MapPin size={12} />
                          {iv.location}
                        </span>
                      )}
                      <span className="ai-meta-item">
                        <User size={12} />
                        {iv.interviewerName}
                      </span>
                    </div>
                    {iv.notes && (
                      <p
                        style={{
                          fontSize: ".78rem",
                          color: "var(--muted)",
                          lineHeight: 1.55,
                          marginBottom: ".65rem",
                        }}
                      >
                        {iv.notes}
                      </p>
                    )}

                    {/* ── FEEDBACK CARD ── */}
                    {iv.status === "Completed" && iv.feedback && (
                      <div
                        style={{
                          background: "rgba(79,70,229,.04)",
                          border: "1px solid rgba(79,70,229,.15)",
                          borderRadius: 12,
                          padding: ".9rem 1rem",
                          marginBottom: ".75rem",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <MessageSquare
                            size={14}
                            style={{ color: "var(--primary)" }}
                          />
                          <span
                            style={{
                              fontFamily: "Syne",
                              fontWeight: 700,
                              fontSize: ".85rem",
                            }}
                          >
                            Recruiter Feedback
                          </span>
                          <span
                            style={{
                              display: "flex",
                              gap: 2,
                              marginLeft: "auto",
                            }}
                          >
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={12}
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
                            fontSize: ".83rem",
                            color: "var(--muted)",
                            lineHeight: 1.65,
                            marginBottom: ".65rem",
                          }}
                        >
                          {iv.feedback.publicFeedback}
                        </p>

                        {/* Next step badge */}
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span
                            style={{
                              fontSize: ".72rem",
                              color: "var(--muted)",
                              fontWeight: 600,
                            }}
                          >
                            Next step:
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: ".3rem",
                              borderRadius: 999,
                              padding: ".16rem .72rem",
                              fontFamily: "Syne",
                              fontWeight: 700,
                              fontSize: ".74rem",
                              ...nextStepColor(iv.feedback.nextStep),
                            }}
                          >
                            {iv.feedback.nextStep === "Offer" && (
                              <ThumbsUp size={11} />
                            )}
                            {iv.feedback.nextStep === "Reject" && (
                              <XCircle size={11} />
                            )}
                            {iv.feedback.nextStep === "Another Interview" && (
                              <Clock3 size={11} />
                            )}
                            {iv.feedback.nextStep === "Hold" && (
                              <Clock3 size={11} />
                            )}
                            {iv.feedback.nextStep}
                          </span>
                        </div>

                        {/* ── Offer response status strip ── */}
                        {iv.feedback.nextStep === "Offer" && (
                          <div style={{ marginTop: ".75rem" }}>
                            {!iv.feedback.offerResponse ? (
                              /* Pending — show salary preview + CTA */
                              <div
                                style={{
                                  background:
                                    "linear-gradient(135deg, rgba(16,185,129,.07), rgba(6,182,212,.05))",
                                  border: "1px solid rgba(16,185,129,.2)",
                                  borderRadius: 10,
                                  padding: ".7rem .9rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: ".75rem",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: ".7rem",
                                      color: "var(--muted)",
                                      fontWeight: 600,
                                      textTransform: "uppercase",
                                      letterSpacing: ".04em",
                                      marginBottom: ".2rem",
                                    }}
                                  >
                                    Offer awaiting your response
                                  </div>
                                  {iv.feedback.offer?.offeredSalary && (
                                    <div
                                      style={{
                                        fontFamily: "Syne",
                                        fontWeight: 800,
                                        fontSize: ".92rem",
                                        color: "#065f46",
                                      }}
                                    >
                                      {iv.feedback.offer.offeredSalary}
                                    </div>
                                  )}
                                </div>
                                <button
                                  className="ai-act-btn"
                                  style={{
                                    background: "var(--success)",
                                    color: "#fff",
                                    border: "none",
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                  onClick={() => openModal("offer", iv)}
                                >
                                  <CheckCircle size={12} /> Review Offer
                                </button>
                              </div>
                            ) : iv.feedback.offerResponse === "accept" ? (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: ".4rem",
                                  fontSize: ".78rem",
                                  color: "#065f46",
                                  fontWeight: 700,
                                  fontFamily: "Syne",
                                }}
                              >
                                <CheckCircle size={13} /> Offer accepted
                              </div>
                            ) : (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: ".4rem",
                                  fontSize: ".78rem",
                                  color: "#991b1b",
                                  fontWeight: 700,
                                  fontFamily: "Syne",
                                }}
                              >
                                <XCircle size={13} /> Offer declined
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="ai-act-btn ai-act-btn--outline"
                        onClick={() => openModal("view", iv)}
                      >
                        <Eye size={12} /> View Details
                      </button>
                      {isUpcoming(iv) && (
                        <>
                          {iv.meetingLink && (
                            <a
                              href={iv.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="ai-act-btn ai-act-btn--primary"
                              style={{ textDecoration: "none" }}
                            >
                              <Video size={12} /> Join
                            </a>
                          )}

                          <button
                            className="ai-act-btn ai-act-btn--danger"
                            onClick={() => openModal("cancel", iv)}
                          >
                            <XCircle size={12} /> Can't Attend
                          </button>
                        </>
                      )}
                      {iv.status === "Completed" && iv.feedback && (
                        <button
                          className="ai-act-btn ai-act-btn--outline"
                          onClick={() => openModal("feedback", iv)}
                        >
                          <MessageSquare size={12} /> Full Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════════════════ */}

      {/* VIEW DETAILS */}
      <Modal
        open={modalType === "view"}
        onClose={closeModal}
        title="Interview Details"
        icon={<Eye size={15} />}
        size="md"
        footer={
          <div className="d-flex gap-2 flex-wrap">
            {selected?.meetingLink && isUpcoming(selected) && (
              <a
                href={selected.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="ai-btn ai-btn--primary ai-btn--sm"
                style={{ textDecoration: "none" }}
              >
                <Video size={13} /> Join Interview
              </a>
            )}
            <button
              className="ai-btn ai-btn--ghost ai-btn--sm"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
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
                <div className="ai-company-logo">{selected.companyInitial}</div>
                <div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {selected.jobTitle}
                  </div>
                  <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {selected?.company?.name}
                  </div>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <span className="ai-type-pill">
                  {typeIcon(selected.interviewType)}
                  {selected.interviewType}
                </span>
                <span className={`ai-badge ${badgeClass(selected.status)}`}>
                  <span className="ai-badge-dot" />
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
                {
                  label: "Interviewer",
                  val: selected.interviewerName,
                  icon: <User size={13} />,
                },
                ...(selected.meetingLink
                  ? [
                      {
                        label: "Meeting Link",
                        val: selected.meetingLink,
                        icon: <ExternalLink size={13} />,
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
            {selected?.notes && (
              <div
                style={{
                  background: "rgba(79,70,229,.05)",
                  borderRadius: 10,
                  padding: ".8rem 1rem",
                  border: "1px solid rgba(79,70,229,.12)",
                  fontSize: ".84rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                <strong
                  style={{
                    color: "var(--text)",
                    display: "block",
                    marginBottom: ".2rem",
                  }}
                >
                  Notes from recruiter
                </strong>
                {selected?.notes}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* FULL FEEDBACK VIEW */}
      <Modal
        open={modalType === "feedback"}
        onClose={closeModal}
        title="Interview Feedback"
        icon={<MessageSquare size={15} />}
        size="md"
        footer={
          <button
            className="ai-btn ai-btn--ghost ai-btn--sm"
            onClick={closeModal}
          >
            Close
          </button>
        }
      >
        {selected?.feedback && (
          <div className="d-flex flex-column gap-3">
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".9rem",
                  marginBottom: ".4rem",
                }}
              >
                {selected.jobTitle} · {selected.company.name}
              </div>
              <div
                style={{
                  fontSize: ".8rem",
                  color: "var(--muted)",
                  marginBottom: ".5rem",
                }}
              >
                {fmtDate(selected.scheduledAt)} · {selected.interviewType}
              </div>
              <div className="d-flex align-items-center gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={
                      i < selected.feedback!.rating ? "var(--warning)" : "none"
                    }
                    stroke="var(--warning)"
                  />
                ))}
                <span
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 700,
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    marginLeft: ".3rem",
                  }}
                >
                  {selected.feedback.rating}/5
                </span>
              </div>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".82rem",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  marginBottom: ".5rem",
                }}
              >
                Feedback
              </p>
              <p
                style={{
                  fontSize: ".9rem",
                  color: "var(--text)",
                  lineHeight: 1.75,
                }}
              >
                {selected.feedback.publicFeedback}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".82rem",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  marginBottom: ".5rem",
                }}
              >
                What's Next
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".4rem",
                  borderRadius: 12,
                  padding: ".65rem 1rem",
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".88rem",
                  ...nextStepColor(selected.feedback.nextStep),
                }}
              >
                <ArrowRight size={14} />
                {selected.feedback.nextStep === "Offer" && "🎉 "}
                {selected.feedback.nextStep}
              </div>
              {selected.feedback.nextStep === "Offer" && (
                <p
                  style={{
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    marginTop: ".5rem",
                    lineHeight: 1.6,
                  }}
                >
                  Great news! The recruiter has extended an offer. Review and
                  respond below.
                </p>
              )}
              {selected.feedback.nextStep === "Another Interview" && (
                <p
                  style={{
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    marginTop: ".5rem",
                    lineHeight: 1.6,
                  }}
                >
                  You'll be invited to another interview. Keep an eye on your
                  interviews page.
                </p>
              )}
              {selected.feedback.nextStep === "Hold" && (
                <p
                  style={{
                    fontSize: ".82rem",
                    color: "var(--muted)",
                    marginTop: ".5rem",
                    lineHeight: 1.6,
                  }}
                >
                  Your application is on hold. The recruiter will get back to
                  you soon.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── OFFER MODAL ────────────────────────────────────── */}
      <Modal
        open={modalType === "offer"}
        onClose={closeModal}
        title="Job Offer"
        icon={<ThumbsUp size={15} />}
        size="md"
        footer={
          offerAction ? (
            <button
              className="ai-btn ai-btn--ghost ai-btn--sm"
              onClick={closeModal}
            >
              Close
            </button>
          ) : (
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="ai-btn ai-btn--ghost ai-btn--sm"
                onClick={closeModal}
                disabled={offerLoading}
              >
                Decide Later
              </button>
              <button
                className="ai-btn ai-btn--sm"
                style={{
                  background: "rgba(239,68,68,.08)",
                  color: "#991b1b",
                  border: "1px solid rgba(239,68,68,.2)",
                  opacity: offerLoading ? 0.45 : 1,
                }}
                onClick={() => handleOfferResponse("rejected")}
                disabled={offerLoading}
              >
                <XCircle size={13} />
                {offerLoading ? "…" : "Decline"}
              </button>
              <button
                className="ai-btn ai-btn--sm"
                style={{
                  background: "var(--success)",
                  color: "#fff",
                  border: "none",
                  opacity: offerLoading ? 0.45 : 1,
                }}
                onClick={() => handleOfferResponse("accept")}
                disabled={offerLoading}
              >
                <CheckCircle size={13} />
                {offerLoading ? "…" : "Accept Offer"}
              </button>
            </div>
          )
        }
      >
        {selected?.feedback && (
          <div className="d-flex flex-column gap-3">
            {/* ── Confirmation screens ── */}
            {offerAction === "accept" && (
              <div
                style={{
                  background: "rgba(16,185,129,.07)",
                  border: "1px solid rgba(16,185,129,.25)",
                  borderRadius: 14,
                  padding: "1.4rem 1.2rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: ".5rem" }}>
                  🎉
                </div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#065f46",
                    marginBottom: ".35rem",
                  }}
                >
                  Offer Accepted!
                </div>
                <p
                  style={{
                    fontSize: ".84rem",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  Congratulations! The recruiter will be notified and will reach
                  out with the next steps shortly.
                </p>
              </div>
            )}

            {offerAction === "rejected" && (
              <div
                style={{
                  background: "rgba(239,68,68,.05)",
                  border: "1px solid rgba(239,68,68,.18)",
                  borderRadius: 14,
                  padding: "1.4rem 1.2rem",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: ".5rem" }}>
                  👋
                </div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: "#991b1b",
                    marginBottom: ".35rem",
                  }}
                >
                  Offer Declined
                </div>
                <p
                  style={{
                    fontSize: ".84rem",
                    color: "var(--muted)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  The recruiter has been notified. We hope you find the right
                  opportunity soon!
                </p>
              </div>
            )}

            {/* Company & role */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 12,
                padding: "1rem 1.1rem",
                border: "1px solid var(--border)",
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="ai-company-logo">{selected.companyInitial}</div>
                <div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {selected.jobTitle}
                  </div>
                  <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {selected.company.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Offer details */}
            {selected.feedback.offer ? (
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
                    marginBottom: ".9rem",
                  }}
                >
                  Offer Details
                </p>
                <div className="d-flex flex-column gap-3">
                  {selected.feedback.offer.offeredSalary && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: ".75rem",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(16,185,129,.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <DollarSign
                          size={16}
                          style={{ color: "var(--success)" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: ".7rem",
                            color: "var(--muted)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                            marginBottom: ".15rem",
                          }}
                        >
                          Offered Salary
                        </div>
                        <div
                          style={{
                            fontFamily: "Syne",
                            fontWeight: 800,
                            fontSize: "1.1rem",
                            color: "#065f46",
                          }}
                        >
                          {selected.feedback.offer.offeredSalary}
                        </div>
                      </div>
                    </div>
                  )}
                  {selected.feedback.offer.startDate && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: ".75rem",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(79,70,229,.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CalendarDays
                          size={16}
                          style={{ color: "var(--primary)" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: ".7rem",
                            color: "var(--muted)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                            marginBottom: ".15rem",
                          }}
                        >
                          Start Date
                        </div>
                        <div
                          style={{
                            fontFamily: "Syne",
                            fontWeight: 700,
                            fontSize: ".95rem",
                            color: "var(--text)",
                          }}
                        >
                          {fmtDateLong(selected.feedback.offer.startDate)}
                        </div>
                      </div>
                    </div>
                  )}
                  {selected.feedback.offer.notes && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: ".75rem",
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "rgba(6,182,212,.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MessageSquare
                          size={15}
                          style={{ color: "var(--accent)" }}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: ".7rem",
                            color: "var(--muted)",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: ".04em",
                            marginBottom: ".15rem",
                          }}
                        >
                          Additional Notes
                        </div>
                        <div
                          style={{
                            fontSize: ".87rem",
                            color: "var(--text)",
                            lineHeight: 1.65,
                          }}
                        >
                          {selected.feedback.offer.notes}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: ".84rem",
                  color: "var(--muted)",
                  background: "var(--surface)",
                  borderRadius: 10,
                  padding: ".9rem 1rem",
                  border: "1px solid var(--border)",
                }}
              >
                The recruiter will share full offer details soon.
              </div>
            )}

            {/* Recruiter feedback summary */}
            <div
              style={{
                fontSize: ".83rem",
                color: "var(--muted)",
                lineHeight: 1.65,
                background: "rgba(79,70,229,.03)",
                borderRadius: 10,
                padding: ".8rem 1rem",
                border: "1px solid rgba(79,70,229,.1)",
              }}
            >
              <strong
                style={{
                  color: "var(--text)",
                  display: "block",
                  marginBottom: ".25rem",
                  fontSize: ".8rem",
                }}
              >
                Recruiter's Feedback
              </strong>
              {selected.feedback.publicFeedback}
            </div>
          </div>
        )}
      </Modal>

      {/* CAN'T ATTEND */}
      <Modal
        open={modalType === "cancel"}
        onClose={closeModal}
        title="Can't Attend Interview"
        icon={<AlertTriangle size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="ai-btn ai-btn--ghost ai-btn--sm"
              onClick={closeModal}
              disabled={loading}
            >
              Go Back
            </button>
            <button
              className="ai-btn ai-btn--danger ai-btn--sm"
              onClick={handleCantAttend}
              disabled={loading}
              style={{ opacity: loading ? 0.45 : 1 }}
            >
              <XCircle size={13} />
              {loading ? "Notifying…" : "Notify Recruiter"}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          <div className="ai-notice ai-notice--amber">
            <AlertTriangle
              size={14}
              style={{ marginRight: ".4rem", verticalAlign: "middle" }}
            />
            Notifying the recruiter will cancel your slot. Please reach out to
            reschedule if needed.
          </div>
          <div className="ai-field">
            <label className="ai-label">Reason (optional)</label>
            <textarea
              className="ai-input"
              placeholder="Let the recruiter know why you can't make it…"
              style={{ resize: "vertical", minHeight: 80 }}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
