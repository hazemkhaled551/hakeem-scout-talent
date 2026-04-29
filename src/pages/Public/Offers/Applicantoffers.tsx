import { useState, useEffect, useMemo } from "react";

import {
  Gift,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react";
import Modal from "../../../components/Modal/Modal";
import "./Offers.css";
import {
  getAllOffersToApplicant,
  sendResponseToOffer,
} from "../../../services/offerService";

/* ════════════════════════════════════════════════════════════
   API RESPONSE SHAPE  (applicant)
  {
    id, offeredSalary, startDate, notes, expiresAt,
    respondedAt, status, createdAt,
    application: {
      id,
      job: {
        id, title,
        company: { id, user: { name } }
      }
    }
  }
════════════════════════════════════════════════════════════ */
type OfferStatus = "Pending" | "Accepted" | "Rejected";

interface ApplicantOffer {
  id: string;
  offeredSalary: string;
  startDate: string;
  notes: string;
  expiresAt: string;
  respondedAt: string | null;
  status: OfferStatus;
  createdAt: string;
  application: {
    id: string;
    job: {
      id: string;
      title: string;
      company: { id: string; user: { name: string } };
    };
  };
}

/* ════════════════════════════════════════════════════════════
   DUMMY  (mirrors real API shape)
════════════════════════════════════════════════════════════ */
const DUMMY: ApplicantOffer[] = [
  {
    id: "732df3a8-fe07-48f2-94a9-64429cdb7403",
    offeredSalary: "9000",
    startDate: "2026-03-02T12:00:00.000Z",
    notes: "We're excited to have you join the team! Full benefits included.",
    expiresAt: "2027-03-02T12:00:00.000Z",
    respondedAt: null,
    status: "Pending",
    createdAt: "2026-04-11T11:52:28.368Z",
    application: {
      id: "f1dfb982-bf7d-469d-87dc-e22b196ff118",
      job: {
        id: "20e02752",
        title: "Backend Developer",
        company: { id: "82adfea7", user: { name: "TechCorp Inc." } },
      },
    },
  },
  {
    id: "3b853128-0d82-4d0c-ac06-86e392bf1e8b",
    offeredSalary: "12000",
    startDate: "2026-04-01T12:00:00.000Z",
    notes: "Great opportunity to grow with us.",
    expiresAt: "2027-04-01T12:00:00.000Z",
    respondedAt: "2026-04-12T09:00:00.000Z",
    status: "Accepted",
    createdAt: "2026-04-11T11:53:17.032Z",
    application: {
      id: "e4be3445-c084-486f-a36b-91bc37c9c41f",
      job: {
        id: "03af830d",
        title: "Junior Node.js Developer",
        company: { id: "82adfea7", user: { name: "InnovateLabs" } },
      },
    },
  },
];

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function fmtSalary(v: string) {
  const n = parseFloat(v);
  return isNaN(n) ? v : `$${n.toLocaleString()}`;
}
function badgeClass(s: OfferStatus) {
  return `of-badge of-badge--${s.toLowerCase()}`;
}
function cardClass(s: OfferStatus) {
  return `of-card of-card--${s.toLowerCase()}`;
}
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function isExpired(expiresAt: string) {
  return new Date(expiresAt) < new Date();
}
function daysUntilExpiry(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function ApplicantOffers() {
  const [offers, setOffers] = useState<ApplicantOffer[]>(DUMMY);
  const [activeTab, setActiveTab] = useState<OfferStatus | "All">("All");
  const [loading, setLoading] = useState(false);

  // Accept modal
  const [acceptTarget, setAcceptTarget] = useState<ApplicantOffer | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  // Decline modal
  const [declineTarget, setDeclineTarget] = useState<ApplicantOffer | null>(
    null,
  );
  // const [declineNote, setDeclineNote] = useState("");
  const [declineLoading, setDeclineLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await getAllOffersToApplicant();
        setOffers(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── counts ──────────────────────────────────────────────── */
  const counts = useMemo(
    () => ({
      All: offers.length,
      Pending: offers.filter((o) => o.status === "Pending").length,
      Accepted: offers.filter((o) => o.status === "Accepted").length,
      Rejected: offers.filter((o) => o.status === "Rejected").length,
    }),
    [offers],
  );

  const filtered = useMemo(
    () =>
      activeTab === "All"
        ? offers
        : offers.filter((o) => o.status === activeTab),
    [offers, activeTab],
  );

  //   const kpis = [
  //     {
  //       label: "Total Offers",
  //       value: counts.All,
  //       hint: "From companies",
  //       icon: <Gift size={15} />,
  //       ic: "of-kpi-icon--indigo",
  //       vc: "of-kpi-value--indigo",
  //       card: "of-kpi--indigo",
  //     },
  //     {
  //       label: "Pending",
  //       value: counts.Pending,
  //       hint: "Awaiting your reply",
  //       icon: <Clock size={15} />,
  //       ic: "of-kpi-icon--amber",
  //       vc: "of-kpi-value--amber",
  //       card: "of-kpi--amber",
  //     },
  //     {
  //       label: "Accepted",
  //       value: counts.Accepted,
  //       hint: "You accepted",
  //       icon: <CheckCircle size={15} />,
  //       ic: "of-kpi-icon--green",
  //       vc: "of-kpi-value--green",
  //       card: "of-kpi--green",
  //     },
  //     {
  //       label: "Rejected",
  //       value: counts.Rejected,
  //       hint: "You Rejected",
  //       icon: <XCircle size={15} />,
  //       ic: "of-kpi-icon--red",
  //       vc: "of-kpi-value--red",
  //       card: "of-kpi--red",
  //     },
  //   ];

  /* ── Accept ──────────────────────────────────────────────── */
  async function handleAccept() {
    if (!acceptTarget) return;
    setAcceptLoading(true);
    try {
      await sendResponseToOffer(acceptTarget.id, "Accepted");
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptLoading(false);
    }
  }

  /* ── Decline ─────────────────────────────────────────────── */
  async function handleDecline() {
    if (!declineTarget) return;
    setDeclineLoading(true);
    try {
      await sendResponseToOffer(declineTarget.id, "Rejected");
    } catch (err) {
      console.error(err);
    } finally {
      setDeclineLoading(false);
    }
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="of-page">
      {/* HEADER */}

      <main className="of-main">
        {/* Heading */}
        <div className="mb-4 au">
          <h1 className="of-page-title">My Offers</h1>
          <p className="of-page-sub">
            Review and respond to offers from companies
          </p>
        </div>

        {/* KPIs */}
        {/* <div className="row g-3 mb-4">
          {kpis.map((k, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className={`of-kpi ${k.card} au d${i + 1}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="of-kpi-label">{k.label}</span>
                  <div className={`of-kpi-icon ${k.ic}`}>{k.icon}</div>
                </div>
                <div className={`of-kpi-value ${k.vc}`}>{k.value}</div>
                <div className="of-kpi-hint">{k.hint}</div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Tabs */}
        <div className="of-tabs mb-4 au d2">
          {(["All", "Pending", "Accepted", "Rejected"] as const).map((t) => (
            <button
              key={t}
              className={`of-tab ${activeTab === t ? "of-tab--active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
              {counts[t] > 0 && (
                <span className="of-tab-count">{counts[t]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Offer cards */}
        {loading ? (
          <div className="of-empty au">
            <div className="of-empty-icon">
              <Gift size={22} />
            </div>
            <span>Loading offers…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="of-empty au">
            <div className="of-empty-icon">
              <Gift size={22} />
            </div>
            <div className="of-empty-title">No offers yet</div>
            <span style={{ fontSize: ".84rem" }}>
              Offers from companies will appear here after interviews.
            </span>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map((offer, i) => {
              const expired = isExpired(offer.expiresAt);
              const daysLeft = daysUntilExpiry(offer.expiresAt);
              const isPending = offer.status === "Pending";

              return (
                <div
                  key={offer.id}
                  className={`${cardClass(offer.status)} au d${Math.min(i + 1, 6)}`}
                >
                  <div className="of-card-body">
                    {/* Header */}
                    <div className="d-flex align-items-start justify-content-between gap-3 mb-3 flex-wrap">
                      <div className="d-flex align-items-center gap-3">
                        <div className="of-avatar of-avatar--company">
                          {getInitials(offer.application.job.company.user.name)}
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: "Syne",
                              fontWeight: 800,
                              fontSize: ".97rem",
                              marginBottom: ".1rem",
                            }}
                          >
                            {offer.application.job.title}
                          </div>
                          <div
                            style={{
                              fontSize: ".8rem",
                              color: "var(--muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: ".35rem",
                            }}
                          >
                            <Briefcase size={12} />{" "}
                            {offer.application.job.company.user.name}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        {isPending && expired && (
                          <span className="of-expiry of-expiry--expired">
                            <AlertTriangle size={12} /> Expired
                          </span>
                        )}
                        {isPending && !expired && daysLeft <= 7 && (
                          <span className="of-expiry">
                            <AlertTriangle size={12} /> {daysLeft}d left
                          </span>
                        )}
                        <span className={badgeClass(offer.status)}>
                          <span className="of-badge-dot" />
                          {offer.status}
                        </span>
                      </div>
                    </div>

                    {/* Salary highlight */}
                    <div
                      style={{
                        background: "rgba(16,185,129,.05)",
                        border: "1px solid rgba(16,185,129,.15)",
                        borderRadius: 12,
                        padding: "1rem 1.2rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div className="row g-3">
                        <div className="col-12 col-sm-5">
                          <div
                            className="of-detail-label"
                            style={{ marginBottom: ".3rem" }}
                          >
                            Offered Salary
                          </div>
                          <div className="of-salary">
                            {fmtSalary(offer.offeredSalary)}
                            <span className="of-salary-unit">/yr</span>
                          </div>
                        </div>
                        <div className="col-6 col-sm-4">
                          <div
                            className="of-detail-label"
                            style={{ marginBottom: ".3rem" }}
                          >
                            Start Date
                          </div>
                          <div
                            style={{
                              fontFamily: "Syne",
                              fontWeight: 700,
                              fontSize: ".9rem",
                            }}
                          >
                            {fmtDate(offer.startDate)}
                          </div>
                        </div>
                        <div className="col-6 col-sm-3">
                          <div
                            className="of-detail-label"
                            style={{ marginBottom: ".3rem" }}
                          >
                            Expires
                          </div>
                          <div
                            style={{
                              fontFamily: "Syne",
                              fontWeight: 700,
                              fontSize: ".9rem",
                              color: expired ? "var(--danger)" : "var(--text)",
                            }}
                          >
                            {fmtDate(offer.expiresAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {offer.notes && (
                      <div className="of-notes mb-3">{offer.notes}</div>
                    )}

                    {/* Actions */}
                    {isPending && !expired && (
                      <div className="d-flex gap-2 flex-wrap mb-3">
                        <button
                          className="of-btn of-btn--accept"
                          onClick={() => setAcceptTarget(offer)}
                        >
                          <ThumbsUp size={14} /> Accept Offer
                        </button>
                        <button
                          className="of-btn of-btn--decline"
                          onClick={() => {
                            setDeclineTarget(offer);
                            // setDeclineNote("");
                          }}
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </div>
                    )}

                    {offer.status === "Accepted" && (
                      <div
                        className="of-notice of-notice--green d-flex align-items-center gap-2 mb-3"
                        style={{ fontSize: ".82rem" }}
                      >
                        <CheckCircle size={14} /> You accepted this offer on{" "}
                        {fmtDate(offer.respondedAt)}.
                      </div>
                    )}

                    {offer.status === "Rejected" && (
                      <div
                        className="of-notice of-notice--amber d-flex align-items-center gap-2 mb-3"
                        style={{ fontSize: ".82rem" }}
                      >
                        <XCircle size={14} /> You Rejected this offer on{" "}
                        {fmtDate(offer.respondedAt)}.
                      </div>
                    )}

                    {/* Footer meta */}
                    <div
                      style={{
                        fontSize: ".76rem",
                        color: "var(--muted)",
                        display: "flex",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={12} /> Received {fmtDate(offer.createdAt)}
                      </span>
                      {offer.respondedAt && (
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={12} /> Responded{" "}
                          {fmtDate(offer.respondedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ══ ACCEPT MODAL ══════════════════════════════════════ */}
      <Modal
        open={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        title="Accept Offer"
        icon={<ThumbsUp size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="of-btn of-btn--ghost of-btn--sm"
              onClick={() => setAcceptTarget(null)}
              disabled={acceptLoading}
            >
              Cancel
            </button>
            <button
              style={{
                background: "linear-gradient(135deg,var(--success),#059669)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: ".55rem 1.1rem",
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: ".86rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: ".35rem",
                opacity: acceptLoading ? 0.45 : 1,
              }}
              onClick={handleAccept}
              disabled={acceptLoading}
            >
              {acceptLoading ? (
                <>
                  <div className="of-spinner" /> Processing…
                </>
              ) : (
                <>
                  <CheckCircle size={14} /> Confirm Acceptance
                </>
              )}
            </button>
          </>
        }
      >
        {acceptTarget && (
          <div className="d-flex flex-column gap-3">
            <div
              style={{
                background: "rgba(16,185,129,.05)",
                border: "1px solid rgba(16,185,129,.18)",
                borderRadius: 12,
                padding: "1.1rem",
              }}
            >
              <div
                style={{
                  fontFamily: "Syne",
                  fontWeight: 800,
                  fontSize: "1rem",
                  marginBottom: ".15rem",
                }}
              >
                {acceptTarget.application.job.title}
              </div>
              <div
                style={{
                  fontSize: ".82rem",
                  color: "var(--muted)",
                  marginBottom: ".75rem",
                }}
              >
                {acceptTarget.application.job.company.user.name}
              </div>
              <div className="d-flex gap-4">
                <div>
                  <div className="of-detail-label">Salary</div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      color: "var(--success)",
                    }}
                  >
                    {fmtSalary(acceptTarget.offeredSalary)}/yr
                  </div>
                </div>
                <div>
                  <div className="of-detail-label">Start Date</div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 700,
                      fontSize: ".9rem",
                    }}
                  >
                    {fmtDate(acceptTarget.startDate)}
                  </div>
                </div>
              </div>
            </div>
            <div
              style={{
                background: "rgba(79,70,229,.05)",
                border: "1px solid rgba(79,70,229,.12)",
                borderRadius: 11,
                padding: ".85rem 1rem",
                fontSize: ".84rem",
                color: "var(--muted)",
                lineHeight: 1.65,
              }}
            >
              By accepting, the company will be notified and your application
              status will update to{" "}
              <strong style={{ color: "var(--success)" }}>Hired</strong>.
            </div>
          </div>
        )}
      </Modal>

      {/* ══ DECLINE MODAL ═════════════════════════════════════ */}
      <Modal
        open={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        title="Decline Offer"
        icon={<XCircle size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="of-btn of-btn--ghost of-btn--sm"
              onClick={() => setDeclineTarget(null)}
              disabled={declineLoading}
            >
              Cancel
            </button>
            <button
              className="of-btn of-btn--danger of-btn--sm"
              onClick={handleDecline}
              disabled={declineLoading}
            >
              {declineLoading ? (
                <>
                  <div className="of-spinner" /> Processing…
                </>
              ) : (
                <>
                  <XCircle size={13} /> Confirm Decline
                </>
              )}
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
              fontSize: ".84rem",
              color: "#991b1b",
              lineHeight: 1.65,
            }}
          >
            <AlertTriangle
              size={14}
              style={{ marginRight: ".4rem", verticalAlign: "middle" }}
            />
            Declining will notify the company. This action cannot be undone.
          </div>
          {/* <div className="of-field">
            <label className="of-label">Reason (optional)</label>
            <textarea
              className="of-textarea"
              placeholder="e.g. Accepted another offer, salary expectations…"
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
            />
          </div> */}
        </div>
      </Modal>
    </div>
  );
}
