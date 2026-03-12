import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Search,
  X,
  ChevronLeft,
  SlidersHorizontal,
  Briefcase,
} from "lucide-react";
import "../../styles/Jobs.css";
import "./JobList.css";

// ─── Enums & Types ────────────────────────────────────────────────────────────
const JobType = {
  FULL_TIME: "Full_Time",
  PART_TIME: "Part_Time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
} as const;

type JobType = (typeof JobType)[keyof typeof JobType];

const WorkMode = {
  ONSITE: "Onsite",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
} as const;

type WorkMode = (typeof WorkMode)[keyof typeof WorkMode];

interface Job {
  id: number;
  title: string;
  company: string;
  companyInitial: string;
  location: string;
  salary: string;
  jobType: JobType;
  workMode: WorkMode;
  tags: string[];
  daysAgo: number;
  matchScore: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const JOBS: Job[] = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    companyInitial: "T",
    location: "Remote",
    salary: "$120k–$180k",
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    tags: ["React", "TypeScript", "Node.js"],
    daysAgo: 2,
    matchScore: 92,
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignStudio",
    companyInitial: "D",
    location: "New York, NY",
    salary: "$90k–$130k",
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    tags: ["Figma", "UX Research"],
    daysAgo: 4,
    matchScore: 85,
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "InnovateLabs",
    companyInitial: "I",
    location: "San Francisco, CA",
    salary: "$110k–$160k",
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    tags: ["Python", "ML", "SQL"],
    daysAgo: 1,
    matchScore: 78,
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "CloudBase",
    companyInitial: "C",
    location: "Remote",
    salary: "$100k–$150k",
    jobType: JobType.CONTRACT,
    workMode: WorkMode.REMOTE,
    tags: ["Docker", "K8s", "AWS"],
    daysAgo: 7,
    matchScore: 88,
  },
  {
    id: 5,
    title: "Frontend Developer",
    company: "MediaGroup",
    companyInitial: "M",
    location: "Austin, TX",
    salary: "$80k–$110k",
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    tags: ["Vue", "CSS", "A11y"],
    daysAgo: 3,
    matchScore: 81,
  },
];

const fmt = (v: string) => v.replace("_", " ");

// ─── Component ────────────────────────────────────────────────────────────────
export default function JobList() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<JobType | "">("");
  const [modeFilter, setModeFilter] = useState<WorkMode | "">("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const hasFilters = !!(search || locationFilter || typeFilter || modeFilter);

  const results = JOBS.filter((j) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q)) &&
      (!locationFilter ||
        j.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
      (!typeFilter || j.jobType === typeFilter) &&
      (!modeFilter || j.workMode === modeFilter)
    );
  });

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("");
    setTypeFilter("");
    setModeFilter("");
  };

  return (
    <div className="jb-page">
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className={`jb-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="jb-logo">H</div>
              <span className="jb-brand">Hakeem</span>
            </div>
            <button
              className="jb-btn jb-btn--outline jb-btn--sm"
              onClick={() => navigate("/applicant")}
            >
              <ChevronLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ══ MAIN ════════════════════════════════════════════════ */}
      <main className="jb-main au">
        {/* Page title */}
        <div className="mb-4 au">
          <h1
            className="jb-page-title"
            style={{
              fontSize: "clamp(1.5rem,3vw,2rem)",
              fontWeight: 800,
              letterSpacing: "-.03em",
              marginBottom: ".3rem",
            }}
          >
            Explore Open Positions
          </h1>
          <p style={{ fontSize: ".9rem", color: "var(--muted)" }}>
            Discover opportunities matched to your profile
          </p>
        </div>

        {/* Search + Filters */}
        <div className="jb-card mb-4 au d1">
          <div className="jb-card-body">
            {/* Search */}
            <div className="jl-search-wrap mb-3">
              <Search size={15} className="jl-search-icon" />
              <input
                className="jb-input jl-search-input"
                placeholder="Search by title or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter row */}
            <div className="row g-2 align-items-end">
              <div className="col-12 col-sm-6 col-lg-3">
                <label className="jb-label">Location</label>
                <input
                  className="jb-input"
                  placeholder="e.g. Remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="jb-label">Job Type</label>
                <select
                  className="jb-select"
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as JobType | "")
                  }
                >
                  <option value="">All Types</option>
                  {Object.values(JobType).map((t: string) => (
                    <option key={t} value={t}>
                      {fmt(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <label className="jb-label">Work Mode</label>
                <select
                  className="jb-select"
                  value={modeFilter}
                  onChange={(e) =>
                    setModeFilter(e.target.value as WorkMode | "")
                  }
                >
                  <option value="">All Modes</option>
                  {Object.values(WorkMode).map((m: string) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg-3">
                <button
                  className="jb-btn jb-btn--outline jb-btn--full"
                  style={{ opacity: hasFilters ? 1 : 0.45 }}
                  disabled={!hasFilters}
                  onClick={clearFilters}
                >
                  <X size={13} /> Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="d-flex align-items-center gap-2 mb-3 au d2">
          <SlidersHorizontal size={13} style={{ color: "var(--muted)" }} />
          <span className="jl-count">
            <strong style={{ color: "var(--text)" }}>{results.length}</strong>{" "}
            position{results.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Job Cards */}
        {results.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {results.map((job, i) => (
              <div
                key={job.id}
                className={`jl-job-card au d${Math.min(i + 2, 6)}`}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="d-flex align-items-start gap-3 mb-3">
                  {/* Company avatar */}
                  <div className="jl-company-avatar">{job.companyInitial}</div>

                  {/* Title + meta */}
                  <div className="flex-1 min-width-0">
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                      <div className="jl-job-title">{job.title}</div>
                      <span
                        className="jb-badge jb-badge--gray"
                        style={{ flexShrink: 0 }}
                      >
                        {job.daysAgo}d ago
                      </span>
                    </div>
                    <div className="jb-meta">
                      <span className="jb-meta-item">
                        <Building2 size={13} />
                        {job.company}
                      </span>
                      <span className="jb-meta-item">
                        <MapPin size={13} />
                        {job.location}
                      </span>
                      <span className="jb-meta-item">
                        <DollarSign size={13} />
                        {job.salary}
                      </span>
                      <span className="jb-meta-item">
                        <Clock size={13} />
                        {fmt(job.jobType)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags + work mode */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {job.tags.map((t) => (
                    <span key={t} className="jb-tag">
                      {t}
                    </span>
                  ))}
                  <span className="jb-badge jb-badge--indigo">
                    {job.workMode}
                  </span>
                </div>

                {/* AI Match mini bar */}
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="jl-match-label">AI Match</span>
                    <span className="jl-match-num">{job.matchScore}%</span>
                  </div>
                  <div className="jb-track">
                    <div
                      className="jb-fill"
                      style={
                        { "--w": `${job.matchScore}%` } as React.CSSProperties
                      }
                    />
                  </div>
                </div>

                {/* Actions */}
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
                  <button
                    className="jb-btn jb-btn--primary jb-btn--sm"
                    onClick={() => navigate(`/jobs/${job.id}/apply`)}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="jl-empty au d2">
            <div className="jl-empty-icon">
              <Briefcase size={22} />
            </div>
            <div className="jl-empty-title">No positions found</div>
            <span style={{ fontSize: ".85rem" }}>
              Try adjusting your search or filters
            </span>
          </div>
        )}
      </main>
    </div>
  );
}
