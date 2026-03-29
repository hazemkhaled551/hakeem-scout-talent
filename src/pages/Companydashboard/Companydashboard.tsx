import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  Search,
  Filter,
  Menu,
  X,
  User,
  Plus,
  Briefcase,
  BarChart2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import "./CompanyDashboard.css";
import { getCompanyDashboardStats } from "../../services/companyService";
import { getJobsApplicants } from "../../services/candidateService";
import Loader from "../../components/Loader";

// ─── Types ────────────────────────────────────────────────────────────────────
type CandidateStatus = "New" | "Screening" | "Interview" | "Offer" | "Hired";

interface Candidate {
  id: string; // بدل number
  name: string;
  position: string;
  aiScore: number;
  skills: string[];
  appliedDate: string;
  status: CandidateStatus;
}
// ─── Column config ────────────────────────────────────────────────────────────
const COLUMNS: Array<{
  id: CandidateStatus;
  title: string;
  headerClass: string;
  dotClass: string;
}> = [
  {
    id: "New",
    title: "New Applications",
    headerClass: "cd-col-header--new",
    dotClass: "cd-col-dot--new",
  },
  {
    id: "Screening",
    title: "Screening",
    headerClass: "cd-col-header--screening",
    dotClass: "cd-col-dot--screening",
  },
  {
    id: "Interview",
    title: "Interview",
    headerClass: "cd-col-header--interview",
    dotClass: "cd-col-dot--interview",
  },
  {
    id: "Offer",
    title: "Offer Sent",
    headerClass: "cd-col-header--offer",
    dotClass: "cd-col-dot--offer",
  },
  {
    id: "Hired",
    title: "Hired",
    headerClass: "cd-col-header--hired",
    dotClass: "cd-col-dot--hired",
  },
];

// ─── KPI config ───────────────────────────────────────────────────────────────

