import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Search,
  X,
  SlidersHorizontal,
  Briefcase,
  Sparkles,
} from "lucide-react";
import "../../../styles/Jobs.css";

import "./Joblist.css";
import { getAllJobs } from "../../../services/jobService";
import Loader from "../../../components/Loader";

import { JobType, WorkMode, type Job } from "../../../types/job";

import { fmt } from "../../../utils/format";
import ApplicantNavbar from "../../../components/ApplicantNavbar";

// ─── Mock Data ────────────────────────────────────────────────────────────────
// const JOBS: Job[] = [
//   {
//     id: 1,
//     title: "Senior Software Engineer",
//     company: "TechCorp Inc.",
//     companyInitial: "T",
//     location: "Remote",
//     salary: "$120k–$180k",
//     jobType: JobType.FULL_TIME,
//     workMode: WorkMode.REMOTE,
//     tags: ["React", "TypeScript", "Node.js"],
//     daysAgo: 2,
//     matchScore: 92,
//   },
//   {
//     id: 2,
//     title: "Product Designer",
//     company: "DesignStudio",
//     companyInitial: "D",
//     location: "New York, NY",
//     salary: "$90k–$130k",
//     jobType: JobType.FULL_TIME,
//     workMode: WorkMode.HYBRID,
//     tags: ["Figma", "UX Research"],
//     daysAgo: 4,
//     matchScore: 85,
//   },
//   {
//     id: 3,
//     title: "Data Scientist",
//     company: "InnovateLabs",
//     companyInitial: "I",
//     location: "San Francisco, CA",
//     salary: "$110k–$160k",
//     jobType: JobType.FULL_TIME,
//     workMode: WorkMode.ONSITE,
//     tags: ["Python", "ML", "SQL"],
//     daysAgo: 1,
//     matchScore: 78,
//   },
//   {
//     id: 4,
//     title: "DevOps Engineer",
//     company: "CloudBase",
//     companyInitial: "C",
//     location: "Remote",
//     salary: "$100k–$150k",
//     jobType: JobType.CONTRACT,
//     workMode: WorkMode.REMOTE,
//     tags: ["Docker", "K8s", "AWS"],
//     daysAgo: 7,
//     matchScore: 88,
//   },
//   {
//     id: 5,
//     title: "Frontend Developer",
//     company: "MediaGroup",
//     companyInitial: "M",
//     location: "Austin, TX",
//     salary: "$80k–$110k",
//     jobType: JobType.FULL_TIME,
//     workMode: WorkMode.HYBRID,
//     tags: ["Vue", "CSS", "A11y"],
//     daysAgo: 3,
//     matchScore: 81,
//   },
// ];

// ─── Component ────────────────────────────────────────────────────────────────
export default function JobList() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<JobType | "">("");
  const [modeFilter, setModeFilter] = useState<WorkMode | "">("");

  const [loading, setLoading] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  async function fetchJobs() {
    try {
      setLoading(true);
      const { data } = await getAllJobs();
      console.log(data.data);

      setJobs(data.data);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadJobs() {
      await fetchJobs();
    }
    loadJobs();
  }, []);

  const hasFilters = !!(search || locationFilter || typeFilter || modeFilter);

  // const results = jobs.filter((j) => {
  //   const q = search.toLowerCase();
  //   return (
  //     (!q ||
  //       j.title.toLowerCase().includes(q) ||
  //       j.company.toLowerCase().includes(q)) &&
  //     (!locationFilter ||
  //       j.location.toLowerCase().includes(locationFilter.toLowerCase())) &&
  //     (!typeFilter || j.jobType === typeFilter) &&
  //     (!modeFilter || j.workMode === modeFilter)
  //   );
  // });

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("");
    setTypeFilter("");
    setModeFilter("");
  };

  if (loading) {
    return <Loader text="Loading jobs..." fullPage />;
  }
  return (
    <div className="jb-page">
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <ApplicantNavbar />

      {/* ══ MAIN ════════════════════════════════════════════════ */}
      <main className="jb-main au">
        {/* Page title */}
        {/* Page title */}
        <div className="mb-4 au">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
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

            <button
              className="jb-btn jb-btn--primary"
              onClick={() => navigate("/jobs/suggestions")}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Sparkles size={15} />
              Job Suggestions
            </button>
          </div>
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
            <strong style={{ color: "var(--text)" }}>{jobs.length}</strong>{" "}
            position{jobs.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Job Cards */}
        {jobs.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {jobs.map((job, i) => (
              <div
                key={job.id}
                className={`jl-job-card au d${Math.min(i + 2, 6)}`}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <div className="d-flex align-items-start gap-3 mb-3">
                  {/* Company avatar */}
                  {/* <div className="jl-company-avatar">{job.companyInitial}</div> */}

                  {/* Title + meta */}
                  <div className="flex-1 min-width-0">
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                      <div className="jl-job-title">{job.title}</div>
                      {/* <span
                        className="jb-badge jb-badge--gray"
                        style={{ flexShrink: 0 }}
                      >
                        {job.daysAgo}d ago
                      </span> */}
                    </div>
                    <div className="jb-meta">
                      <span className="jb-meta-item">
                        <Building2 size={13} />
                        {job.company.name}
                      </span>
                      <span className="jb-meta-item">
                        <MapPin size={13} />
                        {job.location}
                      </span>
                      <span className="jb-meta-item">
                        <DollarSign size={13} />
                        {job.minSalary} - {job.maxSalary}
                      </span>
                      <span className="jb-meta-item">
                        <Clock size={13} />
                        {fmt(job.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tags + work mode */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {job.skills.map((t) => (
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
                    <span className="jl-match-num">
                      {job?.matchScore || 0}%
                    </span>
                  </div>
                  <div className="jb-track">
                    <div
                      className="jb-fill"
                      style={
                        {
                          "--w": `${job?.matchScore || 0}%`,
                        } as React.CSSProperties
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
