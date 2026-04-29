import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Briefcase,
  AlertCircle,
  FileText,
  X,
  AlertTriangle,
  Trash2,
  Save,
  // Send,
} from "lucide-react";
import Modal from "../../../components/Modal/Modal";
import "./Companyjobs.css";
import { getCompanyJobs } from "../../../services/companyService";
import {
  changeJobStatus,
  createJob,
  updateJob,
  deleteJob,
} from "../../../services/jobService";
import Loader from "../../../components/Loader";
import JobCard from "../../../components/JobCard/JobCard";
// import CandidateSuggestions from "../../components/Candidatesuggestions/Candidatesuggestions";
import {
  JobType,
  WorkMode,
  JobStatus,
  Seniority,
  type Job,
  type JobPayload,
} from "../../../types/job";

/* ════════════════════════════════════════════════════════════
   ENUMS
════════════════════════════════════════════════════════════ */

const IndustryName = {
  SOFTWARE_DEVELOPMENT: "Software Development",
  ARTIFICIAL_INTELLIGENCE: "Artificial Intelligence & Machine Learning",
  DATA_SCIENCE: "Data Science & Big Data",
  CYBERSECURITY: "Cybersecurity",
  CLOUD_COMPUTING: "Cloud Computing",
  NETWORKING: "Networking & Infrastructure",
  EMBEDDED_SYSTEMS: "Embedded Systems & IoT",
  GAME_DEVELOPMENT: "Game Development",
  UI_UX_DESIGN: "UI/UX Design",
  BLOCKCHAIN: "Blockchain & FinTech",
  AR_VR: "AR / VR (Augmented & Virtual Reality)",
  HARDWARE: "Hardware & Electronics",
} as const;
type IndustryName = (typeof IndustryName)[keyof typeof IndustryName];

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
const fmtType = (v: string) => v.replace("_", " ");

function createEmpty(): Job {
  return {
    id: String(Date.now()),
    title: "",
    company: { name: "" },
    companyInitial: "",
    location: "",
    acceptedCount: 0,
    applicationsCount: 0,
    minSalary: "",
    maxSalary: "",
    seniority: Seniority.FRESH,
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

function toPayload(f: Job): JobPayload {
  return {
    title: f.title,
    location: f.location,
    minSalary: f.minSalary,
    maxSalary: f.maxSalary,
    type: f.type,
    seniority: f.seniority,
    // status: statusOverride ?? f.status,
    workMode: f.workMode,
    description: f.description,
    skills: f.skills,
    responsibilities: f.responsibilities,
    requirements: f.requirements,
    positions: f.positions,
    maxApplications: f.maxApplications,
    deadline: f.deadline,
    industry: f.industry,
  };
}

/* ════════════════════════════════════════════════════════════
   ARRAY INPUT
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
   MAIN PAGE COMPONENT
════════════════════════════════════════════════════════════ */
export default function CompanyJobs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<Job>(createEmpty());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── fetch ── */
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

  /* ── counts ── */
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

  /* ── validation ── */
  const salaryValid =
    formData.minSalary !== "" &&
    formData.maxSalary !== "" &&
    Number(formData.maxSalary) >= Number(formData.minSalary);
  const canSubmit = formData.title.trim().length > 0 && salaryValid;

  /* ── create / update ── */
  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const payload = toPayload(formData);
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

  /* ── delete ── */
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

  /* ── status change ── */
  async function updateStatus(id: string, status: JobStatus) {
    try {
      await changeJobStatus(id, status);
      await loadJobs();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  }

  /* ── invite (dummy — سجّل في الكونسول لحد ما الـ API يكون جاهز) ── */
  // function handleInviteCandidate(candidateId: string, jobId: string) {
  //   console.log("Invite candidate:", candidateId, "for job:", jobId);
  //   // TODO: استبدل بـ API call لما يكون جاهز
  //   // await axiosInstance.post(`/candidates/${candidateId}/invite`, { jobId });
  // }

  const set = (key: keyof Job, val: unknown) =>
    setFormData((p) => ({ ...p, [key]: val }));

  /* ── render ── */
  if (loading) return <Loader text="Loading Jobs..." fullPage />;

  return (
    <div className="cj-page">


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

        {/* Two-column layout */}
        <div className="cj-content-grid">
          {/* Left: jobs */}
          <div className="cj-jobs-col">
            {filtered.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {filtered.map((job, i) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    delay={i}
                    onView={() => navigate(`/jobs/${job.id}`)}
                    onEdit={() => handleEdit(job)}
                    onDelete={() => setDeleteTarget(job)}
                    onPipeline={() => navigate(`/company/pipeline/${job.id}`)}
                    onCandidates={() =>
                      navigate(`/company/jobs/candidates/${job.id}`)
                    }
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
          </div>

          {/* Right: suggestions */}
          {/* <CandidateSuggestions
            jobs={jobs}
            onInvite={handleInviteCandidate}
            onViewAll={() => navigate("/company/candidates")}
          /> */}
        </div>
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
              onClick={() => handleSubmit()}
            >
              <Save size={13} />
              {submitting ? "Saving…" : "Save Draft"}
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
              <label className="cj-label">Seniority</label>
              <select
                className="cj-select"
                value={formData.seniority}
                onChange={(e) => set("seniority", e.target.value as Seniority)}
              >
                <option value="">Select seniority</option>
                {Object.values(Seniority).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-12">
            <div className="cj-field">
              <label className="cj-label">Industry</label>
              <select
                className="cj-select"
                value={formData.industry}
                onChange={(e) =>
                  set("industry", e.target.value as IndustryName)
                }
              >
                <option value="">Select industry</option>
                {Object.values(IndustryName).map((i) => (
                  <option key={i} value={i}>
                    {i}
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
                min={1}
              />
            </div>
          </div>

          <div className="col-6">
            <div className="cj-field">
              <label className="cj-label">Max Applicants</label>
              <input
                className="cj-input w-100"
                type="number"
                value={formData.maxApplications}
                onChange={(e) => set("maxApplications", Number(e.target.value))}
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
