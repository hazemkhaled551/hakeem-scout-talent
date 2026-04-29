import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Globe,
  ArrowRight,
} from "lucide-react";
import "./Companydashboard.css";
import {
  getCompanyDashboardStats,
  getCompanyJobs,
} from "../../../services/companyService";
import Loader from "../../../components/Loader";


/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
interface PublishedJob {
  id: string;
  title: string;
  location: string;
  type: string;
  workMode: string;
  minSalary: number | string;
  maxSalary: number | string;
  skills: string[];
  applicants: number;
  newCount: number;
  postedDays: number;
  deadline?: string;
  positions?: number;
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function fmtSalary(min: number | string, max: number | string) {
  if (!min && !max) return "—";
  const f = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  return `${f(Number(min))} – ${f(Number(max))}`;
}
const fmtType = (v: string) => (v || "").replace("_", " ");

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function CompanyDashboard() {
  const navigate = useNavigate();
  // const [scrolled, setScrolled] = useState(false);
  // const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<PublishedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   const fn = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", fn);
  //   return () => window.removeEventListener("scroll", fn);
  // }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [statsRes, jobsRes] = await Promise.all([
          getCompanyDashboardStats(),
          getCompanyJobs("Published"),
        ]);
        setStats(statsRes.data.data);
        const raw: any[] = jobsRes.data.data ?? [];
        setJobs(
          raw.map((j: any) => ({
            id: j.id,
            title: j.title,
            location: j.location ?? "",
            type: j.type ?? "",
            workMode: j.workMode ?? "",
            minSalary: j.minSalary ?? "",
            maxSalary: j.maxSalary ?? "",
            skills: j.skills ?? [],
            applicants: j.applicants ?? 0,
            newCount: j.newCount ?? 0,
            postedDays: j.postedDays ?? 0,
            deadline: j.deadline,
            positions: j.positions,
          })),
        );
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const KPIS = [
    {
      label: "Active Jobs",
      value: stats?.activeJobs ?? "—",
      hint: "Published",
      icon: <Briefcase size={16} />,
      iconCls: "cd-kpi-icon--indigo",
      valCls: "cd-kpi-value--indigo",
      cardCls: "cd-kpi--indigo",
    },
    {
      label: "Total Candidates",
      value: stats?.totalCandidates ?? "—",
      hint: "In pipeline",
      icon: <Users size={16} />,
      iconCls: "cd-kpi-icon--blue",
      valCls: "cd-kpi-value--blue",
      cardCls: "cd-kpi--blue",
    },
    {
      label: "Avg. Time to Hire",
      value: stats?.avgTimeToHireDays ? `${stats.avgTimeToHireDays}d` : "—",
      hint: "vs last month",
      icon: <Clock size={16} />,
      iconCls: "cd-kpi-icon--amber",
      valCls: "cd-kpi-value--amber",
      cardCls: "cd-kpi--amber",
    },
    {
      label: "Offers Sent",
      value: stats?.offersSent ?? "—",
      hint: "This month",
      icon: <TrendingUp size={16} />,
      iconCls: "cd-kpi-icon--green",
      valCls: "cd-kpi-value--green",
      cardCls: "cd-kpi--green",
    },
    {
      label: "Hired",
      value: stats?.hired ?? "—",
      hint: "75% acceptance",
      icon: <CheckCircle size={16} />,
      iconCls: "cd-kpi-icon--emerald",
      valCls: "cd-kpi-value--emerald",
      cardCls: "cd-kpi--emerald",
    },
  ];

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q)
    );
  });

  if (loading) return <Loader text="Loading…" fullPage />;

  return (
    <div className="cd-page">
      {/* HEADER */}
    

      <main className="cd-main">
        {/* Heading */}
        <div className="mb-4 au">
          <h1 className="cd-page-title">Recruitment Dashboard</h1>
          <p className="cd-page-sub">
            Overview of your active positions and hiring pipeline
          </p>
        </div>

        {/* KPIs */}
        <div className="d-flex align-items-center justify-content-between mb-3 au d1">
          <span className="cd-section-title">Statistics</span>
          <span className="cd-section-meta">Last 3 months</span>
        </div>
        <div className="row g-3 mb-4">
          {KPIS.map((k, i) => (
            <div key={i} className="col-6 col-md-4 col-lg">
              <div className={`cd-kpi-card ${k.cardCls} ac d${i + 1}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="cd-kpi-label">{k.label}</span>
                  <div className={`cd-kpi-icon ${k.iconCls}`}>{k.icon}</div>
                </div>
                <div className={`cd-kpi-value ${k.valCls}`}>{k.value}</div>
                <div className="cd-kpi-hint">{k.hint}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active jobs section */}
        <div className="d-flex align-items-center justify-content-between mb-3 au d2">
          <span className="cd-section-title">Active Job Posts</span>
          <button
            className="cd-btn cd-btn--primary cd-btn--sm"
            onClick={() => navigate("/company/jobs")}
          >
            <Plus size={13} /> Post a Job
          </button>
        </div>

        {/* Search */}
        <div className="au d2 mb-3">
          <div className="cd-search-wrap">
            <input
              className="cd-input"
              placeholder="Search job or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "1rem", width: "100%" }}
            />
          </div>
        </div>

        {/* Jobs grid */}
        {filtered.length === 0 ? (
          <div
            className="cd-col-empty au d3"
            style={{ padding: "4rem 1rem", textAlign: "center" }}
          >
            <div className="cd-col-empty-icon">
              <Briefcase size={22} />
            </div>
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: ".4rem",
              }}
            >
              No published jobs
            </div>
            <span style={{ fontSize: ".84rem", color: "var(--muted)" }}>
              {search
                ? "No jobs match your search."
                : "Post a job to start receiving candidates."}
            </span>
          </div>
        ) : (
          <div className="row g-3 au d3">
            {filtered.map((job, i) => (
              <div key={job.id} className={`col-12 au d${Math.min(i + 1, 6)}`}>
                <JobCard
                  job={job}
                  onClick={() => navigate(`/company/pipeline/${job.id}`)}
                />
              </div>
            ))}
            <button
              className="cd-btn cd-btn--full cd-btn--sm cd-btn--primary"
              onClick={() => navigate("/company/jobs")}
            >
              See All Jobs
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   JOB CARD  — clicks → CandidatePipeline page
════════════════════════════════════════════════════════════ */
function JobCard({ job, onClick }: { job: PublishedJob; onClick: () => void }) {
  return (
    <div
      className="cd-cand-card"
      onClick={onClick}
      style={{
        cursor: "pointer",
        padding: "1.2rem 1.4rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: ".75rem",
      }}
    >
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div>
          <div className="cd-cand-name" style={{ fontSize: ".95rem" }}>
            {job.title}
          </div>
          <div
            className="d-flex flex-wrap gap-2 mt-1"
            style={{ fontSize: ".76rem", color: "var(--muted)" }}
          >
            {job.location && (
              <span className="d-flex align-items-center gap-1">
                <MapPin size={11} />
                {job.location}
              </span>
            )}
            {job.type && (
              <span className="d-flex align-items-center gap-1">
                <Clock size={11} />
                {fmtType(job.type)}
              </span>
            )}
            {job.workMode && (
              <span className="d-flex align-items-center gap-1">
                <Globe size={11} />
                {job.workMode}
              </span>
            )}
            {(job.minSalary || job.maxSalary) && (
              <span className="d-flex align-items-center gap-1">
                <DollarSign size={11} />
                {fmtSalary(job.minSalary, job.maxSalary)}
              </span>
            )}
          </div>
        </div>
        {/* Applicant badge */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: "1.4rem",
              color: "var(--primary)",
              lineHeight: 1,
            }}
          >
            {job.applicants}
          </div>
          <div style={{ fontSize: ".7rem", color: "var(--muted)" }}>
            applicants
          </div>
        </div>
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="d-flex flex-wrap gap-1">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s} className="cd-skill-tag">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="d-flex align-items-center justify-content-between mt-auto">
        <div
          className="d-flex align-items-center gap-2"
          style={{ fontSize: ".76rem" }}
        >
          {job.newCount > 0 && (
            <span
              style={{
                background: "rgba(239,68,68,.1)",
                color: "var(--danger)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 999,
                padding: ".12rem .6rem",
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: ".7rem",
              }}
            >
              {job.newCount} new
            </span>
          )}
          {job.postedDays > 0 && (
            <span style={{ color: "var(--muted)" }}>
              Posted {job.postedDays}d ago
            </span>
          )}
          {job.deadline && (
            <span style={{ color: "var(--muted)" }}>
              Deadline:{" "}
              {new Date(job.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: ".3rem",
            color: "var(--primary)",
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: ".78rem",
          }}
        >
          View Pipeline <ArrowRight size={12} />
        </span>
      </div>
    </div>
  );
}
