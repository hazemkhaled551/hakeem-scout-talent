import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  ChevronLeft,
  Briefcase,
  // Globe,
  // Users,
  // TrendingUp,
} from "lucide-react";
import "../../styles/Jobs.css";
import "./Jobdetails.css";
import { getJobById } from "../../services/jobService";
import Loader from "../../components/Loader";
import { fmt, companyIntiatal } from "../../utils/format";
import { type Job } from "../../types/job";

// ─── Component ────────────────────────────────────────────────────────────────
export default function JobDetails() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);

  console.log(jobId);
  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        if (!jobId) return;
        const data = await getJobById(jobId);
        setJob(data.data.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [jobId]);

  // In production, replace with API call using jobId
  // const job: Job = { ...MOCK_JOB, id: jobId };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (loading) {
    return <Loader fullPage text="Loading job details..." />;
    // return <Loader text="Loading job details..." />; // For non-fullPage loader, adjust styling to center it within the main content area
  }
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
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={14} /> Back
            </button>
          </div>
        </div>
      </header>

      {/* ══ MAIN ════════════════════════════════════════════════ */}
      <main className="jb-main">
        {/* ── Hero block ──────────────────────────────────────── */}
        <div className="jd-hero mb-4 au">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="jd-company-avatar">
              {companyIntiatal(job?.company?.name)}
            </div>
            <div className="flex-1">
              <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                <h1 className="jd-title">{job?.title}</h1>
                {/* <span className="jb-badge jb-badge--green">
                  <span
                    className="jb-badge--dot"
                    style={{ background: "var(--success)" }}
                  />
                  {job?.status}
                </span> */}
              </div>
              <div className="jb-meta mt-2">
                <span className="jb-meta-item">
                  <Building2 size={13} />
                  {job?.company?.name}
                </span>
                <span className="jb-meta-item">
                  <MapPin size={13} />
                  {job?.location}
                </span>
                <span className="jb-meta-item">
                  <DollarSign size={13} />
                  {job?.minSalary} - {job?.maxSalary}
                </span>
                <span className="jb-meta-item">
                  <Clock size={13} />
                  {fmt(job?.type)}
                </span>
              </div>
            </div>
          </div>

          {/* Company quick stats */}
          {/* <div className="row g-3 mt-1">
            {[
              {
                icon: <Users size={14} />,
                label: "Company Size",
                value: job?.companySize,
              },
              {
                icon: <Globe size={14} />,
                label: "Industry",
                value: job?.industry,
              },
              {
                icon: <TrendingUp size={14} />,
                label: "Stage",
                value: job?.growth,
              },
            ].map((s, i) => (
              <div key={i} className="col-auto">
                <div
                  style={{
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: ".35rem",
                  }}
                >
                  {s.icon}
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    {s.value}
                  </span>
                  &nbsp;·&nbsp;{s.label}
                </div>
              </div>
            ))}
          </div> */}
        </div>

        {/* ── About the role ──────────────────────────────────── */}
        <div className="jb-card mb-3 au d1">
          <div className="jb-card-header">
            <span className="jb-card-title">
              <Briefcase size={15} />
              About the Role
            </span>
          </div>
          <div className="jb-card-body">
            <p className="jd-prose">{job?.description}</p>
          </div>
        </div>

        {/* ── Required Skills ─────────────────────────────────── */}
        <div className="jb-card mb-3 au d2">
          <div className="jb-card-header">
            <span className="jb-card-title">Required Skills</span>
          </div>
          <div className="jb-card-body">
            <div className="d-flex flex-wrap gap-2">
              {job?.skills.map((s) => (
                <span key={s} className="jb-tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Responsibilities + Requirements side-by-side on md+ */}
        <div className="row g-3 mb-4 au d3">
          <div className="col-12 col-md-6">
            <div className="jb-card h-100">
              <div className="jb-card-header">
                <span className="jb-card-title">Responsibilities</span>
              </div>
              <div className="jb-card-body d-flex flex-column gap-3">
                {job?.responsibilities.map((r, i) => (
                  <div key={i} className="jb-check">
                    <CheckCircle
                      size={16}
                      className="jb-check-icon"
                      style={{ color: "var(--success)" }}
                    />
                    <span className="jb-check-text">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="jb-card h-100">
              <div className="jb-card-header">
                <span className="jb-card-title">Requirements</span>
              </div>
              <div className="jb-card-body d-flex flex-column gap-3">
                <div className="jb-check">
                  <CheckCircle
                    size={16}
                    className="jb-check-icon"
                    style={{ color: "var(--primary)" }}
                  />
                  <span className="jb-check-text">{job?.requirements}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Apply bar ────────────────────────────────── */}
        <div className="jd-apply-bar au d4">
          <button
            className="jb-btn jb-btn--primary jb-btn--lg"
            onClick={() => navigate(`/jobs/${job?.id}/apply`)}
          >
            Apply Now
          </button>
        </div>
      </main>
    </div>
  );
}
