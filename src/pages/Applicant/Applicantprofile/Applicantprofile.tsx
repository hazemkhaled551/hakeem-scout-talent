import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Edit2,
  X,
  Plus,
  // ChevronLeft,
  CheckCircle,
  AlertCircle,
  Save,
  BrainCircuit,
  Trash2,
  AlertOctagon,
} from "lucide-react";
import Modal from "./../../../components/Modal/Modal";
import "./Applicantprofile.css";
import {
  getMe,
  updateBasicInfo,
  getCompletion,
  deleteUser,
} from "../../../services/userService";
import { formatDate, formatDateWithTimezone } from "../../../utils/format";
import {
  addSkill,
  deleteSkill,
  addExperience,
  updateExperience,
  deleteExperience,
} from "../../../services/profileService";
import Loader from "../../../components/Loader";
import ShareProfileButton from "../../../components/Shareprofilebutton";
import ApplicantNavbar from "../../../components/ApplicantNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Experience {
  id: number;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExpForm {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

const EMPTY_EXP_FORM: ExpForm = {
  title: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
};

const profileChecks = [
  { label: "Basic Info", done: true },
  { label: "Work Experience", done: true },
  { label: "Skills Assessment", done: false },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ApplicantProfile() {
  const navigate = useNavigate();
  // const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Basic Info ──
  const [isEditing, setIsEditing] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    job_title: "",
    email: "",
    phone: "",
    location: "",
    linkedIn_profile: "",
  });

  // ── Experience Modal ──
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [expForm, setExpForm] = useState<ExpForm>(EMPTY_EXP_FORM);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // ── Skills ──
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // ── Completion ──
  const [completion, setCompletion] = useState<any>({});

  // ── Delete Account ──
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const DELETE_KEYWORD = "DELETE";
  const deleteConfirmed = deleteConfirmText === DELETE_KEYWORD;

  // scroll shadow
  // useEffect(() => {
  //   const onScroll = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", onScroll);
  //   return () => window.removeEventListener("scroll", onScroll);
  // }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      const userData = res.data.data;

      setBasicInfo({
        name: userData.user.name || "",
        job_title: userData.job_title || "",
        email: userData.user.email || "",
        phone: userData.phone || "",
        location: userData.user.location || "",
        linkedIn_profile: userData.user.linkedIn_profile || "",
      });

      setSkills(userData.skills || []);

      setExperiences(
        (userData.experiences || []).map((exp: any) => ({
          id: exp.id,
          title: exp.title,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
        })),
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadUser() {
      await fetchUser();
    }
    loadUser();
  }, []);

  async function saveBasicInfo() {
    try {
      await updateBasicInfo(basicInfo);
      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadCompletion() {
    try {
      // setLoading(true);
      const res = await getCompletion();
      setCompletion(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchCompletion() {
      await loadCompletion();
    }
    fetchCompletion();
  }, []);

  // ── Experience Handlers ────────────────────────────────────────────────────
  function openAddExp() {
    setExpForm(EMPTY_EXP_FORM);
    setEditingExpId(null);
    setExpModalOpen(true);
  }

  function formatDateForInput(date: string) {
    if (!date) return "";
    return date.split("T")[0];
  }

  function openEditExp(exp: Experience) {
    setExpForm({
      title: exp.title,
      company: exp.company,
      startDate: formatDateForInput(exp.startDate),
      endDate: formatDateForInput(exp.endDate),
      description: exp.description,
    });
    setEditingExpId(exp.id);
    setExpModalOpen(true);
  }

  function closeExpModal() {
    setExpModalOpen(false);
    setEditingExpId(null);
    setExpForm(EMPTY_EXP_FORM);
  }

  async function saveExperience() {
    if (!expForm.title.trim() || !expForm.company.trim()) return;
    const payload = {
      ...expForm,
      startDate: formatDateWithTimezone(expForm.startDate),
      endDate: formatDateWithTimezone(expForm.endDate),
    };
    try {
      if (editingExpId) {
        const res = await updateExperience(editingExpId, payload);
        console.log(res);
        setExperiences(res.data.experiences);
        loadCompletion();
      } else {
        const res = await addExperience(payload);
        console.log(res);
        setExperiences(res.data.experiences);
        loadCompletion();
      }
      closeExpModal();
    } catch (err) {
      console.error("Error saving experience:", err);
    }
  }

  async function removeExperience(id: number) {
    try {
      await deleteExperience(id);
      fetchUser();
      loadCompletion();
    } catch (err) {
      console.error("Error deleting experience:", err);
    }
  }

  // ── Skill Handlers ────────────────────────────────────────────────────────
  async function addNewSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.find((s) => s.name === trimmed)) return;
    try {
      const res = await addSkill(trimmed);
      console.log(res);

      setNewSkill("");
      setSkills(res.data.skills);
      loadCompletion();
    } catch (err) {
      console.error("Error adding skill:", err);
    }
  }

  async function removeSkillById(skillId: number) {
    try {
      await deleteSkill(skillId);
      fetchUser();
      loadCompletion();
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  }

  // ── Delete Account Handler ────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (!deleteConfirmed) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteUser();
      localStorage.clear();
      navigate("/auth", { replace: true });
    } catch (err: any) {
      setDeleteError(
        err?.response?.data?.message ??
          "Failed to delete account. Please try again.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) {
    return <Loader fullPage text="Loading profile..." />;
  }

  return (
    <div className="pr-page">
      {/* ══ HEADER ════════════════════════════════════════════ */}
     <ApplicantNavbar />

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <main className="pr-main">
        {/* Page heading */}
        <div className="anim-fade-up postion-relative d-flex align-items-start justify-content-between gap-3 flex-wrap">
          <div>
            <h1 className="pr-page-title">My Profile</h1>
            <p className="pr-page-sub">
              Manage your personal info, experience, and skills
            </p>
          </div>
          <ShareProfileButton role="applicant" variant="outline" size="sm" />
        </div>

        {/* ── Profile Completion ─────────────────────────── */}
        <div className="pr-card pr-completion-card anim-fade-up delay-1">
          <div className="pr-card-body">
            <div className="d-flex align-items-start justify-content-between mb-1">
              <div>
                <div className="pr-card-title" style={{ fontSize: "1rem" }}>
                  Complete Your Profile
                </div>
                <div
                  style={{
                    fontSize: "0.83rem",
                    color: "var(--muted)",
                    marginTop: "0.15rem",
                  }}
                >
                  Complete your profile to get better job matches
                </div>
              </div>
              <span className="pr-completion-badge">
                {completion.percentage}%
              </span>
            </div>

            <div className="pr-progress-track">
              <div
                className="pr-progress-fill"
                style={
                  {
                    "--fill": `${completion.percentage}%`,
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="row g-2">
              {profileChecks.map((item, i) => (
                <div key={i} className="col-auto">
                  <div className="pr-check-item">
                    {item.done ? (
                      <CheckCircle size={15} className="pr-check-done" />
                    ) : (
                      <AlertCircle size={15} className="pr-check-pending" />
                    )}
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Basic Information ──────────────────────────── */}
        <div className="pr-card anim-fade-up delay-2">
          <div className="pr-card-header">
            <span className="pr-card-title">
              <User size={16} />
              Basic Information
            </span>
            <button
              className={
                isEditing
                  ? "pr-btn-ghost pr-btn-sm"
                  : "pr-btn-outline pr-btn-sm"
              }
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <X size={13} /> Cancel
                </>
              ) : (
                <>
                  <Edit2 size={13} /> Edit
                </>
              )}
            </button>
          </div>

          <div className="pr-card-body">
            <div className="pr-field-grid">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Job Title", key: "job_title", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone", type: "tel" },
                { label: "Location", key: "location", type: "text" },
                { label: "LinkedIn URL", key: "linkedIn_profile", type: "url" },
              ].map((f) => (
                <div key={f.key} className="pr-field">
                  <label className="pr-label">{f.label}</label>
                  <input
                    className="pr-input"
                    type={f.type}
                    value={basicInfo[f.key as keyof typeof basicInfo]}
                    disabled={!isEditing}
                    onChange={(e) =>
                      setBasicInfo({ ...basicInfo, [f.key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Work Experience ────────────────────────────── */}
        <div className="pr-card anim-fade-up delay-3">
          <div className="pr-card-header">
            <span className="pr-card-title">
              <Briefcase size={16} />
              Work Experience
            </span>
            <button className="pr-btn-outline pr-btn-sm" onClick={openAddExp}>
              <Plus size={13} /> Add
            </button>
          </div>

          <div className="pr-card-body d-flex flex-column gap-3">
            {experiences.length === 0 && (
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--muted)",
                  textAlign: "center",
                  padding: "1rem 0",
                }}
              >
                No experience added yet.
              </p>
            )}

            {experiences.map((exp) => (
              <div key={exp.id} className="pr-exp-item">
                <div className="pr-exp-actions">
                  <button
                    className="pr-icon-btn"
                    onClick={() => openEditExp(exp)}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="pr-icon-btn pr-icon-btn--danger"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <X size={13} />
                  </button>
                </div>
                <div className="pr-exp-title">{exp.title}</div>
                <div className="pr-exp-meta">
                  {exp.company} · {formatDate(exp.startDate)} -{" "}
                  {formatDate(exp.endDate)}
                </div>
                <div className="pr-exp-desc">{exp.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Skills ────────────────────────────────────── */}
        <div className="pr-card anim-fade-up delay-4">
          <div className="pr-card-header">
            <span className="pr-card-title">
              <BrainCircuit size={16} />
              Skills
            </span>
          </div>

          <div className="pr-card-body">
            <div className="d-flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span key={skill.id} className="pr-skill-tag">
                  {skill.name}
                  <button
                    className="pr-skill-remove"
                    onClick={() => removeSkillById(skill.id)}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>

            <div className="d-flex gap-2">
              <input
                className="pr-skill-input"
                placeholder="Add a skill…"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNewSkill()}
              />
              <button
                className="pr-btn-outline pr-btn-sm"
                onClick={addNewSkill}
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ── Danger Zone ───────────────────────────────── */}
        <div className="pr-card pr-danger-card anim-fade-up delay-5">
          <div className="pr-card-header">
            <span className="pr-card-title" style={{ color: "var(--danger)" }}>
              <AlertOctagon size={16} />
              Danger Zone
            </span>
          </div>
          <div className="pr-card-body">
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              <div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 700,
                    fontSize: ".92rem",
                    color: "var(--text)",
                    marginBottom: ".25rem",
                  }}
                >
                  Delete Account
                </div>
                <p
                  style={{
                    fontSize: ".83rem",
                    color: "var(--muted)",
                    lineHeight: 1.6,
                    maxWidth: 420,
                  }}
                >
                  Permanently delete your account and all associated data —
                  applications, interviews, and profile information. This action
                  is irreversible.
                </p>
              </div>
              <button
                className="pr-btn-danger"
                onClick={() => {
                  setDeleteModalOpen(true);
                  setDeleteConfirmText("");
                  setDeleteError("");
                }}
              >
                <Trash2 size={14} /> Delete Account
              </button>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="pr-save-bar anim-fade-up">
            <button className="pr-btn-primary" onClick={() => saveBasicInfo()}>
              <Save size={14} />
              Save Changes
            </button>
          </div>
        )}
      </main>

      {/* ══ EXPERIENCE MODAL ══════════════════════════════════ */}
      <Modal
        open={expModalOpen}
        onClose={closeExpModal}
        title={editingExpId ? "Edit Experience" : "Add Experience"}
        icon={<Briefcase size={16} />}
        size="md"
        footer={
          <>
            <button className="pr-btn-ghost" onClick={closeExpModal}>
              Cancel
            </button>
            <button className="pr-btn-primary" onClick={saveExperience}>
              <Save size={13} />
              {editingExpId ? "Update" : "Save"}
            </button>
          </>
        }
      >
        <div className="pr-exp-form">
          <div className="row g-3">
            <div className="col-12">
              <div className="pr-field">
                <label className="pr-label">
                  Job Title <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  className="pr-input"
                  type="text"
                  placeholder="e.g. Senior Frontend Developer"
                  value={expForm.title}
                  onChange={(e) =>
                    setExpForm({ ...expForm, title: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-12">
              <div className="pr-field">
                <label className="pr-label">
                  Company <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  className="pr-input"
                  type="text"
                  placeholder="e.g. Google"
                  value={expForm.company}
                  onChange={(e) =>
                    setExpForm({ ...expForm, company: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-6">
              <div className="pr-field">
                <label className="pr-label">Start Date</label>
                <input
                  className="pr-input"
                  type="date"
                  value={expForm.startDate}
                  onChange={(e) =>
                    setExpForm({ ...expForm, startDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-6">
              <div className="pr-field">
                <label className="pr-label">End Date</label>
                <input
                  className="pr-input"
                  type="date"
                  value={expForm.endDate}
                  onChange={(e) =>
                    setExpForm({ ...expForm, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="col-12">
              <div className="pr-field">
                <label className="pr-label">Description</label>
                <textarea
                  className="pr-textarea"
                  placeholder="Describe your responsibilities and achievements…"
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm({ ...expForm, description: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ══ DELETE ACCOUNT MODAL ══════════════════════════════ */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirmText("");
          setDeleteError("");
        }}
        title="Delete Account"
        icon={<Trash2 size={15} />}
        size="sm"
        footer={
          <>
            <button
              className="pr-btn-ghost"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmText("");
              }}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              className="pr-btn-danger pr-btn-sm"
              onClick={handleDeleteAccount}
              disabled={!deleteConfirmed || deleteLoading}
              style={{ opacity: deleteConfirmed && !deleteLoading ? 1 : 0.45 }}
            >
              <Trash2 size={13} />
              {deleteLoading ? "Deleting…" : "Delete My Account"}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-3">
          {/* Warning */}
          <div
            style={{
              background: "rgba(239,68,68,.06)",
              border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 12,
              padding: "1rem 1.1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                marginBottom: ".5rem",
              }}
            >
              <AlertOctagon
                size={16}
                style={{ color: "var(--danger)", flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".88rem",
                  color: "#991b1b",
                }}
              >
                This cannot be undone
              </span>
            </div>
            <p
              style={{ fontSize: ".82rem", color: "#991b1b", lineHeight: 1.65 }}
            >
              Your account and all associated data will be permanently deleted.
            </p>
          </div>

          {/* What gets deleted */}
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 10,
              padding: ".85rem 1rem",
              border: "1px solid var(--border)",
              fontSize: ".82rem",
              color: "var(--muted)",
            }}
          >
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: ".8rem",
                color: "var(--text)",
                marginBottom: ".5rem",
              }}
            >
              The following will be deleted:
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: ".35rem",
              }}
            >
              {[
                "Profile & personal information",
                "All job applications",
                "Interview history",
                "Received offers",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                  }}
                >
                  <X
                    size={12}
                    style={{ color: "var(--danger)", flexShrink: 0 }}
                  />{" "}
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Confirm input */}
          <div className="pr-field">
            <label className="pr-label">
              Type{" "}
              <strong
                style={{
                  color: "var(--danger)",
                  fontFamily: "monospace",
                  letterSpacing: ".05em",
                }}
              >
                DELETE
              </strong>{" "}
              to confirm
            </label>
            <input
              className="pr-input"
              style={{
                borderColor: deleteConfirmed
                  ? "var(--success)"
                  : deleteConfirmText.length > 0
                    ? "var(--danger)"
                    : "",
              }}
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(e) => {
                setDeleteConfirmText(e.target.value.toUpperCase());
                setDeleteError("");
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {deleteConfirmText.length > 0 && !deleteConfirmed && (
              <span
                style={{
                  fontSize: ".74rem",
                  color: "var(--danger)",
                  marginTop: ".25rem",
                  display: "block",
                }}
              >
                Keep typing — write DELETE exactly
              </span>
            )}
            {deleteConfirmed && (
              <span
                style={{
                  fontSize: ".74rem",
                  color: "var(--success)",
                  marginTop: ".25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: ".3rem",
                }}
              >
                <CheckCircle size={12} /> Confirmed
              </span>
            )}
          </div>

          {deleteError && (
            <div
              style={{
                background: "rgba(239,68,68,.07)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 10,
                padding: ".6rem .9rem",
                fontSize: ".82rem",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: ".4rem",
              }}
            >
              <AlertOctagon size={13} /> {deleteError}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