// ─── Mock data ────────────────────────────────────────────────────────────────
// const INITIAL_CANDIDATES: Candidate[] = [
//   {
//     id: 1,
//     name: "Alex Johnson",
//     position: "Senior Software Engineer",
//     aiScore: 95,
//     skills: ["React", "Node.js", "AWS"],
//     appliedDate: "2 days ago",
//     status: "New",
//   },
//   {
//     id: 2,
//     name: "Maria Garcia",
//     position: "Full Stack Developer",
//     aiScore: 92,
//     skills: ["Python", "Django", "PostgreSQL"],
//     appliedDate: "3 days ago",
//     status: "New",
//   },
//   {
//     id: 3,
//     name: "James Lee",
//     position: "Frontend Engineer",
//     aiScore: 88,
//     skills: ["Vue.js", "TypeScript", "CSS"],
//     appliedDate: "4 days ago",
//     status: "New",
//   },
//   {
//     id: 4,
//     name: "Sarah Williams",
//     position: "DevOps Engineer",
//     aiScore: 94,
//     skills: ["Kubernetes", "Docker", "CI/CD"],
//     appliedDate: "1 week ago",
//     status: "Screening",
//   },
//   {
//     id: 5,
//     name: "David Chen",
//     position: "Backend Developer",
//     aiScore: 90,
//     skills: ["Java", "Spring Boot", "Microservices"],
//     appliedDate: "1 week ago",
//     status: "Screening",
//   },
//   {
//     id: 6,
//     name: "Emily Brown",
//     position: "UI/UX Developer",
//     aiScore: 87,
//     skills: ["Figma", "React", "Design Systems"],
//     appliedDate: "1 week ago",
//     status: "Screening",
//   },
//   {
//     id: 7,
//     name: "Michael Taylor",
//     position: "Senior Software Engineer",
//     aiScore: 93,
//     skills: ["Go", "Microservices", "gRPC"],
//     appliedDate: "2 weeks ago",
//     status: "Interview",
//   },
//   {
//     id: 8,
//     name: "Lisa Anderson",
//     position: "Data Engineer",
//     aiScore: 91,
//     skills: ["Spark", "Airflow", "Python"],
//     appliedDate: "2 weeks ago",
//     status: "Interview",
//   },
//   {
//     id: 9,
//     name: "Robert Martinez",
//     position: "Full Stack Developer",
//     aiScore: 89,
//     skills: ["Angular", "NestJS", "MongoDB"],
//     appliedDate: "3 weeks ago",
//     status: "Offer",
//   },
//   {
//     id: 10,
//     name: "Jennifer Wilson",
//     position: "Senior Backend Engineer",
//     aiScore: 96,
//     skills: [".NET", "Azure", "SQL Server"],
//     appliedDate: "3 weeks ago",
//     status: "Offer",
//   },
//   {
//     id: 11,
//     name: "Thomas Moore",
//     position: "DevOps Engineer",
//     aiScore: 92,
//     skills: ["Terraform", "AWS", "Jenkins"],
//     appliedDate: "1 month ago",
//     status: "Hired",
//   },
//   {
//     id: 12,
//     name: "Patricia Davis",
//     position: "Frontend Developer",
//     aiScore: 88,
//     skills: ["React", "Next.js", "Tailwind"],
//     appliedDate: "1 month ago",
//     status: "Hired",
//   },
// ];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompanyDashboard() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fetchApplicants() {
    try {
      const res = await getJobsApplicants();

      const apps = res.data.data.jobaApply;

      const mappedCandidates = apps.map((item: any) => ({
        id: item.id, // خليها string عادي
        name: item.applicant.name,
        position: item.job.title,
        aiScore: Math.floor(Math.random() * 30) + 70, // مؤقت لحد ما API يبقى فيه score
        skills: item.job.skills || [],
        appliedDate: "Recently", // أو تعمل format لو فيه date بعدين
        status: "New", // default لحد ما يبقى فيه status من backend
      }));

      setCandidates(mappedCandidates);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fn = async () => {
      try {
        setLoading(true);

        const stats = await getCompanyDashboardStats();
        console.log(stats);
        setStats(stats.data.data);
        await fetchApplicants();
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fn();
  }, []);

  // filters
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "All">(
    "All",
  );
  const [minScore, setMinScore] = useState(0);
  const [skillFilter, setSkillFilter] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const hasFilters = !!(
    search ||
    selectedStatus !== "All" ||
    minScore ||
    skillFilter
  );

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        c.name.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))) &&
      (selectedStatus === "All" || c.status === selectedStatus) &&
      c.aiScore >= minScore &&
      (!skillFilter ||
        c.skills.some((s) =>
          s.toLowerCase().includes(skillFilter.toLowerCase()),
        ))
    );
  });

  const colCandidates = (status: CandidateStatus) =>
    filtered.filter((c) => c.status === status);

  const resetFilters = () => {
    setSearch("");
    setSelectedStatus("All");
    setMinScore(0);
    setSkillFilter("");
  };

  const KPIS = [
    {
      label: "Active Jobs",
      value: stats ? stats.activeJobs : "—",
      hint: "+2 this month",
      icon: <Briefcase size={16} />,
      iconCls: "cd-kpi-icon--indigo",
      valCls: "cd-kpi-value--indigo",
      cardCls: "cd-kpi--indigo",
    },
    {
      label: "Total Candidates",
      value: stats ? stats.totalCandidates : "—",
      hint: "In pipeline",
      icon: <Users size={16} />,
      iconCls: "cd-kpi-icon--blue",
      valCls: "cd-kpi-value--blue",
      cardCls: "cd-kpi--blue",
    },
    {
      label: "Avg. Time to Hire",
      value: stats ? `${stats.avgTimeToHireDays} days` : "—",
      hint: "-3 days vs last month",
      icon: <Clock size={16} />,
      iconCls: "cd-kpi-icon--amber",
      valCls: "cd-kpi-value--amber",
      cardCls: "cd-kpi--amber",
    },
    {
      label: "Offers Sent",
      value: stats ? stats.offersSent : "—",
      hint: "This month",
      icon: <TrendingUp size={16} />,
      iconCls: "cd-kpi-icon--green",
      valCls: "cd-kpi-value--green",
      cardCls: "cd-kpi--green",
    },
    {
      label: "Hired",
      value: stats ? stats.hired : "—",
      hint: "75% acceptance rate",
      icon: <CheckCircle size={16} />,
      iconCls: "cd-kpi-icon--emerald",
      valCls: "cd-kpi-value--emerald",
      cardCls: "cd-kpi--emerald",
    },
  ];

  if (loading) {
    <Loader text="Loading...." fullPage />;
  }
  return (
    <div className="cd-page">
      {/* ══ HEADER ════════════════════════════════════════════ */}
      <header className={`cd-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center justify-content-between py-3">
            {/* Logo */}
            <div className="d-flex align-items-center gap-2">
              <div className="cd-logo">H</div>
              <span className="cd-brand">Hakeem</span>
            </div>

            {/* Desktop nav */}
            <div className="d-none d-md-flex align-items-center gap-2">
              <button
                className="cd-nav-link"
                onClick={() => navigate("/analytics")}
              >
                <BarChart2 size={14} /> Analytics
              </button>
              <button
                className="cd-nav-link cd-nav-link--primary"
                onClick={() => navigate("/company/jobs")}
              >
                <Briefcase size={14} /> My Job Posts
              </button>
              <button
                className="cd-nav-link cd-nav-link--primary"
                onClick={() => navigate("/company/interviews")}
              >
                <Briefcase size={14} /> Interviews
              </button>
              <button
                className="cd-nav-link"
                onClick={() => navigate("/company/profile")}
              >
                <User size={14} /> Profile
              </button>
              <button className="cd-nav-link" onClick={() => navigate("/")}>
                <LogOut size={14} /> Logout
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="cd-btn cd-btn--ghost d-md-none"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="cd-mobile-drawer d-md-none asd">
            <div className="d-flex flex-column gap-2">
              {[
                {
                  label: "Analytics",
                  icon: <BarChart2 size={14} />,
                  path: "/analytics",
                },
                {
                  label: "Job Posts",
                  icon: <Briefcase size={14} />,
                  path: "/my-posts",
                },
                {
                  label: "Profile",
                  icon: <User size={14} />,
                  path: "/company/profile",
                },
                { label: "Logout", icon: <LogOut size={14} />, path: "/" },
              ].map((n) => (
                <button
                  key={n.path}
                  className="cd-nav-link cd-btn--full"
                  onClick={() => navigate(n.path)}
                >
                  {n.icon} {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <main className="cd-main">
        {/* Page title */}
        <div className="mb-4 au">
          <h1 className="cd-page-title">Recruitment Pipeline</h1>
          <p className="cd-page-sub">
            Manage candidates across every hiring stage
          </p>
        </div>

        {/* ── KPI row ─────────────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-3 au d1">
          <span className="cd-section-title">Statistics</span>
          <span className="cd-section-meta">Last 3 months</span>
        </div>

        <div className="row g-3 mb-4">
          {KPIS.map((k, i) => (
            <div key={i} className="col-6 col-md-4 col-lg">
              <div className={`cd-kpi-card ${k.cardCls} ac d${i + 1}`}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="cd-kpi-label">{k.label}</span>
                  <div className={`cd-kpi-icon ${k.iconCls}`}>{k.icon}</div>
                </div>
                <div className={`cd-kpi-value ${k.valCls}`}>{k.value}</div>
                <div className="cd-kpi-hint">{k.hint}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search ──────────────────────────────────────── */}
        <div className="au d2 mb-3">
          <div className="d-flex gap-2">
            <div className="cd-search-wrap flex-1 w-100">
              <Search size={15} className="cd-search-icon" />
              <input
                className="cd-input cd-search-input"
                placeholder="Search by name, position, or skill…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={`cd-btn ${showFilters ? "cd-btn--primary" : "cd-btn--outline"}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} /> Filters
              {hasFilters && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--warning)",
                    flexShrink: 0,
                  }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="cd-filter-panel mb-4 asd">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-sm-6 col-md-3">
                <label
                  className="cd-section-meta d-block mb-1"
                  style={{
                    fontSize: ".73rem",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    fontWeight: 600,
                  }}
                >
                  Status
                </label>
                <select
                  className="cd-select"
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as CandidateStatus | "All")
                  }
                >
                  <option value="All">All Stages</option>
                  {COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label
                  className="cd-section-meta d-block mb-1"
                  style={{
                    fontSize: ".73rem",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    fontWeight: 600,
                  }}
                >
                  Min AI Score
                </label>
                <select
                  className="cd-select"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                >
                  <option value={0}>Any score</option>
                  <option value={70}>70%+</option>
                  <option value={80}>80%+</option>
                  <option value={90}>90%+</option>
                </select>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label
                  className="cd-section-meta d-block mb-1"
                  style={{
                    fontSize: ".73rem",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    fontWeight: 600,
                  }}
                >
                  Skill
                </label>
                <input
                  className="cd-input"
                  placeholder="e.g. React"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <button
                  className="cd-btn cd-btn--outline cd-btn--full"
                  style={{ opacity: hasFilters ? 1 : 0.45 }}
                  disabled={!hasFilters}
                  onClick={resetFilters}
                >
                  <X size={13} /> Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Kanban board ────────────────────────────────── */}
        <div className="d-flex align-items-center justify-content-between mb-3 au d3">
          <span className="cd-section-title">Pipeline Board</span>
          <button
            className="cd-btn cd-btn--primary cd-btn--sm"
            onClick={() => navigate("/my-posts/new")}
          >
            <Plus size={13} /> Post a Job
          </button>
        </div>

        <div className="cd-board au d3">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              candidates={colCandidates(col.id)}
              onCardClick={(id) =>
                navigate(`/company/candidateevaluation/${id}`)
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────
interface KanbanColumnProps {
  col: (typeof COLUMNS)[number];
  candidates: Candidate[];
  onCardClick: (id: string) => void;
}

function KanbanColumn({ col, candidates, onCardClick }: KanbanColumnProps) {
  return (
    <div className="cd-col">
      {/* Header */}
      <div className={`cd-col-header ${col.headerClass}`}>
        <span className="cd-col-title">
          <span className={`cd-col-dot ${col.dotClass}`} />
          {col.title}
        </span>
        <span className="cd-col-count">{candidates.length}</span>
      </div>

      {/* Body */}
      <div className="cd-col-body">
        {candidates.length === 0 ? (
          <div className="cd-col-empty">
            <div className="cd-col-empty-icon">
              <Users size={18} />
            </div>
            <span>No candidates here</span>
          </div>
        ) : (
          candidates.map((c, i) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              delay={i}
              onClick={() => onCardClick(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
interface CandidateCardProps {
  candidate: Candidate;
  delay: number;
  onClick: () => void;
}

function CandidateCard({ candidate: c, delay, onClick }: CandidateCardProps) {
  const initials = c.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className={`cd-cand-card au d${Math.min(delay + 1, 6)}`}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="d-flex align-items-start gap-2 mb-2">
        <div className="cd-avatar">{initials}</div>
        <div className="flex-1 min-width-0">
          <div className="cd-cand-name">{c.name}</div>
          <div className="cd-cand-position">{c.position}</div>
        </div>
        <ChevronRight
          size={13}
          style={{ color: "var(--muted)", flexShrink: 0, marginTop: 2 }}
        />
      </div>

      {/* AI score */}
      <div className="d-flex align-items-center justify-content-between mb-1">
        <span className="cd-match-label">AI Match</span>
        <span className="cd-match-num">{c.aiScore}%</span>
      </div>
      <div className="cd-score-track mb-2">
        <div
          className="cd-score-fill"
          style={{ "--w": `${c.aiScore}%` } as React.CSSProperties}
        />
      </div>

      {/* Skills */}
      <div className="d-flex flex-wrap gap-1 mb-2">
        {c.skills.slice(0, 3).map((s) => (
          <span key={s} className="cd-skill-tag">
            {s}
          </span>
        ))}
      </div>

      {/* Date */}
      <div className="cd-cand-date">
        <Clock size={11} />
        Applied {c.appliedDate}
      </div>
    </div>
  );
}
