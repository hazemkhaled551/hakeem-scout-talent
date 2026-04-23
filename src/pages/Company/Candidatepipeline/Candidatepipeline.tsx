import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams} from "react-router-dom";
import {
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
} from "lucide-react";
import "../Companydashboard/Companydashboard.css"; // reuses same CSS
import { getJobsApplicantsByJob } from "../../../services/candidateService";
import Loader from "../../../components/Loader";
import CompanyNavbar from "../../../components/CompanyNavbar";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type CandidateStatus =
  | "New"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "rejected";

interface Candidate {
  id: string;
  name: string;
  position: string;
  aiScore: number;
  skills: string[];
  appliedDate: string;
  status: CandidateStatus;
}

/* ════════════════════════════════════════════════════════════
   COLUMN CONFIG
════════════════════════════════════════════════════════════ */
const COLUMNS: Array<{
  id: CandidateStatus;
  title: string;
  headerClass: string;
  dotClass: string;
}> = [
  {
    id: "New",
    title: "New Applications",
    headerClass: "cd-col-header--new",
    dotClass: "cd-col-dot--new",
  },
  {
    id: "Screening",
    title: "Screening",
    headerClass: "cd-col-header--screening",
    dotClass: "cd-col-dot--screening",
  },
  {
    id: "Interview",
    title: "Interview",
    headerClass: "cd-col-header--interview",
    dotClass: "cd-col-dot--interview",
  },
  {
    id: "Offer",
    title: "Offer Sent",
    headerClass: "cd-col-header--offer",
    dotClass: "cd-col-dot--offer",
  },
  {
    id: "Hired",
    title: "Hired",
    headerClass: "cd-col-header--hired",
    dotClass: "cd-col-dot--hired",
  },
];

