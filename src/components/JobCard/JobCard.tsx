import {
  Eye,
  Edit2,
  Send,
  PauseCircle,
  XCircle,
  Play,
  Trash2,
  FileText,
  CheckCircle,
  MapPin,
  DollarSign,
  Clock,
  Globe,
  Briefcase,
  GitBranch,
  Users,
  User,
  UserPlus,
} from "lucide-react";
import { type Job, JobStatus } from "../../types/job";

/* ════════════════════════════════════════════════════════════
   ENUMS (re-exported so consumers don't need to re-declare)
════════════════════════════════════════════════════════════ */

export interface JobCardProps {
  job: Job;
  delay: number;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onApply?: () => void;
  onPipeline?: () => void;
  onCandidates?: () => void;
  onUpdateStatus?: (s: JobStatus) => void;
}

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

/* ════════════════════════════════════════════════════════════
   JOB CARD COMPONENT
════════════════════════════════════════════════════════════ */
export default function JobCard({
  job,
  delay,
  onView,
  onEdit,
  onDelete,
  onApply,
  onPipeline,
  onUpdateStatus,
  onCandidates,
}: JobCardProps) {
  return (
    <div
      className={`cj-job-card ${cardStripeClass(job.status)} au d${Math.min(delay + 1, 6)}`}
    >
      {/* ── Header ── */}
      <div className="cj-job-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <div className="cj-job-title">{job.title}</div>
            <div className="cj-sub-title">{job.location}</div>
          </div>
          <span className={`cj-badge ${statusBadgeClass(job.status)}`}>
            <span className="cj-badge-dot" />
            {job.status}
          </span>
        </div>

        {/* Stats Row */}
        <div className="cj-stats">
          <span>
            <FileText size={13} /> {job.applicationsCount} Applied
          </span>
          <span>
            <CheckCircle size={13} /> {job.acceptedCount} Accepted
          </span>
        </div>
      </div>

      {/* ── Body ── */}
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
          {job.seniority && (
            <span className="cj-meta-item">
              <User size={13} />
              {job.seniority}
            </span>
          )}
          {job.positions !== undefined && (
            <span className="cj-meta-item">
              <Briefcase size={13} />
              {job.positions} positions
            </span>
          )}
          {job.maxApplications !== undefined && (
            <span className="cj-meta-item">
              <FileText size={13} />
              {job.maxApplications} max applicants
            </span>
          )}
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

        {/* ── Action Bar ── */}
        <div className="cj-actions">
          {onView && (
            <button
              className="cj-btn cj-btn--outline cj-btn--xs"
              onClick={onView}
            >
              <Eye size={12} /> View
            </button>
          )}

          {onEdit && (
            <button
              className="cj-btn cj-btn--outline cj-btn--xs"
              onClick={onEdit}
            >
              <Edit2 size={12} /> Edit
            </button>
          )}

          {/* ✅ View Pipeline button */}
          {onPipeline && (
            <button
              className="cj-btn cj-btn--pipeline cj-btn--xs"
              onClick={onPipeline}
            >
              <GitBranch size={12} /> View Pipeline
            </button>
          )}
          {onCandidates && (
            <button
              className="cj-btn cj-btn--candidates cj-btn--xs"
              onClick={onCandidates}
            >
              <Users size={12} /> Candidates
            </button>
          )}

          {job.status === JobStatus.DRAFT && onUpdateStatus && (
            <button
              className="cj-btn cj-btn--success-soft cj-btn--xs"
              onClick={() => onUpdateStatus?.(JobStatus.PUBLISHED)}
            >
              <Send size={12} /> Publish
            </button>
          )}

          {job.status === JobStatus.PAUSED && onUpdateStatus && (
            <button
              className="cj-btn cj-btn--success-soft cj-btn--xs"
              onClick={() => onUpdateStatus?.(JobStatus.PUBLISHED)}
            >
              <Play size={12} /> Resume
            </button>
          )}

          {job.status === JobStatus.PUBLISHED && onUpdateStatus && (
            <>
              <button
                className="cj-btn cj-btn--outline cj-btn--xs"
                onClick={() => onUpdateStatus?.(JobStatus.PAUSED)}
              >
                <PauseCircle size={12} /> Pause
              </button>
              <button
                className="cj-btn cj-btn--outline cj-btn--xs"
                onClick={() => onUpdateStatus?.(JobStatus.CLOSED)}
              >
                <XCircle size={12} /> Close
              </button>
            </>
          )}

          {onDelete && (
            <button
              className="cj-btn cj-btn--danger cj-btn--xs ms-auto"
              onClick={onDelete}
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
          {onApply && (
            <button
              className="cj-btn cj-btn--primary cj-btn--xs ms-auto"
              onClick={onApply}
            >
              <UserPlus size={12} /> Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
