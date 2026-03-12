import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  Edit2,
  X,
  Plus,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Save,
  BrainCircuit,
} from "lucide-react";
import Modal from "./../../components/Modal/Modal";
import "./ApplicantProfile.css";
import {
  getMe,
  updateBasicInfo,
  getCompletion,
} from "../../services/userService";
import { formatDate } from "../../utils/dateFormat";
import {
  addSkill,
  deleteSkill,
  addExperience,
  updateExperience,
  deleteExperience,
} from "../../services/profileService";
import Loader from "../../components/Loader";

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
  const [scrolled, setScrolled] = useState(false);
  // const profileCompletion = 75;
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

  // scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  // const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      const userData = res.data.data;

      // setUser(userData);

      setBasicInfo({
        name: userData.name || "",
        job_title: userData.job_title || "",
        email: userData.email || "",
        phone: userData.phone || "",
        location: userData.location || "",
        linkedIn_profile: userData.linkedIn_profile || "",
      });

      setSkills(userData.skillsORspecializations || []);

      setExperiences(
        (userData.experience || []).map((exp: any) => ({
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
      setLoading(true);
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

  function openEditExp(exp: Experience) {
    setExpForm({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
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
    try {
      if (editingExpId) {
        // تحديث الخبرة
        await updateExperience(editingExpId, expForm);
        fetchUser(); // إعادة جلب البيانات لتحديث الواجهة
      } else {
        // اضافة خبرة جديدة
        await addExperience(expForm);
        fetchUser(); // إعادة جلب البيانات لتحديث الواجهة
      }
      closeExpModal();
    } catch (err) {
      console.error("Error saving experience:", err);
    }
  }

  async function removeExperience(id: number) {
    try {
      await deleteExperience(id);
      fetchUser(); // إعادة جلب البيانات لتحديث الواجهة
    } catch (err) {
      console.error("Error deleting experience:", err);
    }
  }

  // ── Skill Handlers ────────────────────────────────────────────────────────
  async function addNewSkill() {
    const trimmed = newSkill.trim();
    if (!trimmed || skills.find((s) => s.name === trimmed)) return;

    try {
      await addSkill(trimmed);
      fetchUser(); // إعادة جلب البيانات لتحديث الواجهة
      setNewSkill("");
    } catch (err) {
      console.error("Error adding skill:", err);
    }
  }

  async function removeSkillById(skillId: number) {
    try {
      await deleteSkill(skillId);
      fetchUser(); // إعادة جلب البيانات لتحديث الواجهة
    } catch (err) {
      console.error("Error deleting skill:", err);
    }
  }

  if (loading) {
    return <Loader fullPage text="Loading profile..." />;
  }
  return (
    <div className="pr-page">
      {/* ══ HEADER ════════════════════════════════════════════ */}
      <header className={`pr-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="pr-logo-box">H</div>
              <span className="pr-brand-name">Hakeem</span>
            </div>

            <button className="pr-back-btn" onClick={() => navigate(-1)}>
              <ChevronLeft size={14} />
              Back
            </button>
          </div>
        </div>
      </header>

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <main className="pr-main">
        {/* Page heading */}
        <div className="anim-fade-up">
          <h1 className="pr-page-title">My Profile</h1>
          <p className="pr-page-sub">
            Manage your personal info, experience, and skills
          </p>
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

        {isEditing && (
          <div className="pr-save-bar anim-fade-up">
            <button className="pr-btn-primary" onClick={() => saveBasicInfo()}>
              <Save size={14} />
              Save Changes
            </button>
          </div>
        )}
      </main>

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
                  type="text"
                  placeholder="e.g. 2021"
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
                  type="text"
                  placeholder="e.g. Present"
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
    </div>
  );
}
