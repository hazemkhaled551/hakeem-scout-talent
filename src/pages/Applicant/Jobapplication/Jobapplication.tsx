import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BrainCircuit,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Upload,
  Sparkles,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  // User,
  FileText,
} from "lucide-react";
import "../../styles/Jobs.css";
import "./Jobapplication.css";
import { getJobById, applyJob } from "../../../services/jobService";
import { uploadCV, getAllCVs } from "../../../services/cvService";

import Loader from "../../../components/Loader";
import { fmt } from "../../../utils/format";
import ApplicantNavbar from "../../../components/ApplicantNavbar";

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Overview", icon: <FileText size={14} /> },
  // { id: 2, label: "Personal",  icon: <User     size={14} /> },
  { id: 2, label: "CV Upload", icon: <Upload size={14} /> },
  { id: 3, label: "Cover", icon: <BrainCircuit size={14} /> },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function JobApplication() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [step, setStep] = useState(1);
  const [showAI, setShowAI] = useState(false);
  const [loading, setLoading] = useState(false);
  const { jobId } = useParams();
  const [job, setJob] = useState<any>(null);
  const [cvs, setCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);

  // CV state
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Personal info (pre-filled from profile)
  // const [info, setInfo] = useState({
  //   firstName: "John",
  //   lastName: "Doe",
  //   email: "john.doe@email.com",
  //   phone: "+1 (555) 123-4567",
  //   location: "San Francisco, CA",
  //   linkedin: "https://linkedin.com/in/johndoe",
  // });

  const [coverLetter, setCoverLetter] = useState(
    "I am excited to apply for the Senior Software Engineer position at TechCorp. With over 7 years of experience in full-stack development, I believe I am a strong match for this role…",
  );

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Redirect after AI match display
  useEffect(() => {
    if (!showAI) return;
    const t = setTimeout(() => navigate("/dashboard"), 4000);
    return () => clearTimeout(t);
  }, [showAI, navigate]);

  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);
        if (!jobId) return;
        const data = await getJobById(jobId);
        setJob(data.data.data);
        const res = await getAllCVs();
        setCvs(res.data.cvs);
        // setLoading(false);
      } catch (error) {
        console.error(error);
        navigate("/jobs");
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, [jobId]);

  useEffect(() => {
    if (cvs.length > 0 && !selectedCvId) {
      const primary = cvs.find((cv) => cv.isPrimary);

      if (primary) {
        setSelectedCvId(primary.id);
      } else {
        setSelectedCvId(cvs[0].id); // fallback
      }
    }
  }, [cvs]);
  // ── File handlers ──────────────────────────────────────────────────────────

  async function handleSubmitApplication() {
    try {
      if (!jobId) return;

      setLoading(true);

      let cvId = selectedCvId;

      // لو رفع فايل جديد
      if (file) {
        const uploadRes = await uploadCV(file);
        cvId = uploadRes.data.cvId;
      }

      if (!cvId) return;

      await applyJob(jobId, cvId, coverLetter);

      setShowAI(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  function validateFile(f: File): string | null {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(f.type))
      return "Only PDF or Word documents are allowed.";
    if (f.size > 10 * 1024 * 1024) return "File must be smaller than 10 MB.";
    return null;
  }

  function handleFile(f: File | null) {
    if (!f) return;
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError(null);
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  }

  // ── Progress ───────────────────────────────────────────────────────────────
  const pct = Math.round((step / STEPS.length) * 100);

  // const job = {
  //   title: "Senior Software Engineer",
  //   company: "TechCorp Inc.",
  //   location: "Remote",
  //   salary: "$120k – $180k",
  //   type: "Full-time",
  //   skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"],
  //   responsibilities: [
  //     "Design and develop scalable web applications",
  //     "Collaborate with cross-functional teams",
  //     "Mentor junior developers and conduct code reviews",
  //     "Participate in architectural decisions",
  //   ],
  // };

  // ── AI result screen ───────────────────────────────────────────────────────

  if (showAI)
    return (
      <div className="jb-page">
        <header className={`jb-header ${scrolled ? "scrolled" : ""}`}>
          <div className="container-xl">
            <div className="d-flex align-items-center py-3">
              <div className="jb-logo">H</div>
              <span className="jb-brand ms-2">Hakeem</span>
            </div>
          </div>
        </header>

        <main className="jb-main">
          <div className="jb-card au">
            <div className="ja-ai-screen">
              <div className="ja-ai-icon-wrap">
                <Sparkles size={34} />
              </div>

              <h2 className="ja-ai-title">Application Submitted!</h2>
              <p className="ja-ai-sub">
                Our AI analyzed your CV and matched it against the job
                requirements
              </p>

              {/* Score */}
              <div className="mb-4 ac d1">
                <div className="ja-score-num">92%</div>
                <div className="ja-score-label">Overall AI Match Score</div>
                <div
                  className="jb-track jb-track--md mt-3"
                  style={{ maxWidth: 320, margin: "0 auto" }}
                >
                  <div
                    className="jb-fill"
                    style={{ "--w": "92%" } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Stat trio */}
              <div
                className="row g-3 justify-content-center mb-4 au d2"
                style={{ maxWidth: 420, margin: "0 auto" }}
              >
                {[
                  { val: "8/10", lbl: "Skills Match", cls: "ja-stat--green" },
                  { val: "95%", lbl: "Experience", cls: "ja-stat--cyan" },
                  { val: "High", lbl: "Culture Fit", cls: "ja-stat--indigo" },
                ].map((s, i) => (
                  <div key={i} className="col-4 text-center">
                    <div className={`ja-stat-val ${s.cls}`}>{s.val}</div>
                    <div className="ja-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Checklist highlights */}
              <div
                className="d-flex flex-column gap-2 text-start au d3"
                style={{ maxWidth: 360, margin: "0 auto 1.5rem" }}
              >
                {[
                  "Strong TypeScript & React background",
                  "Cloud experience matches requirements",
                  "5+ years aligns with seniority level",
                ].map((t, i) => (
                  <div key={i} className="jb-check">
                    <CheckCircle
                      size={15}
                      className="jb-check-icon"
                      style={{ color: "var(--success)" }}
                    />
                    <span className="jb-check-text">{t}</span>
                  </div>
                ))}
              </div>

              <p className="ja-redirect">
                <span className="ja-redirect-dot" />
                Redirecting to your dashboard…
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  if (loading) {
    <Loader text="Loading job details..." fullPage />;
  }
  // ── Main wizard ────────────────────────────────────────────────────────────
  return (
    <div className="jb-page">
      {/* ══ HEADER ════════════════════════════════════════════ */}
      <ApplicantNavbar />

      <main className="jb-main">
        {/* ── Step indicator ────────────────────────────────── */}
        <div className="ja-steps mb-4 au">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div
                key={s.id}
                className="d-flex align-items-center flex-1 min-width-0"
              >
                <div className="ja-step-node">
                  <div
                    className={`ja-step-dot ${active ? "ja-step-dot--active" : done ? "ja-step-dot--done" : ""}`}
                  >
                    {done ? <CheckCircle size={14} /> : s.id}
                  </div>
                  <span
                    className={`ja-step-label me-2 ${active ? "ja-step-label--active" : done ? "ja-step-label--done" : ""}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`ja-step-line ${done ? "ja-step-line--done" : ""}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Progress bar ──────────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-2 au d1">
          <span className="ja-step-count">
            Step {step} of {STEPS.length}
          </span>
          <span className="ja-step-pct">{pct}% Complete</span>
        </div>
        <div className="jb-track mb-4 au d1">
          <div
            className="jb-fill"
            style={{ "--w": `${pct}%` } as React.CSSProperties}
          />
        </div>

        {/* ══════════════════════════════════════════════════
            STEP 1 — Job Overview
        ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="au d1">
            {/* Job strip */}
            <div className="ja-job-strip mb-4">
              <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
                <div>
                  <div className="ja-job-strip-title">{job?.title}</div>
                  <div className="jb-meta mt-1">
                    <span className="jb-meta-item">
                      <Building2 size={13} />
                      TechCorp Inc.
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
                {/* <span className="jb-badge jb-badge--green">
                  <span
                    className="jb-badge--dot"
                    style={{ background: "var(--success)" }}
                  />
                  Actively Hiring
                </span> */}
              </div>
            </div>

            {/* Skills */}
            <div className="jb-card mb-3">
              <div className="jb-card-header">
                <span className="jb-card-title">Required Skills</span>
              </div>
              <div className="jb-card-body">
                <div className="d-flex flex-wrap gap-2">
                  {job?.skills.map((s: string) => (
                    <span key={s} className="jb-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="jb-card mb-4">
              <div className="jb-card-header">
                <span className="jb-card-title">Responsibilities</span>
              </div>
              <div className="jb-card-body d-flex flex-column gap-3">
                {job?.responsibilities.map((r: string, i: number) => (
                  <div key={i} className="jb-check">
                    <CheckCircle
                      size={15}
                      className="jb-check-icon"
                      style={{ color: "var(--success)" }}
                    />
                    <span className="jb-check-text">{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="jb-btn jb-btn--primary jb-btn--full jb-btn--lg"
              onClick={() => setStep(2)}
            >
              Start Application <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 2 — Personal Info
        ══════════════════════════════════════════════════ */}
        {/* {step === 2 && (
          <div className="jb-card au d1">
            <div className="jb-card-header">
              <span className="jb-card-title">
                <User size={15} />
                Personal Information
              </span>
            </div>
            <div className="jb-card-body">
              <div className="ja-field-grid mb-3">
                {[
                  { label: "First Name", key: "firstName", type: "text" },
                  { label: "Last Name", key: "lastName", type: "text" },
                ].map((f) => (
                  <div key={f.key} className="ja-field">
                    <label className="jb-label">{f.label}</label>
                    <input
                      className="jb-input"
                      type={f.type}
                      value={info[f.key as keyof typeof info]}
                      onChange={(e) =>
                        setInfo({ ...info, [f.key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>

              {[
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Current Location", key: "location", type: "text" },
                { label: "LinkedIn URL", key: "linkedin", type: "url" },
              ].map((f) => (
                <div key={f.key} className="ja-field mb-3">
                  <label className="jb-label">{f.label}</label>
                  <input
                    className="jb-input"
                    type={f.type}
                    value={info[f.key as keyof typeof info]}
                    onChange={(e) =>
                      setInfo({ ...info, [f.key]: e.target.value })
                    }
                  />
                </div>
              ))}

              <div className="ja-nav mt-1">
                <button
                  className="jb-btn jb-btn--outline"
                  onClick={() => setStep(1)}
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  className="jb-btn jb-btn--primary"
                  onClick={() => setStep(3)}
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* ══════════════════════════════════════════════════
            STEP 3 — CV Upload
        ══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="jb-card au d1">
            <div className="jb-card-header">
              <span className="jb-card-title">
                <Upload size={15} />
                Upload Your CV
              </span>
            </div>
            <div className="jb-card-body">
              {/* Drop zone */}

              {cvs.length > 0 && (
                <div className="mb-3">
                  <div className="jb-label mb-2">
                    Choose from your saved CVs
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {cvs.map((cv) => (
                      <div
                        key={cv.id}
                        aria-selected={cv.isPrimary}
                        className={`ja-file-pill ${selectedCvId === cv.id ? "active" : ""}`}
                        onClick={() => {
                          setSelectedCvId(cv.id);
                          setFile(null); // مهم
                        }}
                        style={{
                          cursor: "pointer",
                          border:
                            selectedCvId === cv.id
                              ? "2px solid var(--primary)"
                              : "",
                        }}
                      >
                        <FileText size={16} />
                        <div className="flex-1">
                          <div className="ja-file-name">{cv.name}</div>
                          <div className="ja-file-size">
                            {new Date(cv.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center my-2" style={{ opacity: 0.6 }}>
                    — OR —
                  </div>
                </div>
              )}
              {!file ? (
                <div
                  className={`ja-drop mb-3 ${dragActive ? "ja-drop--active" : ""}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    ref={fileRef}
                    className="d-none"
                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="ja-drop-icon">
                    <Upload size={26} />
                  </div>
                  <div className="ja-drop-title">
                    Drag & drop or click to browse
                  </div>
                  <div className="ja-drop-sub">PDF, DOC, DOCX · Max 10 MB</div>
                </div>
              ) : (
                <div className="ja-file-pill mb-3">
                  <div className="ja-file-ext">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-width-0">
                    <div className="ja-file-name">{file.name}</div>
                    <div className="ja-file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    className="jb-btn jb-btn--ghost jb-btn--sm"
                    onClick={() => setFile(null)}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {fileError && (
                <div className="ja-error mb-3">
                  <AlertCircle size={14} /> {fileError}
                </div>
              )}

              <div className="ja-nav">
                <button
                  className="jb-btn jb-btn--outline"
                  onClick={() => setStep(2)}
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  className="jb-btn jb-btn--primary"
                  disabled={!file && !selectedCvId}
                  style={{ opacity: file || selectedCvId ? 1 : 0.45 }}
                  onClick={() => setStep(3)}
                >
                  Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 4 — Cover Letter
        ══════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="jb-card au d1">
            <div className="jb-card-header">
              <span className="jb-card-title">
                <FileText size={15} />
                Cover Letter
              </span>
              <span className="jb-badge jb-badge--gray">Optional</span>
            </div>
            <div className="jb-card-body">
              <label className="jb-label mb-1">
                Tell us why you're a great fit
              </label>
              <textarea
                className="jb-textarea mb-1"
                rows={9}
                placeholder="Share your motivation and relevant experience…"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                style={{ minHeight: 180 }}
              />
              <p className="ja-cover-hint mb-4">
                A well-written cover letter can significantly increase your
                match score.
              </p>

              <div className="ja-nav">
                <button
                  className="jb-btn jb-btn--outline"
                  onClick={() => setStep(3)}
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <button
                  className="jb-btn jb-btn--primary"
                  onClick={() => handleSubmitApplication()}
                >
                  <Send size={14} /> Submit Application
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
