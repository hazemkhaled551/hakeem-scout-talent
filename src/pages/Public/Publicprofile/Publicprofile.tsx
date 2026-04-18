import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  Code2,
  Clock,
  CheckCircle,
  Building2,
  ExternalLink,
  Copy,
  Check,
  UserCircle2,
  XCircle,
} from "lucide-react";
import "./PublicProfile.css";

/* ════════════════════════════════════════════════════════════
   TYPES — mirrors both API shapes
════════════════════════════════════════════════════════════ */

/* ── Applicant shape ──────────────────────────────────────── */
interface ApplicantProfile {
  id: string;
  phone?: string;
  job_title?: string;
  candidateId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    location?: string;
    linkedIn_profile?: string;
    role: "Applicant";
    isEmailVerified: boolean;
    createAt: string;
  };
  skills: Array<{ id: string; name: string }>;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

/* ── Company shape ────────────────────────────────────────── */
interface CompanyProfile {
  id: string;
  About?: string;
  specialization: Array<{ id: string; name: string }>;
  user: {
    id: string;
    name: string;
    email: string;
    location?: string;
    linkedIn_profile?: string;
    role: "Company";
    isEmailVerified: boolean;
    createAt: string;
  };
}

type ProfileData = ApplicantProfile | CompanyProfile;

/* ════════════════════════════════════════════════════════════
   DUMMY DATA
════════════════════════════════════════════════════════════ */
const DUMMY_APPLICANT: ApplicantProfile = {
  id: "ac4f877b-7182-4e2f-80d3-e5277d73a203",
  phone: "01207396967",
  job_title: "Frontend Developer",
  candidateId: "53",
  user: {
    id: "527baa76",
    name: "Hazem Khaled",
    email: "zmyhazemkhaled@gmail.com",
    location: "Zagazig, Egypt",
    linkedIn_profile: "linkedin.com/in/hazem",
    role: "Applicant",
    isEmailVerified: true,
    createAt: "2026-04-17T12:49:50.666Z",
  },
  skills: [
    { id: "1", name: "React" },
    { id: "2", name: "TypeScript" },
    { id: "3", name: "JavaScript" },
    { id: "4", name: "Angular" },
    { id: "5", name: "Git" },
    { id: "6", name: "GitHub" },
  ],
  experiences: [
    {
      id: "24f1d649",
      title: "Frontend Developer",
      company: "Aziz Company",
      startDate: "2026-01-08T00:00:00.000Z",
      endDate: "2026-03-18T00:00:00.000Z",
      description:
        "Developed a fully functional internal ride-sharing web application using React. Integrated frontend with a custom API powered by Google Apps Script to enable real-time data exchange with Google Sheets.\n\nBuilt responsive and user-friendly interfaces, ensuring smooth user experience across devices.",
    },
  ],
};

