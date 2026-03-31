import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Edit2,
  Trash2,
  Eye,
  Play,
  PauseCircle,
  XCircle,
  Send,
  Save,
  AlertCircle,
  FileText,
  X,
  AlertTriangle,
} from "lucide-react";
import Modal from "../../components/Modal/Modal";
import "./Companyjobs.css";
import { getCompanyJobs } from "../../services/companyService";
import {
  changeJobStatus,
  createJob,
  updateJob,
  deleteJob,
} from "../../services/jobService";
import Loader from "../../components/Loader";

/* ════════════════════════════════════════════════════════════
   ENUMS
════════════════════════════════════════════════════════════ */
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

const JobStatus = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  PAUSED: "Paused",
  CLOSED: "Closed",
  FILLED: "Filled",
  EXPIRED: "Expired",
} as const;
type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
interface Job {
  id: string;
  title: string;
  company: { name: string };
  companyInitial: string;
  location: string;
  type: JobType | "";
  workMode: WorkMode | "";
  tags: string[];
  daysAgo: number;
  matchScore: number;
  status: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  requirements: string;
  positions?: number;
  maxApplications?: number;
  deadline?: string;
  companySize: string;
  industry: string;
  growth: string;
  minSalary: number | "";
  maxSalary: number | "";
  applicants: number;
  postedDays: number;
}

/* API body — requirements is string (joined by \n) */
interface JobPayload {
  title: string;
  location: string;
  minSalary: number | "";
  maxSalary: number | "";
  type: string;
  status: string;
  workMode: string;
  description: string;
  skills: string[];
  responsibilities: string[];
  requirements: string;
  positions?: number;
  maxApplications?: number;
  deadline?: string;
}

type TabType = "ALL" | JobStatus;

/* ════════════════════════════════════════════════════════════
   TAB CONFIG
════════════════════════════════════════════════════════════ */
const STATUS_TABS: Array<{ id: TabType; label: string }> = [
  { id: "ALL", label: "All" },
  { id: JobStatus.PUBLISHED, label: "Published" },
  { id: JobStatus.DRAFT, label: "Draft" },
  { id: JobStatus.PAUSED, label: "Paused" },
  { id: JobStatus.FILLED, label: "Filled" },
  { id: JobStatus.CLOSED, label: "Closed" },
  { id: JobStatus.EXPIRED, label: "Expired" },
];

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function statusBadgeClass(s: string) {
  const map: Record<string, string> = {
    [JobStatus.PUBLISHED]: "cj-badge--published",
    [JobStatus.DRAFT]: "cj-badge--draft",
    [JobStatus.PAUSED]: "cj-badge--paused",
    [JobStatus.CLOSED]: "cj-badge--closed",
    [JobStatus.FILLED]: "cj-badge--filled",
    [JobStatus.EXPIRED]: "cj-badge--expired",
  };
  return map[s] ?? "cj-badge--draft";
}

function cardStripeClass(s: string) {
  return `cj-job-card--${s.toLowerCase()}`;
}

function fmtSalary(min: number | "", max: number | "") {
  if (min === "" || max === "") return "—";
  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  return `${fmt(Number(min))} – ${fmt(Number(max))}`;
}

const fmtType = (v: string) => v.replace("_", " ");

function createEmpty(): Job {
  return {
    id: String(Date.now()),
    title: "",
    company: { name: "" },
    companyInitial: "",
    location: "",
    minSalary: "",
    maxSalary: "",
    type: "",
    workMode: "",
    status: JobStatus.DRAFT,
    description: "",
    skills: [],
    tags: [],
    responsibilities: [],
    requirements: "",
    companySize: "",
    industry: "",
    growth: "",
    applicants: 0,
    postedDays: 0,
    daysAgo: 0,
    matchScore: 0,
  };
}

