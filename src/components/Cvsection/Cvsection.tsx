import { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  AlertOctagon,
  CheckCircle,
  Clock,
  X,
  Plus,
} from "lucide-react";
import { uploadCV, getAllCVs, deleteCV } from "../../services/cvService";

import "./Cvsection.css";
/* ────────────────────────────────────────────────────────────
   TYPES
──────────────────────────────────────────────────────────── */
interface CV {
  id: string;
  name: string;
  createdAt: string;
  url?: string;
}

/* ────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────── */
function formatCVDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// function fileSizeLabel(bytes?: number) {
//   if (!bytes) return null;
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

/* ────────────────────────────────────────────────────────────
   SUB-COMPONENTS
──────────────────────────────────────────────────────────── */
function CVCard({ cv, onDelete }: { cv: CV; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="cv-card">
      <div className="cv-card__icon-wrap">
        <FileText size={20} className="cv-card__icon" />
      </div>

      <div className="cv-card__info">
        <div className="cv-card__name">{cv.name}</div>
        <div className="cv-card__meta">
          <Clock size={11} />
          {formatCVDate(cv.createdAt)}
        </div>
      </div>

      <div className="cv-card__actions">
        {cv.url && (
          <a
            href={cv.url}
            target="_blank"
            rel="noreferrer"
            className="pr-btn-outline pr-btn-sm"
            style={{ textDecoration: "none" }}
          >
            View
          </a>
        )}

        {confirming ? (
          <div className="cv-card__confirm">
            <span className="cv-card__confirm-label">Delete?</span>
            <button
              className="pr-btn-danger pr-btn-sm"
              onClick={() => onDelete(cv.id)}
            >
              Yes
            </button>
            <button
              className="pr-btn-ghost pr-btn-sm"
              onClick={() => setConfirming(false)}
            >
              No
            </button>
          </div>
        ) : (
          <button
            className="pr-icon-btn pr-icon-btn--danger"
            title="Delete CV"
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function DropZone({
  onFile,
  uploading,
}: {
  onFile: (f: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  }

  return (
    <div
      className={`cv-dropzone${dragging ? " cv-dropzone--over" : ""}${uploading ? " cv-dropzone--uploading" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      <div className="cv-dropzone__icon">
        {uploading ? (
          <div className="cv-dropzone__spinner" />
        ) : (
          <Upload size={22} />
        )}
      </div>

      <div className="cv-dropzone__text">
        {uploading ? (
          "Uploading…"
        ) : (
          <>
            <span className="cv-dropzone__cta">Click to upload</span> or drag
            &amp; drop
          </>
        )}
      </div>
      <div className="cv-dropzone__hint">PDF — max 5 MB</div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   MAIN SECTION
──────────────────────────────────────────────────────────── */
export default function CVSection() {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchCVs() {
    try {
      const data = await getAllCVs();
      console.log(data.data);
      
      setCVs(data.data.cvs);
    } catch {
      showToast("error", "Failed to load CVs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCVs();
  }, []);

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File exceeds the 5 MB limit.");
      return;
    }
    setUploading(true);
    try {
      await uploadCV(file);
      await fetchCVs();
      setShowUploader(false);
      showToast("success", `"${file.name}" uploaded successfully.`);
    } catch {
      showToast("error", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCV(id);
      setCVs((prev) => prev.filter((c) => c.id !== id));
      showToast("success", "CV deleted.");
    } catch {
      showToast("error", "Failed to delete CV.");
    }
  }

  return (
    <>
      <div className="pr-card anim-fade-up delay-4">
        {/* ── Header ── */}
        <div className="pr-card-header">
          <span className="pr-card-title">
            <FileText size={16} />
            My CVs
            {cvs.length > 0 && (
              <span className="cv-count-badge">{cvs.length}</span>
            )}
          </span>
          <button
            className="pr-btn-outline pr-btn-sm"
            onClick={() => setShowUploader((v) => !v)}
          >
            {showUploader ? (
              <>
                <X size={13} /> Cancel
              </>
            ) : (
              <>
                <Plus size={13} /> Upload CV
              </>
            )}
          </button>
        </div>

        <div
          className="pr-card-body"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* Drop zone */}
          {showUploader && (
            <DropZone onFile={handleUpload} uploading={uploading} />
          )}

          {/* List */}
          {loading ? (
            <div className="cv-empty">
              <div
                className="cv-dropzone__spinner"
                style={{ margin: "0 auto" }}
              />
              <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>
                Loading…
              </span>
            </div>
          ) : cvs.length === 0 ? (
            <div className="cv-empty">
              <FileText
                size={32}
                style={{ color: "var(--border)", marginBottom: ".5rem" }}
              />
              <p
                style={{
                  fontSize: ".88rem",
                  color: "var(--muted)",
                  textAlign: "center",
                }}
              >
                No CVs uploaded yet.
                <br />
                Upload one to get started.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: ".65rem",
              }}
            >
              {cvs.map((cv) => (
                <CVCard key={cv.id} cv={cv} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`cv-toast cv-toast--${toast.type}`}>
          {toast.type === "success" ? (
            <CheckCircle size={14} />
          ) : (
            <AlertOctagon size={14} />
          )}
          {toast.msg}
        </div>
      )}
    </>
  );
}