/* ════════════════════════════════════════════════════════════
   STATUS MAP  (API status → CandidateStatus)
════════════════════════════════════════════════════════════ */
function mapStatus(raw: string): CandidateStatus {
  switch (raw.trim().toLowerCase()) {
    case "new":
      return "New";
    case "screening":
      return "Screening";
    case "interview":
      return "Interview";
    case "offered":
      return "Offer";
    case "hired":
      return "Hired";
    default:
      return "rejected"; // default fallback
  }
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   Route: /company/pipeline/:jobId
════════════════════════════════════════════════════════════ */
export default function CandidatePipeline() {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();

  // const [scrolled, setScrolled] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  /* filters */
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "All">(
    "All",
  );
  const [minScore, setMinScore] = useState(0);
  const [skillFilter, setSkillFilter] = useState("");

  // useEffect(() => {
  //   const fn = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", fn);
  //   return () => window.removeEventListener("scroll", fn);
  // }, []);

  /* ── fetch candidates for this job ────────────────────── */
  useEffect(() => {
    async function load() {
      // if (!jobId) return;
      try {
        setLoading(true);

        // 🔥 Replace with your real API call:
        // const res = await getJobApplicants(jobId);
        // Reuse existing getJobsApplicants and filter by jobId
        const res = await getJobsApplicantsByJob(jobId!);
        const all: any[] = res.data.data ?? [];
        console.log(all);

        setCandidates(
          all.map((a) => ({
            id: a.id,

            // ✅ الاسم
            name: a.applicant?.user?.name || "Unknown",

            // ✅ البوزيشن
            position: a.applicant?.job_title || "N/A",

            // ✅ مفيش AI score في API → حط default
            aiScore: Math.floor(Math.random() * 30) + 70, // random 70-100 for demo

            // ✅ skills جاية من job
            skills: a.job?.skills || [],

            // ✅ مفيش appliedDate → حط تاريخ دلوقتي مؤقت
            appliedDate: new Date().toLocaleDateString(),

            // ✅ status mapping
            status: mapStatus(a.status),
          })),
        );
        setJobTitle(all[0]?.job?.title || ""); // assuming all applicants are for the same job, get title from first
      } catch (err) {
        console.error("CandidatePipeline load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── derived ───────────────────────────────────────────── */
  const hasFilters = !!(
    search ||
    selectedStatus !== "All" ||
    minScore ||
    skillFilter
  );

  const filtered = useMemo(
    () =>
      candidates.filter((c) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            c.name.toLowerCase().includes(q) ||
            c.position.toLowerCase().includes(q) ||
            c.skills.some((s) => s.toLowerCase().includes(q))) &&
          (selectedStatus === "All" || c.status === selectedStatus) &&
          c.aiScore >= minScore &&
          (!skillFilter ||
            c.skills.some((s) =>
              s.toLowerCase().includes(skillFilter.toLowerCase()),
            ))
        );
      }),
    [candidates, search, selectedStatus, minScore, skillFilter],
  );

  const colCandidates = (status: CandidateStatus) =>
    filtered.filter((c) => c.status === status);

  function resetFilters() {
    setSearch("");
    setSelectedStatus("All");
    setMinScore(0);
    setSkillFilter("");
  }

  if (loading) return <Loader text="Loading pipeline…" fullPage />;

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="cd-page">
      {/* HEADER */}
      <CompanyNavbar />

      <main className="cd-main">
        {/* Heading */}
        <div className="mb-4 au">
          <div className="d-flex align-items-center gap-2 mb-1">
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                gap: ".3rem",
                fontSize: ".82rem",
                fontFamily: "Syne",
                fontWeight: 600,
                padding: 0,
              }}
              onClick={() => navigate("/company")}
            >
              <ChevronLeft size={13} /> All Jobs
            </button>
            <ChevronRight size={13} style={{ color: "var(--border)" }} />
            <span
              style={{
                fontSize: ".82rem",
                color: "var(--text)",
                fontFamily: "Syne",
                fontWeight: 700,
              }}
            >
              {jobTitle || "Candidate Pipeline"}
            </span>
          </div>
          <h1 className="cd-page-title">Candidate Pipeline</h1>
          <p className="cd-page-sub">
            {jobTitle
              ? `Managing candidates for "${jobTitle}"`
              : "Manage candidates across every hiring stage"}
          </p>
        </div>

        {/* Pipeline summary strip */}
        <div className="d-flex flex-wrap gap-2 mb-4 au d1">
          {COLUMNS.map((col) => {
            const count = colCandidates(col.id).length;
            return (
              <div
                key={col.id}
                style={{
                  background:
                    count > 0 ? "rgba(79,70,229,.06)" : "var(--white)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: ".45rem .9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: ".5rem",
                  fontSize: ".8rem",
                  cursor: "pointer",
                  transition: "all .18s",
                }}
                onClick={() =>
                  setSelectedStatus(selectedStatus === col.id ? "All" : col.id)
                }
              >
                <span
                  className={`cd-col-dot ${col.dotClass}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 700,
                    color: count > 0 ? "var(--text)" : "var(--muted)",
                  }}
                >
                  {col.title}
                </span>
                <span
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    color: "var(--primary)",
                    marginLeft: ".2rem",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Search + filter bar */}
        <div className="au d2 mb-3">
          <div className="d-flex gap-2">
            <div className="cd-search-wrap flex-1 w-100">
              <Search size={15} className="cd-search-icon" />
              <input
                className="cd-input cd-search-input"
                placeholder="Search by name, position, or skill…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`cd-btn ${showFilters ? "cd-btn--primary" : "cd-btn--outline"}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} /> Filters
              {hasFilters && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--warning)",
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="cd-filter-panel mb-4 asd">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-sm-6 col-md-3">
                <label
                  className="cd-section-meta d-block mb-1"
                  style={{
                    fontSize: ".73rem",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    fontWeight: 600,
                  }}
                >
                  Stage
                </label>
                <select
                  className="cd-select"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as CandidateStatus | "All")
                  }
                >
                  <option value="All">All Stages</option>
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <label
                  className="cd-section-meta d-block mb-1"
                  style={{
                    fontSize: ".73rem",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    fontWeight: 600,
                  }}
                >
                  Min AI Score
                </label>
                <select
                  className="cd-select"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                >
                  <option value={0}>Any score</option>
                  <option value={70}>70%+</option>
                  <option value={80}>80%+</option>
                  <option value={90}>90%+</option>
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <label
                  className="cd-section-meta d-block mb-1"
                  style={{
                    fontSize: ".73rem",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    fontWeight: 600,
                  }}
                >
                  Skill
                </label>
                <input
                  className="cd-input"
                  placeholder="e.g. React"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-3">
                <button
                  className="cd-btn cd-btn--outline cd-btn--full"
                  style={{ opacity: hasFilters ? 1 : 0.45 }}
                  disabled={!hasFilters}
                  onClick={resetFilters}
                >
                  <X size={13} /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kanban board */}
        <div className="d-flex align-items-center justify-content-between mb-3 au d3">
          <span className="cd-section-title">Pipeline Board</span>
          <span className="cd-section-meta">
            {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="cd-board au d3">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              candidates={colCandidates(col.id)}
              onCardClick={(id) =>
                navigate(`/company/candidateevaluation/${id}`)
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   KANBAN COLUMN
════════════════════════════════════════════════════════════ */
interface KanbanColumnProps {
  col: (typeof COLUMNS)[number];
  candidates: Candidate[];
  onCardClick: (id: string) => void;
}

function KanbanColumn({ col, candidates, onCardClick }: KanbanColumnProps) {
  return (
    <div className="cd-col">
      <div className={`cd-col-header ${col.headerClass}`}>
        <span className="cd-col-title">
          <span className={`cd-col-dot ${col.dotClass}`} />
          {col.title}
        </span>
        <span className="cd-col-count">{candidates.length}</span>
      </div>
      <div className="cd-col-body">
        {candidates.length === 0 ? (
          <div className="cd-col-empty">
            <div className="cd-col-empty-icon">
              <Users size={18} />
            </div>
            <span>No candidates here</span>
          </div>
        ) : (
          candidates.map((c, i) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              delay={i}
              onClick={() => onCardClick(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CANDIDATE CARD
════════════════════════════════════════════════════════════ */
interface CandidateCardProps {
  candidate: Candidate;
  delay: number;
  onClick: () => void;
}

function CandidateCard({ candidate: c, delay, onClick }: CandidateCardProps) {
  const initials = c.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className={`cd-cand-card au d${Math.min(delay + 1, 6)}`}
      onClick={onClick}
    >
      <div className="d-flex align-items-start gap-2 mb-2">
        <div className="cd-avatar">{initials}</div>
        <div className="flex-1 min-width-0">
          <div className="cd-cand-name">{c.name}</div>
          <div className="cd-cand-position">{c.position}</div>
        </div>
        <ChevronRight
          size={13}
          style={{ color: "var(--muted)", flexShrink: 0, marginTop: 2 }}
        />
      </div>
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="cd-match-label">AI Match</span>
        <span className="cd-match-num">{c.aiScore}%</span>
      </div>
      <div className="cd-score-track mb-2">
        <div
          className="cd-score-fill"
          style={{ "--w": `${c.aiScore}%` } as React.CSSProperties}
        />
      </div>
      <div className="d-flex flex-wrap gap-1 mb-2">
        {c.skills.slice(0, 3).map((s) => (
          <span key={s} className="cd-skill-tag">
            {s}
          </span>
        ))}
      </div>
      <div className="cd-cand-date">
        <Clock size={11} /> Applied {c.appliedDate}
      </div>
    </div>
  );
}