function toPayload(f: Job, statusOverride?: JobStatus): JobPayload {
  return {
    title: f.title,
    location: f.location,
    minSalary: f.minSalary,
    maxSalary: f.maxSalary,
    type: f.type,
    status: statusOverride ?? f.status,
    workMode: f.workMode,
    description: f.description,
    skills: f.skills,
    responsibilities: f.responsibilities,
    requirements: f.requirements, // array → string for API
    positions: f.positions, // default to 1 position per job post
    maxApplications: f.maxApplications, // use the value from the job object
    deadline: f.deadline, // use the value from the job object
  };
}

/* ════════════════════════════════════════════════════════════
   ARRAY-INPUT  (tag-style multi-value input)
════════════════════════════════════════════════════════════ */
interface ArrayInputProps {
  label: string;
  items: string[];
  placeholder: string;
  onChange: (items: string[]) => void;
}

function ArrayInput({ label, items, placeholder, onChange }: ArrayInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (t && !items.includes(t)) {
      onChange([...items, t]);
      setDraft("");
    }
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  return (
    <div className="cj-field">
      <label className="cj-label">{label}</label>

      {items.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {items.map((item, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: ".3rem",
                background: "rgba(79,70,229,.07)",
                color: "var(--primary)",
                border: "1px solid rgba(79,70,229,.16)",
                borderRadius: 999,
                padding: ".22rem .75rem",
                fontSize: ".78rem",
                fontWeight: 500,
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => remove(i)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--primary)",
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="d-flex gap-2">
        <input
          className="cj-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          className="cj-btn cj-btn--outline cj-btn--sm"
          style={{ flexShrink: 0 }}
          onClick={add}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function CompanyJobs() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Job>(createEmpty());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── fetch ──────────────────────────────────────────────── */
  async function loadJobs() {
    try {
      setLoading(true);
      const { data } = await getCompanyJobs(
        activeTab === "ALL" ? "" : activeTab,
      );
      setJobs(data.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, [activeTab]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── counts ─────────────────────────────────────────────── */
  const tabCounts = useMemo(() => {
    const c: Record<string, number> = { ALL: jobs.length };
    Object.values(JobStatus).forEach((s) => {
      c[s] = jobs.filter((j) => j.status === s).length;
    });
    return c;
  }, [jobs]);

  const filtered = useMemo(
    () =>
      activeTab === "ALL" ? jobs : jobs.filter((j) => j.status === activeTab),
    [jobs, activeTab],
  );

  /* ── validation ─────────────────────────────────────────── */
  const salaryValid =
    formData.minSalary !== "" &&
    formData.maxSalary !== "" &&
    Number(formData.maxSalary) >= Number(formData.minSalary);
  const canSubmit = formData.title.trim().length > 0 && salaryValid;

  /* ── CREATE / UPDATE ────────────────────────────────────── */
  async function handleSubmit(statusOverride?: JobStatus) {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = toPayload(formData, statusOverride);
      if (editingJob) {
        await updateJob(editingJob.id, payload);
      } else {
        await createJob(payload);
      }
      await loadJobs();
      closeModal();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    setEditingJob(null);
    setFormData(createEmpty());
    setFormError(null);
  }

  function handleEdit(job: Job) {
    setEditingJob(job);
    setFormData({ ...job });
    setModalOpen(true);
  }

  function openNew() {
    setFormData(createEmpty());
    setEditingJob(null);
    setModalOpen(true);
  }

  /* ── DELETE ─────────────────────────────────────────────── */
  function requestDelete(job: Job) {
    setDeleteTarget(job);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteJob(deleteTarget.id);
      await loadJobs();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  /* ── STATUS CHANGE ──────────────────────────────────────── */
  async function updateStatus(id: string, status: JobStatus) {
    try {
      await changeJobStatus(id, status);
      await loadJobs();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  const set = (key: keyof Job, val: unknown) =>
    setFormData((p) => ({ ...p, [key]: val }));

  /* ── RENDER ─────────────────────────────────────────────── */
  if (loading) return <Loader text="Loading Jobs..." fullPage />;

  return (
    <div className="cj-page">
      {/* HEADER */}
      <header className={`cj-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="cj-logo">H</div>
              <span className="cj-brand">Hakeem</span>
            </div>
            <button
              className="cj-btn cj-btn--outline cj-btn--sm"
              onClick={() => navigate("/company/dashboard")}
            >
              <ChevronLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="cj-main">
        {/* Heading */}
        <div className="d-flex align-items-start justify-content-between mb-4 au">
          <div>
            <h1 className="cj-page-title">My Job Posts</h1>
            <p className="cj-page-sub">
              Manage, publish, and track all your open positions
            </p>
          </div>
          <button className="cj-btn cj-btn--primary" onClick={openNew}>
            <Plus size={15} /> Post a Job
          </button>
        </div>

        {/* Tabs */}
        <div className="cj-tabs mb-4 au d1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              className={`cj-tab ${activeTab === t.id ? "cj-tab--active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              {(tabCounts[t.id] ?? 0) > 0 && (
                <span className="cj-tab-count">{tabCounts[t.id]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Job list */}
        {filtered.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {filtered.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                delay={i}
                onView={() => navigate(`/jobs/${job.id}`)}
                onEdit={() => handleEdit(job)}
                onDelete={() => requestDelete(job)}
                onUpdateStatus={(s) => updateStatus(job.id, s)}
              />
            ))}
          </div>
        ) : (
          <div className="cj-empty au d2">
            <div className="cj-empty-icon">
              <Briefcase size={24} />
            </div>
            <div className="cj-empty-title">No jobs in this category</div>
            <span className="cj-empty-sub">
              {activeTab === "ALL"
                ? "Post your first job to get started."
                : `No ${activeTab.toLowerCase()} jobs found.`}
            </span>
            {activeTab === "ALL" && (
              <button
                className="cj-btn cj-btn--primary cj-btn--sm mt-2"
                onClick={openNew}
              >
                <Plus size={13} /> Post a Job
              </button>
            )}
          </div>
        )}
      </main>

      {/* ══ MODAL — Job Form ════════════════════════════════ */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingJob ? "Edit Job Post" : "New Job Post"}
        icon={<FileText size={15} />}
        size="lg"
        footer={
          <>
            <button
              className="cj-btn cj-btn--ghost cj-btn--sm"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="cj-btn cj-btn--outline cj-btn--sm"
              disabled={!canSubmit || submitting}
              style={{ opacity: canSubmit && !submitting ? 1 : 0.45 }}
              onClick={() => handleSubmit(JobStatus.DRAFT)}
            >
              <Save size={13} />
              {submitting ? "Saving…" : "Save Draft"}
            </button>
            <button
              className="cj-btn cj-btn--primary cj-btn--sm"
              disabled={!canSubmit || submitting}
              style={{ opacity: canSubmit && !submitting ? 1 : 0.45 }}
              onClick={() => handleSubmit(JobStatus.PUBLISHED)}
            >
              <Send size={13} />
              {submitting ? "Publishing…" : "Publish Now"}
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-12 col-sm-6">
            <div className="cj-field">
              <label className="cj-label">
                Job Title <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                className="cj-input"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-sm-6">
            <div className="cj-field">
              <label className="cj-label">Location</label>
              <input
                className="cj-input"
                placeholder="e.g. Remote"
                value={formData.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-sm-3">
            <div className="cj-field">
              <label className="cj-label">Min Salary</label>
              <input
                className="cj-input"
                type="number"
                placeholder="80000"
                value={formData.minSalary}
                onChange={(e) =>
                  set(
                    "minSalary",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </div>
          </div>

          <div className="col-6 col-sm-3">
            <div className="cj-field">
              <label className="cj-label">Max Salary</label>
              <input
                className="cj-input"
                type="number"
                placeholder="120000"
                value={formData.maxSalary}
                onChange={(e) =>
                  set(
                    "maxSalary",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </div>
          </div>

          <div className="col-12 col-sm-3">
            <div className="cj-field">
              <label className="cj-label">Job Type</label>
              <select
                className="cj-select"
                value={formData.type}
                onChange={(e) => set("type", e.target.value as JobType)}
              >
                <option value="">Select type</option>
                {Object.values(JobType).map((t) => (
                  <option key={t} value={t}>
                    {fmtType(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 col-sm-3">
            <div className="cj-field">
              <label className="cj-label">Work Mode</label>
              <select
                className="cj-select"
                value={formData.workMode}
                onChange={(e) => set("workMode", e.target.value as WorkMode)}
              >
                <option value="">Select mode</option>
                {Object.values(WorkMode).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12">
            <div className="cj-field">
              <label className="cj-label">Description</label>
              <textarea
                className="cj-textarea"
                placeholder="Describe the role and ideal candidate…"
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </div>

          <div className="col-12">
            <ArrayInput
              label="Skills"
              items={formData.skills}
              placeholder="e.g. React  (Enter or click +)"
              onChange={(v) => set("skills", v)}
            />
          </div>

          <div className="col-12">
            <ArrayInput
              label="Responsibilities"
              items={formData.responsibilities}
              placeholder="e.g. Build scalable APIs  (Enter or click +)"
              onChange={(v) => set("responsibilities", v)}
            />
          </div>

          <div className="col-12">
            <label className="cj-label">Requirements</label>
            <textarea
              className="cj-textarea"
              placeholder="List the requirements for the role…"
              value={formData.requirements}
              onChange={(e) => set("requirements", e.target.value)}
            />
          </div>

          <div className="col-6">
            <div className="cj-field">
              <label className="cj-label">Position Availability</label>

              <input
                className="cj-input w-100"
                type="number"
                value={formData.positions}
                onChange={(e) => set("positions", Number(e.target.value))}
                style={{ width: 100 }}
                min={1}
              />
            </div>
          </div>

          <div className="col-6 ">
            <div className="cj-field">
              <label className="cj-label">Max Applicants</label>
              <input
                className="cj-input w-100"
                type="number"
                value={formData.maxApplications}
                onChange={(e) => set("maxApplications", Number(e.target.value))}
                style={{ width: 100 }}
                min={1}
              />
            </div>
          </div>

          <div className="col-12">
            <div className="cj-field">
              <label className="cj-label">Application Deadline</label>
              <input
                className="cj-input"
                type="date"
                value={formData.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
          </div>


          {formData.minSalary !== "" &&
            formData.maxSalary !== "" &&
            !salaryValid && (
              <div className="col-12">
                <div className="cj-error">
                  <AlertCircle size={13} /> Max salary must be ≥ min salary
                </div>
              </div>
            )}

          {formError && (
            <div className="col-12">
              <div className="cj-error">
                <AlertCircle size={13} /> {formError}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ══ MODAL — Delete Confirm ════════════════════════════ */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Job Post"
        icon={<AlertTriangle size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="cj-btn cj-btn--ghost cj-btn--sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              className="cj-btn cj-btn--danger cj-btn--sm"
              onClick={confirmDelete}
              disabled={deleteLoading}
              style={{ opacity: deleteLoading ? 0.55 : 1 }}
            >
              <Trash2 size={13} />
              {deleteLoading ? "Deleting…" : "Yes, Delete"}
            </button>
          </>
        }
      >
        <div
          style={{
            background: "rgba(239,68,68,.05)",
            border: "1px solid rgba(239,68,68,.18)",
            borderRadius: 12,
            padding: "1rem 1.1rem",
          }}
        >
          <p
            style={{
              fontSize: ".85rem",
              color: "var(--muted)",
              marginBottom: ".4rem",
            }}
          >
            You're about to permanently delete:
          </p>
          <p
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              color: "var(--text)",
              fontSize: ".95rem",
              marginBottom: ".4rem",
            }}
          >
            {deleteTarget?.title}
          </p>
          <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>
            This cannot be undone. All applicant data for this job will also be
            removed.
          </p>
        </div>
      </Modal>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   JOB CARD
════════════════════════════════════════════════════════════ */
interface JobCardProps {
  job: Job;
  delay: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (s: JobStatus) => void;
}

function JobCard({
  job,
  delay,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
}: JobCardProps) {
  return (
    <div
      className={`cj-job-card ${cardStripeClass(job.status)} au d${Math.min(delay + 1, 6)}`}
    >
      <div className="cj-job-header">
        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
          <div className="cj-job-title">{job.title}</div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {job.applicants > 0 && (
              <span
                style={{
                  fontSize: ".76rem",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: ".28rem",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
                </svg>
                {job.applicants} applicants
              </span>
            )}
            <span className={`cj-badge ${statusBadgeClass(job.status)}`}>
              <span className="cj-badge-dot" />
              {job.status}
            </span>
          </div>
        </div>
      </div>

      <div className="cj-job-body">
        <div className="cj-meta mb-3">
          {job.location && (
            <span className="cj-meta-item">
              <MapPin size={13} />
              {job.location}
            </span>
          )}
          {job.minSalary !== "" && job.maxSalary !== "" && (
            <span className="cj-meta-item">
              <DollarSign size={13} />
              {fmtSalary(job.minSalary, job.maxSalary)}
            </span>
          )}
          {job.type && (
            <span className="cj-meta-item">
              <Clock size={13} />
              {fmtType(String(job.type))}
            </span>
          )}
          {job.workMode && (
            <span className="cj-meta-item">
              <Globe size={13} />
              {job.workMode}
            </span>
          )}
          {
            job.positions !== undefined && (
              <span className="cj-meta-item">
                <Briefcase size={13} />
                {job.positions} positions
              </span>
            )
          }
          {
            job.maxApplications !== undefined && (
              <span className="cj-meta-item">
                <FileText size={13} />
                {job.maxApplications} applications
              </span>
            )
          }

          
          {job.postedDays > 0 && (
            <span className="cj-meta-item ms-auto">
              Posted {job.postedDays}d ago
            </span>
          )}
          {job.deadline && (
            <span className="cj-meta-item ms-auto">
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {job.skills.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {job.skills.slice(0, 5).map((s) => (
              <span key={s} className="cj-skill-tag">
                {s}
              </span>
            ))}
          </div>
        )}

        {job.description && (
          <p
            style={{
              fontSize: ".83rem",
              color: "var(--muted)",
              lineHeight: 1.65,
              marginBottom: ".75rem",
            }}
          >
            {job.description.length > 120
              ? job.description.slice(0, 120) + "…"
              : job.description}
          </p>
        )}

        <div className="cj-actions">
          <button
            className="cj-btn cj-btn--outline cj-btn--xs"
            onClick={onView}
          >
            <Eye size={12} /> View
          </button>
          <button
            className="cj-btn cj-btn--outline cj-btn--xs"
            onClick={onEdit}
          >
            <Edit2 size={12} /> Edit
          </button>

          {job.status === JobStatus.DRAFT && (
            <button
              className="cj-btn cj-btn--success-soft cj-btn--xs"
              onClick={() => onUpdateStatus(JobStatus.PUBLISHED)}
            >
              <Send size={12} /> Publish
            </button>
          )}
          {job.status === JobStatus.PAUSED && (
            <button
              className="cj-btn cj-btn--success-soft cj-btn--xs"
              onClick={() => onUpdateStatus(JobStatus.PUBLISHED)}
            >
              <Play size={12} /> Resume
            </button>
          )}
          {job.status === JobStatus.PUBLISHED && (
            <>
              <button
                className="cj-btn cj-btn--outline cj-btn--xs"
                onClick={() => onUpdateStatus(JobStatus.PAUSED)}
              >
                <PauseCircle size={12} /> Pause
              </button>
              <button
                className="cj-btn cj-btn--outline cj-btn--xs"
                onClick={() => onUpdateStatus(JobStatus.CLOSED)}
              >
                <XCircle size={12} /> Close
              </button>
              {/* <button
                className="cj-btn cj-btn--outline cj-btn--xs"
                onClick={() => onUpdateStatus(JobStatus.FILLED)}
              >
                <CheckSquare size={12} /> Mark Filled
              </button> */}
            </>
          )}

          <button
            className="cj-btn cj-btn--danger cj-btn--xs ms-auto"
            onClick={onDelete}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
