import { useState, useMemo } from "react";
import {
  Briefcase,
  Search,
  Eye,
  Trash2,
  PauseCircle,
  Play,
  MapPin,
  DollarSign,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  Badge,
  type Column,
} from "../../components/Admintable";

/* ════════════════════════════════════════════════════════════
   TYPES & DUMMY
════════════════════════════════════════════════════════════ */
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  workMode: string;
  status: "Published" | "Draft" | "Closed" | "Paused" | "Filled" | "Expired";
  applicants: number;
  hired: number;
  salary: string;
  postedAt: string;
  deadline: string;
}

const DUMMY: Job[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    company: "TechCorp Inc.",
    location: "Cairo",
    type: "Full_Time",
    workMode: "Hybrid",
    status: "Published",
    applicants: 24,
    hired: 2,
    salary: "$8k–$12k",
    postedAt: "Apr 16",
    deadline: "May 30, 2026",
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "DesignStudio",
    location: "Alexandria",
    type: "Full_Time",
    workMode: "Remote",
    status: "Published",
    applicants: 18,
    hired: 1,
    salary: "$5k–$8k",
    postedAt: "Apr 15",
    deadline: "May 15, 2026",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "CloudBase",
    location: "Dubai",
    type: "Full_Time",
    workMode: "Onsite",
    status: "Closed",
    applicants: 31,
    hired: 3,
    salary: "$10k–$15k",
    postedAt: "Apr 12",
    deadline: "Apr 30, 2026",
  },
  {
    id: "4",
    title: "UI/UX Designer",
    company: "MediaGroup",
    location: "Giza",
    type: "Part_Time",
    workMode: "Hybrid",
    status: "Draft",
    applicants: 0,
    hired: 0,
    salary: "$3k–$5k",
    postedAt: "Apr 11",
    deadline: "Jun 1, 2026",
  },
  {
    id: "5",
    title: "Data Scientist",
    company: "DataFlow Systems",
    location: "Remote",
    type: "Full_Time",
    workMode: "Remote",
    status: "Published",
    applicants: 42,
    hired: 1,
    salary: "$9k–$13k",
    postedAt: "Apr 10",
    deadline: "May 20, 2026",
  },
  {
    id: "6",
    title: "Mobile Developer",
    company: "MobileFirst",
    location: "Cairo",
    type: "Full_Time",
    workMode: "Hybrid",
    status: "Paused",
    applicants: 9,
    hired: 0,
    salary: "$6k–$9k",
    postedAt: "Apr 8",
    deadline: "May 10, 2026",
  },
  {
    id: "7",
    title: "Product Manager",
    company: "InnovateLabs",
    location: "Remote",
    type: "Full_Time",
    workMode: "Remote",
    status: "Filled",
    applicants: 57,
    hired: 1,
    salary: "$8k–$11k",
    postedAt: "Mar 20",
    deadline: "Apr 20, 2026",
  },
  {
    id: "8",
    title: "QA Engineer",
    company: "TechCorp Inc.",
    location: "Cairo",
    type: "Full_Time",
    workMode: "Onsite",
    status: "Expired",
    applicants: 14,
    hired: 0,
    salary: "$4k–$6k",
    postedAt: "Mar 10",
    deadline: "Apr 10, 2026",
  },
];

const STATUS_COLOR: Record<
  string,
  "green" | "amber" | "red" | "gray" | "indigo" | "cyan"
> = {
  Published: "green",
  Draft: "gray",
  Closed: "red",
  Paused: "amber",
  Filled: "indigo",
  Expired: "red",
};

const fmt = (t: string) => t.replace("_", " ");

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function AdminJobs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const filtered = useMemo(
    () =>
      DUMMY.filter((j) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            j.title.toLowerCase().includes(q) ||
            j.company.toLowerCase().includes(q)) &&
          (!statusFilter || j.status === statusFilter)
        );
      }),
    [search, statusFilter],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const COLS: Column<Job>[] = [
    {
      key: "title",
      label: "Job",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: ".86rem" }}>{r.title}</div>
          <div
            style={{
              fontSize: ".74rem",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              gap: ".3rem",
              marginTop: ".1rem",
            }}
          >
            <Briefcase size={10} />
            {r.company}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (r) => (
        <span
          className="d-flex align-items-center gap-1"
          style={{ fontSize: ".8rem", color: "var(--muted)" }}
        >
          <MapPin size={11} />
          {r.location}
        </span>
      ),
    },
    {
      key: "salary",
      label: "Salary",
      render: (r) => (
        <span
          className="d-flex align-items-center gap-1"
          style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--text)" }}
        >
          <DollarSign size={11} />
          {r.salary}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          {fmt(r.type)}
        </span>
      ),
    },
    {
      key: "mode",
      label: "Mode",
      render: (r) => <Badge label={r.workMode} color="cyan" dot={false} />,
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    {
      key: "apps",
      label: "Apps",
      render: (r) => (
        <span
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            color: "var(--primary)",
          }}
        >
          {r.applicants}
        </span>
      ),
    },
    {
      key: "hired",
      label: "Hired",
      render: (r) => (
        <span
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            color: "var(--success)",
          }}
        >
          {r.hired}
        </span>
      ),
    },
    {
      key: "deadline",
      label: "Deadline",
      render: (r) => (
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          {r.deadline}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "110px",
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn">
            <Eye size={12} />
          </button>
          {r.status === "Published" ? (
            <button className="adm-row-btn adm-row-btn--danger">
              <PauseCircle size={12} />
            </button>
          ) : r.status === "Paused" ? (
            <button className="adm-row-btn adm-row-btn--success">
              <Play size={12} />
            </button>
          ) : null}
          <button className="adm-row-btn adm-row-btn--danger">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Jobs" breadcrumb="Jobs">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Jobs", value: DUMMY.length, color: "indigo" },
          {
            label: "Published",
            value: DUMMY.filter((j) => j.status === "Published").length,
            color: "green",
          },
          {
            label: "Total Apps",
            value: DUMMY.reduce((a, j) => a + j.applicants, 0),
            color: "cyan",
          },
          {
            label: "Hired",
            value: DUMMY.reduce((a, j) => a + j.hired, 0),
            color: "amber",
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-md-3 adm-au adm-d${i + 1}`}>
            <div className={`adm-stat adm-stat--${s.color}`}>
              <div className="adm-stat-label">{s.label}</div>
              <div className={`adm-stat-val adm-stat-val--${s.color}`}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-au adm-d2">
        <AdminTable<Job>
          title="All Jobs"
          columns={COLS}
          data={paged}
          emptyTitle="No jobs found"
          emptyIcon={<Briefcase size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          searchSlot={
            <div className="d-flex align-items-center gap-2">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search jobs…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select
                className="adm-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Paused</option>
                <option>Closed</option>
                <option>Filled</option>
                <option>Expired</option>
              </select>
            </div>
          }
        />
      </div>
    </AdminLayout>
  );
}
