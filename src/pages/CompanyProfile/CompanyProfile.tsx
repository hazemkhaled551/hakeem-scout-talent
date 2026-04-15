import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import {
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Plus,
  X,
  Save,
  Link,
  User,
  FileText,
  Star,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Modal from "../../components/Modal/Modal";
import "./CompanyProfile.css";

import {
  getCompanyProfile,
  updateCompanyBasicInfo,
  updateCompanyAbout,
} from "../../services/companyService";
import CompanyNavbar from "../../components/CompanyNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RecruiterData {
  name: string;
  // title: string;
  // company: string;
  email: string;
  // phone: string;
  location: string;
  joined: string;
  linkedin: string;
  bio: string;
  specializations: { id: string; name: string }[];
}

// ─── Initial data ─────────────────────────────────────────────────────────────
const INITIAL_DATA: RecruiterData = {
  name: "Sarah Chen",
  // title: "Senior Technical Recruiter",
  // company: "TechCorp Inc.",
  email: "sarah.chen@techcorp.com",
  // phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  joined: "March 2022",
  linkedin: "https://linkedin.com/in/sarah-chen",
  bio: "Experbac hiring. Passionate about connecting exceptional talent with mission-driven teams.",
  specializations: [],
};

// ─── Profile completion scoring ───────────────────────────────────────────────
function calcCompletion(d: RecruiterData) {
  const sections = {
    "Personal Info":
      [d.name, d.email, d.location, d.linkedin].filter(
        Boolean,
      ).length / 4,
    About: d.bio.trim().length > 20 ? 1 : d.bio.trim().length / 20,
    Specializations: Math.min(d.specializations.length / 4, 1),
  };
  const avg =
    Object.values(sections).reduce((a, b) => a + b, 0) /
    Object.keys(sections).length;
  return { sections, overall: Math.round(avg * 100) };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CompanyProfile() {
  // const navigate = useNavigate();
  // const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState<RecruiterData>(INITIAL_DATA);

  // Modal open states
  const [infoOpen, setInfoOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [specOpen, setSpecOpen] = useState(false);

  // Draft state (lives inside modals, discarded on cancel)
  const [infoDraft, setInfoDraft] = useState(data);
  const [aboutDraft, setAboutDraft] = useState(data.bio);
  const [specDraft, setSpecDraft] = useState<any[]>(data.specializations);
  const [newSpec, setNewSpec] = useState("");

  const { sections, overall } = calcCompletion(data);

  // useEffect(() => {
  //   const fn = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", fn);
  //   return () => window.removeEventListener("scroll", fn);
  // }, []);

  // ── Open helpers (copy current data into draft) ───────────────────────────
  function openInfo() {
    setInfoDraft({ ...data });
    setInfoOpen(true);
  }
  function openAbout() {
    setAboutDraft(data.bio);
    setAboutOpen(true);
  }
  function openSpec() {
    setSpecDraft([...data.specializations]);
    setNewSpec("");
    setSpecOpen(true);
  }

  // ── Save helpers ──────────────────────────────────────────────────────────
  const saveInfo = async () => {
    try {
      await updateCompanyBasicInfo({
        name: infoDraft.name,
        email: infoDraft.email,
        // phone: infoDraft.phone,
        location: infoDraft.location,
        linkedIn_profile: infoDraft.linkedin,
        // job_title: infoDraft.title,
      });

      setData({ ...infoDraft });
      setInfoOpen(false);
    } catch (err) {
      console.error("Update failed", err);
    }
  };
  const saveAbout = async () => {
    try {
      await updateCompanyAbout({
        About: aboutDraft,
      });

      setData((p) => ({ ...p, bio: aboutDraft }));
      setAboutOpen(false);
    } catch (err) {
      console.error("Update about failed", err);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCompanyProfile();
        console.log(res.data.data);

        const c = res.data.data;

        setData({
          name: c.user.name,
          // company: c.company || "",
          email: c.user.email,
          // phone: c.user.phone,
          location: c.user.location,
          joined: c.user.createAt || "",
          linkedin: c.user.linkedIn_profile,
          bio: c.About || "",
          specializations: c.specialization || [],
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);
  function saveSpec() {
    setData((p) => ({ ...p, specializations: specDraft }));
    setSpecOpen(false);
  }

  // ── Spec tag management (inside modal) ───────────────────────────────────
  function addSpec() {
    const t = newSpec.trim();
    if (t && !specDraft.includes(t)) {
      setSpecDraft((p) => [...p, t]);
      setNewSpec("");
    }
  }
  function removeSpec(i: number) {
    setSpecDraft((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <CompanyNavbar />
      <div className="rp-page">
        {/* ══ HEADER ════════════════════════════════════════════ */}

        {/* ══ MAIN ══════════════════════════════════════════════ */}
        <main className="rp-main">
          {/* Page heading */}
          <div className="au">
            <h1 className="rp-page-title">My Profile</h1>
            <p className="rp-page-sub">
              Manage your recruiter identity and specializations
            </p>
          </div>

          {/* ── Profile Completion ──────────────────────────── */}
          <div className="rp-card rp-completion-card au d1">
            <div className="rp-card-body">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="rp-card-title">Profile Completion</span>
                <span className="rp-completion-badge">{overall}%</span>
              </div>
              <div className="rp-track">
                <div
                  className="rp-fill"
                  style={{ "--w": `${overall}%` } as React.CSSProperties}
                />
              </div>

              {/* Sub-section rows */}
              <div className="d-flex flex-column gap-2 mt-2">
                {Object.entries(sections).map(([label, pct]) => (
                  <div key={label}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        {pct === 1 ? (
                          <CheckCircle
                            size={13}
                            style={{ color: "var(--success)" }}
                          />
                        ) : (
                          <AlertCircle
                            size={13}
                            style={{ color: "var(--warning)" }}
                          />
                        )}
                        <span className="rp-sub-label">{label}</span>
                      </div>
                      <span className="rp-sub-pct">
                        {Math.round(pct * 100)}%
                      </span>
                    </div>
                    <div className="rp-sub-track">
                      <div
                        className="rp-sub-fill"
                        style={
                          { "--w": `${pct * 100}%` } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Personal Info ───────────────────────────────── */}
          <div className="rp-card au d2">
            <div className="rp-card-header">
              <span className="rp-card-title">
                <User size={15} />
                Personal Information
              </span>
              <button
                className="rp-btn rp-btn--outline rp-btn--sm"
                onClick={openInfo}
              >
                <Edit2 size={13} /> Edit
              </button>
            </div>
            <div className="rp-card-body">
              <div className="d-flex align-items-start gap-3">
                <div className="rp-avatar">{data.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="rp-name">{data.name}</div>
                
                  <a
                    href={data.linkedin}
                    className="rp-linkedin"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Link size={12} /> {data.linkedin}
                  </a>
                  <div className="rp-meta-row">
                    <span className="rp-meta-item">
                      <Mail size={13} />
                      {data.email}
                    </span>
                    {/* <span className="rp-meta-item">
                      <Phone size={13} />
                      {data.phone}
                    </span> */}
                    <span className="rp-meta-item">
                      <MapPin size={13} />
                      {data.location}
                    </span>
                    <span className="rp-meta-item">
                      <Calendar size={13} />
                      Joined {data.joined}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── About ───────────────────────────────────────── */}
          <div className="rp-card au d3">
            <div className="rp-card-header">
              <span className="rp-card-title">
                <FileText size={15} />
                About
              </span>
              <button
                className="rp-btn rp-btn--outline rp-btn--sm"
                onClick={openAbout}
              >
                <Edit2 size={13} /> Edit
              </button>
            </div>
            <div className="rp-card-body">
              <p className="rp-bio">{data.bio}</p>
            </div>
          </div>

          {/* ── Specializations ─────────────────────────────── */}
          <div className="rp-card au d4">
            <div className="rp-card-header">
              <span className="rp-card-title">
                <Star size={15} />
                Specializations
              </span>
              <button
                className="rp-btn rp-btn--outline rp-btn--sm"
                onClick={openSpec}
              >
                <Edit2 size={13} /> Edit
              </button>
            </div>
            <div className="rp-card-body">
              <div className="d-flex flex-wrap gap-2">
                {data.specializations.map((s) => (
                  <span key={s.id} className="rp-spec-tag">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ══ MODAL — Personal Info ═════════════════════════════ */}
        <Modal
          open={infoOpen}
          onClose={() => setInfoOpen(false)}
          title="Edit Personal Information"
          icon={<User size={15} />}
          size="md"
          footer={
            <>
              <button
                className="rp-btn rp-btn--ghost"
                onClick={() => setInfoOpen(false)}
              >
                Cancel
              </button>
              <button className="rp-btn rp-btn--primary" onClick={saveInfo}>
                <Save size={13} /> Save Changes
              </button>
            </>
          }
        >
          <div className="d-flex flex-column gap-3">
            <div className="row g-3">
              {[
                { label: "Full Name", key: "name", type: "text" },
                // { label: "Job Title", key: "title", type: "text" },
                // { label: "Company", key: "company", type: "text" },
                { label: "Email", key: "email", type: "email" },
                // { label: "Phone", key: "phone", type: "tel" },
                { label: "Location", key: "location", type: "text" },
                { label: "LinkedIn URL", key: "linkedin", type: "url" },
              ].map((f) => (
                <div
                  key={f.key}
                  className={
                    f.key === "linkedin" ? "col-12" : "col-12 col-sm-6"
                  }
                >
                  <div className="rp-field">
                    <label className="rp-label">{f.label}</label>
                    <input
                      className="rp-input"
                      type={f.type}
                      value={infoDraft[f.key as keyof RecruiterData] as string}
                      onChange={(e) =>
                        setInfoDraft({ ...infoDraft, [f.key]: e.target.value })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>

        {/* ══ MODAL — About ═════════════════════════════════════ */}
        <Modal
          open={aboutOpen}
          onClose={() => setAboutOpen(false)}
          title="Edit About"
          icon={<FileText size={15} />}
          size="md"
          footer={
            <>
              <button
                className="rp-btn rp-btn--ghost"
                onClick={() => setAboutOpen(false)}
              >
                Cancel
              </button>
              <button className="rp-btn rp-btn--primary" onClick={saveAbout}>
                <Save size={13} /> Save Changes
              </button>
            </>
          }
        >
          <div className="rp-field">
            <label className="rp-label">Bio</label>
            <textarea
              className="rp-textarea"
              rows={6}
              placeholder="Describe your experience and expertise…"
              value={aboutDraft}
              onChange={(e) => setAboutDraft(e.target.value)}
            />
            <span
              style={{
                fontSize: ".75rem",
                color: "var(--muted)",
                marginTop: ".2rem",
              }}
            >
              {aboutDraft.trim().length} characters
            </span>
          </div>
        </Modal>

        {/* ══ MODAL — Specializations ═══════════════════════════ */}
        <Modal
          open={specOpen}
          onClose={() => setSpecOpen(false)}
          title="Edit Specializations"
          icon={<Star size={15} />}
          size="sm"
          footer={
            <>
              <button
                className="rp-btn rp-btn--ghost"
                onClick={() => setSpecOpen(false)}
              >
                Cancel
              </button>
              <button className="rp-btn rp-btn--primary" onClick={saveSpec}>
                <Save size={13} /> Save Changes
              </button>
            </>
          }
        >
          {/* Current tags */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {specDraft.map((s, i) => (
              <span key={s.id} className="rp-spec-tag">
                {s.name}
                <button
                  className="rp-spec-remove"
                  onClick={() => removeSpec(i)}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            {specDraft.length === 0 && (
              <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                No specializations added yet.
              </span>
            )}
          </div>

          {/* Add new */}
          <div className="d-flex gap-2">
            <input
              className="rp-skill-input"
              placeholder="e.g. AI/ML Engineers"
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSpec()}
            />
            <button
              className="rp-btn rp-btn--primary rp-btn--sm"
              onClick={addSpec}
            >
              <Plus size={13} />
            </button>
          </div>
        </Modal>
      </div>
    </>
  );
}