const DUMMY_COMPANY: CompanyProfile = {
  id: "4f7f7c28-d20a-4027-8a01-93aa64707477",
  About: "We build great products and love working with talented people.",
  specialization: [],
  user: {
    id: "98aac737",
    name: "TechCorp Inc.",
    email: "hazemkhaled55677@gmail.com",
    location: "Cairo, Egypt",
    linkedIn_profile: "linkedin.com/company/techcorp",
    role: "Company",
    isEmailVerified: true,
    createAt: "2026-04-17T12:53:49.478Z",
  },
};

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function getInitials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function isApplicant(p: ProfileData): p is ApplicantProfile {
  return p.user.role === "Applicant";
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
   Routes:
     /profile/:id          — tries to detect role from API
     /profile/applicant/:id
     /profile/company/:id
════════════════════════════════════════════════════════════ */
export default function PublicProfile() {
  const { id, role } = useParams<{ id: string; role?: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Fetch profile ──────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setNotFound(false);

        // 🔥 Replace with your real API call:
        // const endpoint = role === "company"
        //   ? `/api/v1/profiles/company/${id}`
        //   : `/api/v1/profiles/applicant/${id}`;
        // const { data } = await api.get(endpoint);
        // setProfile(data.data);

        // Demo — pick dummy based on role param
        await new Promise((r) => setTimeout(r, 500));
        if (role === "company") {
          setProfile(DUMMY_COMPANY);
        } else {
          setProfile(DUMMY_APPLICANT);
        }
      } catch (err: any) {
        if (err?.response?.status === 404) setNotFound(true);
        else setProfile(DUMMY_APPLICANT);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, role]);

  /* ── Copy URL ───────────────────────────────────────────── */
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="pp-page">
        <div className="pp-loader">
          <div className="pp-spinner" />
          <span>Loading profile…</span>
        </div>
      </div>
    );
  }

  /* ── Not found ───────────────────────────────────────────── */
  if (notFound || !profile) {
    return (
      <div className="pp-page">
        <div className="pp-notfound">
          <div className="pp-notfound-icon">
            <XCircle size={30} />
          </div>
          <div className="pp-notfound-title">Profile Not Found</div>
          <p style={{ fontSize: ".88rem" }}>
            This profile may have been removed or the link is incorrect.
          </p>
          <button
            style={{
              marginTop: ".75rem",
              padding: ".5rem 1.2rem",
              borderRadius: 10,
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: ".84rem",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const user = profile.user;
  const isAppl = isApplicant(profile);
  const initials = getInitials(user.name);

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="pp-page">
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className={`pp-topbar ${scrolled ? "scrolled" : ""}`}>
        <a
          href="/"
          className="pp-logo"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <div className="pp-logo-box">H</div>
          <span className="pp-logo-name">Hakeem</span>
        </a>
        <button
          className={`pp-share-btn ${copied ? "pp-share-btn--copied" : ""}`}
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check size={13} /> Copied!
            </>
          ) : (
            <>
              <Copy size={13} /> Copy Link
            </>
          )}
        </button>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <div className="pp-hero">
        <div className="pp-hero-inner pp-au">
          {/* Avatar */}
          <div className="pp-avatar-wrap">
            <div className="pp-avatar">{initials}</div>
            <span
              className={`pp-role-badge pp-role-badge--${isAppl ? "applicant" : "company"}`}
            >
              {isAppl ? <UserCircle2 size={11} /> : <Building2 size={11} />}
              {isAppl ? "Applicant" : "Company"}
            </span>
          </div>

          {/* Name + title */}
          <h1 className="pp-name">{user.name}</h1>

          {isAppl && (profile as ApplicantProfile).job_title && (
            <div className="pp-job-title">
              <Briefcase size={14} />
              {(profile as ApplicantProfile).job_title}
            </div>
          )}

          {/* Meta row */}
          <div className="pp-meta-row">
            {user.location && (
              <span className="pp-meta-item">
                <MapPin size={12} />
                {user.location}
              </span>
            )}
            {user.email && (
              <span className="pp-meta-item">
                <Mail size={12} />
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </span>
            )}
            {isAppl && (profile as ApplicantProfile).phone && (
              <span className="pp-meta-item">
                <Phone size={12} />
                {(profile as ApplicantProfile).phone}
              </span>
            )}
            {user.linkedIn_profile && (
              <span className="pp-meta-item">
                <Linkedin size={12} />
                <a
                  href={
                    user.linkedIn_profile.startsWith("http")
                      ? user.linkedIn_profile
                      : `https://${user.linkedIn_profile}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn <ExternalLink size={10} />
                </a>
              </span>
            )}
            {user.isEmailVerified && (
              <span className="pp-verified">
                <CheckCircle size={11} /> Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════════════════ */}
      <main className="pp-main">
        {/* ── APPLICANT sections ──────────────────────── */}
        {isAppl &&
          (() => {
            const appl = profile as ApplicantProfile;
            return (
              <>
                {/* Skills */}
                <div className="pp-card pp-au pp-d1">
                  <div className="pp-card-header">
                    <Code2 size={15} style={{ color: "var(--primary)" }} />
                    <span className="pp-card-title">Skills</span>
                    {appl.skills.length > 0 && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: "rgba(79,70,229,.08)",
                          color: "var(--primary)",
                          borderRadius: 999,
                          padding: ".1rem .55rem",
                          fontFamily: "Syne",
                          fontWeight: 700,
                          fontSize: ".72rem",
                        }}
                      >
                        {appl.skills.length}
                      </span>
                    )}
                  </div>
                  <div className="pp-card-body">
                    {appl.skills.length === 0 ? (
                      <p className="pp-empty">No skills listed yet.</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {appl.skills.map((s) => (
                          <span key={s.id} className="pp-skill">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="pp-card pp-au pp-d2">
                  <div className="pp-card-header">
                    <Briefcase size={15} style={{ color: "var(--primary)" }} />
                    <span className="pp-card-title">Work Experience</span>
                    {appl.experiences.length > 0 && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: "rgba(79,70,229,.08)",
                          color: "var(--primary)",
                          borderRadius: 999,
                          padding: ".1rem .55rem",
                          fontFamily: "Syne",
                          fontWeight: 700,
                          fontSize: ".72rem",
                        }}
                      >
                        {appl.experiences.length}
                      </span>
                    )}
                  </div>
                  <div className="pp-card-body d-flex flex-column gap-3">
                    {appl.experiences.length === 0 ? (
                      <p className="pp-empty">No experience listed yet.</p>
                    ) : (
                      appl.experiences.map((exp) => (
                        <div key={exp.id} className="pp-exp-item">
                          <div className="pp-exp-title">{exp.title}</div>
                          <div className="pp-exp-company">
                            <Building2 size={12} />
                            {exp.company}
                          </div>
                          <div className="pp-exp-dates">
                            <Clock size={11} />
                            {fmtDate(exp.startDate)} – {fmtDate(exp.endDate)}
                          </div>
                          {exp.description && (
                            <p className="pp-exp-desc">{exp.description}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            );
          })()}

        {/* ── COMPANY sections ─────────────────────────── */}
        {!isAppl &&
          (() => {
            const comp = profile as CompanyProfile;
            return (
              <>
                {/* About */}
                {comp.About && (
                  <div className="pp-card pp-au pp-d1">
                    <div className="pp-card-header">
                      <Building2
                        size={15}
                        style={{ color: "var(--success)" }}
                      />
                      <span className="pp-card-title">About the Company</span>
                    </div>
                    <div className="pp-card-body">
                      <p
                        className="pp-about"
                        style={{ whiteSpace: "pre-line" }}
                      >
                        {comp.About}
                      </p>
                    </div>
                  </div>
                )}

                {/* Specializations */}
                <div className="pp-card pp-au pp-d2">
                  <div className="pp-card-header">
                    <Code2 size={15} style={{ color: "var(--success)" }} />
                    <span className="pp-card-title">Specializations</span>
                  </div>
                  <div className="pp-card-body">
                    {comp.specialization.length === 0 ? (
                      <p className="pp-empty">No specializations listed yet.</p>
                    ) : (
                      <div className="d-flex flex-wrap gap-2">
                        {comp.specialization.map((s) => (
                          <span key={s.id} className="pp-spec">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}

        {/* ── Joined date footer ─────────────────────── */}
        <div
          className="pp-au pp-d4"
          style={{
            textAlign: "center",
            fontSize: ".76rem",
            color: "var(--muted)",
            marginTop: "1rem",
          }}
        >
          <Clock
            size={11}
            style={{ marginRight: ".3rem", verticalAlign: "middle" }}
          />
          Joined Hakeem · {fmtDate(user.createAt)}
        </div>
      </main>
    </div>
  );
}
