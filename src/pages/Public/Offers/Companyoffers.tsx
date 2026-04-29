import { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
import {
  Gift,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Modal from "../../../components/Modal/Modal";
import "./Offers.css";
import { getAllOffersToCompany } from "../../../services/offerService";

/* ════════════════════════════════════════════════════════════
   API RESPONSE SHAPE  (company)
  {
    id, offeredSalary, startDate, notes, expiresAt,
    respondedAt, status, createdAt,
    application: {
      id,
      job:       { id, title },
      applicant: { id, user: { name } }
    }
  }
════════════════════════════════════════════════════════════ */

type OfferStatus = "Pending" | "Accepted" | "Rejected";

interface CompanyOffer {
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
    job: { id: string; title: string };
    applicant: { id: string; user: { name: string } };
  };
}

/* ════════════════════════════════════════════════════════════
   DUMMY  (mirrors real API shape)
════════════════════════════════════════════════════════════ */
// const DUMMY: CompanyOffer[] = [
//   {
//     id: "732df3a8-fe07-48f2-94a9-64429cdb7403",
//     offeredSalary: "9000",
//     startDate: "2026-03-02T12:00:00.000Z",
//     notes: "uytrewqasdfghjkl;.,mnbvc",
//     expiresAt: "2027-03-02T12:00:00.000Z",
//     respondedAt: null,
//     status: "Pending",
//     createdAt: "2026-04-11T11:52:28.368Z",
//     application: {
//       id: "f1dfb982-bf7d-469d-87dc-e22b196ff118",
//       job: { id: "20e02752", title: "Backend Developer" },
//       applicant: { id: "e755ee01", user: { name: "John Doe" } },
//     },
//   },
//   {
//     id: "3b853128-0d82-4d0c-ac06-86e392bf1e8b",
//     offeredSalary: "12000",
//     startDate: "2026-04-01T12:00:00.000Z",
//     notes: "Welcome to the team!",
//     expiresAt: "2027-04-01T12:00:00.000Z",
//     respondedAt: "2026-04-12T09:00:00.000Z",
//     status: "Accepted",
//     createdAt: "2026-04-11T11:53:17.032Z",
//     application: {
//       id: "e4be3445-c084-486f-a36b-91bc37c9c41f",
//       job: { id: "03af830d", title: "Junior Node.js Developer" },
//       applicant: { id: "e755ee01", user: { name: "Sarah Williams" } },
//     },
//   },
//   {
//     id: "9aab2211-ccdd-4433-bb44-55667788aabb",
//     offeredSalary: "8500",
//     startDate: "2026-05-01T12:00:00.000Z",
//     notes: "Great fit for the role.",
//     expiresAt: "2026-03-01T12:00:00.000Z",
//     respondedAt: "2026-04-10T14:00:00.000Z",
//     status: "Declined",
//     createdAt: "2026-04-09T08:00:00.000Z",
//     application: {
//       id: "aa112233-4455-6677-8899",
//       job: { id: "bbccddee", title: "Senior Frontend Engineer" },
//       applicant: { id: "ff001122", user: { name: "Mike Taylor" } },
//     },
//   },
// ];

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

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function CompanyOffers() {
  // const navigate = useNavigate();
  // const [scrolled, setScrolled] = useState(false);
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [activeTab, setActiveTab] = useState<OfferStatus | "All">("All");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CompanyOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // useEffect(() => {
  //   const fn = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", fn);
  //   return () => window.removeEventListener("scroll", fn);
  // }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await getAllOffersToCompany();
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
  //       label: "Total Sent",
  //       value: counts.All,
  //       hint: "All offers",
  //       icon: <Gift size={15} />,
  //       ic: "of-kpi-icon--indigo",
  //       vc: "of-kpi-value--indigo",
  //       card: "of-kpi--indigo",
  //     },
  //     {
  //       label: "Pending",
  //       value: counts.Pending,
  //       hint: "Awaiting response",
  //       icon: <Clock size={15} />,
  //       ic: "of-kpi-icon--amber",
  //       vc: "of-kpi-value--amber",
  //       card: "of-kpi--amber",
  //     },
  //     {
  //       label: "Accepted",
  //       value: counts.Accepted,
  //       hint: "Candidate accepted",
  //       icon: <CheckCircle size={15} />,
  //       ic: "of-kpi-icon--green",
  //       vc: "of-kpi-value--green",
  //       card: "of-kpi--green",
  //     },
  //     {
  //       label: "Declined",
  //       value: counts.Declined,
  //       hint: "Candidate declined",
  //       icon: <XCircle size={15} />,
  //       ic: "of-kpi-icon--red",
  //       vc: "of-kpi-value--red",
  //       card: "of-kpi--red",
  //     },
  //   ];

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="of-page">
      {/* HEADER */}

      <main className="of-main">
        {/* Heading */}
        <div className="mb-4 au">
          <h1 className="of-page-title">Sent Offers</h1>
          <p className="of-page-sub">
            Track all offers you've sent to candidates
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
            <div className="of-empty-title">
              No {activeTab !== "All" ? activeTab.toLowerCase() : ""} offers
            </div>
            <span style={{ fontSize: ".84rem" }}>
              Offers you send will appear here.
            </span>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filtered.map((offer, i) => (
              <div
                key={offer.id}
                className={`${cardClass(offer.status)} au d${Math.min(i + 1, 6)}`}
              >
                <div className="of-card-body">
                  {/* Header row */}
                  <div className="d-flex align-items-start justify-content-between gap-3 mb-3 flex-wrap">
                    <div className="d-flex align-items-center gap-3">
                      <div className="of-avatar of-avatar--applicant">
                        {getInitials(offer.application.applicant.user.name)}
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
                          {offer.application.applicant.user.name}
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
                          <Briefcase size={12} /> {offer.application.job.title}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {isExpired(offer.expiresAt) &&
                        offer.status === "Pending" && (
                          <span className="of-expiry of-expiry--expired">
                            <AlertTriangle size={12} /> Expired
                          </span>
                        )}
                      <span className={badgeClass(offer.status)}>
                        <span className="of-badge-dot" />
                        {offer.status}
                      </span>
                    </div>
                  </div>

                  {/* Salary + dates grid */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-sm-4">
                      <div className="of-detail-label">Offered Salary</div>
                      <div className="of-salary" style={{ fontSize: "1.5rem" }}>
                        {fmtSalary(offer.offeredSalary)}
                        <span className="of-salary-unit">/yr</span>
                      </div>
                    </div>
                    <div className="col-6 col-sm-4">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: ".1rem",
                        }}
                      >
                        <div className="of-detail-label">Start Date</div>
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
                    </div>
                    <div className="col-6 col-sm-4">
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: ".1rem",
                        }}
                      >
                        <div className="of-detail-label">Expires</div>
                        <div
                          style={{
                            fontFamily: "Syne",
                            fontWeight: 700,
                            fontSize: ".9rem",
                            color: isExpired(offer.expiresAt)
                              ? "var(--danger)"
                              : "var(--text)",
                          }}
                        >
                          {fmtDate(offer.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {offer.notes && (
                    <div className="of-notes mb-3">
                      <strong
                        style={{
                          display: "block",
                          color: "var(--text)",
                          marginBottom: ".2rem",
                          fontSize: ".8rem",
                        }}
                      >
                        Notes
                      </strong>
                      {offer.notes}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
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
                        <Clock size={12} /> Sent {fmtDate(offer.createdAt)}
                      </span>
                      {offer.respondedAt && (
                        <span className="d-flex align-items-center gap-1">
                          <Calendar size={12} /> Responded{" "}
                          {fmtDate(offer.respondedAt)}
                        </span>
                      )}
                    </div>
                    <button
                      className="of-btn of-btn--outline of-btn--sm"
                      onClick={() => {
                        setSelected(offer);
                        setModalOpen(true);
                      }}
                    >
                      <FileText size={13} /> Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══ DETAILS MODAL ═════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Offer Details"
        icon={<Gift size={15} />}
        size="md"
        footer={
          <button
            className="of-btn of-btn--ghost of-btn--sm"
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        }
      >
        {selected && (
          <div className="d-flex flex-column gap-3">
            {/* Applicant + job */}
            <div
              style={{
                background: "var(--surface)",
                borderRadius: 12,
                padding: "1rem",
                border: "1px solid var(--border)",
              }}
            >
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="of-avatar of-avatar--applicant">
                  {getInitials(selected.application.applicant.user.name)}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Syne",
                      fontWeight: 800,
                      fontSize: "1rem",
                    }}
                  >
                    {selected.application.applicant.user.name}
                  </div>
                  <div
                    style={{
                      fontSize: ".82rem",
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: ".35rem",
                    }}
                  >
                    <Briefcase size={12} /> {selected.application.job.title}
                  </div>
                </div>
              </div>
              <span className={badgeClass(selected.status)}>
                <span className="of-badge-dot" />
                {selected.status}
              </span>
            </div>

            {/* Details */}
            <div>
              {[
                {
                  label: "Offered Salary",
                  val: `${fmtSalary(selected.offeredSalary)} / yr`,
                  icon: <DollarSign size={14} />,
                },
                {
                  label: "Start Date",
                  val: fmtDate(selected.startDate),
                  icon: <Calendar size={14} />,
                },
                {
                  label: "Expires",
                  val: fmtDate(selected.expiresAt),
                  icon: <AlertTriangle size={14} />,
                },
                {
                  label: "Sent On",
                  val: fmtDate(selected.createdAt),
                  icon: <Clock size={14} />,
                },
                ...(selected.respondedAt
                  ? [
                      {
                        label: "Responded On",
                        val: fmtDate(selected.respondedAt),
                        icon: <CheckCircle size={14} />,
                      },
                    ]
                  : []),
              ].map((row) => (
                <div key={row.label} className="of-detail">
                  <span className="of-detail-icon">{row.icon}</span>
                  <div>
                    <div className="of-detail-label">{row.label}</div>
                    <div
                      className="of-detail-val"
                      style={{ wordBreak: "break-all" }}
                    >
                      {row.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="of-notes">
                <strong
                  style={{
                    display: "block",
                    color: "var(--text)",
                    marginBottom: ".2rem",
                  }}
                >
                  Notes
                </strong>
                {selected.notes}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
