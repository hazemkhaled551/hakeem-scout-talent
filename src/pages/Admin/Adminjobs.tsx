import { useState,  useEffect } from "react";
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
import AdminTable, { Badge, type Column } from "../../components/Admintable";

import { getAllJobs } from "../../services/AdminDashboard/jobs";

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

const mapJob = (j: any): Job => ({
  id: j.id,
  title: j.title,
  company: j.company?.id || "Unknown Company", // مفيش name فـ API
  location: j.location,
  type: j.type,
  workMode: j.workMode,
  status: j.status,
  applicants: j.applicationsCount,
  hired: j.acceptedCount,
  salary: `$${Number(j.minSalary) / 1000}k–$${Number(j.maxSalary) / 1000}k`,
  postedAt: new Date(j.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }),
  deadline: new Date(j.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
});
export default function AdminJobs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await getAllJobs(page, PAGE_SIZE);

        const mapped = res.data.data.jobs.map(mapJob);

        setJobs(mapped);
        setTotal(res.data.data.pagination.total);
        setStats(res.data.data.status);
      } catch (err) {
        console.error(err);
      }
    };

    fetchJobs();
  }, [page]);

  // const filtered = useMemo(
  //   () =>
  //     DUMMY.filter((j) => {
  //       const q = search.toLowerCase();
  //       return (
  //         (!q ||
  //           j.title.toLowerCase().includes(q) ||
  //           j.company.toLowerCase().includes(q)) &&
  //         (!statusFilter || j.status === statusFilter)
  //       );
  //     }),
  //   [search, statusFilter],
  // );

  // const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          { label: "Total Jobs", value: stats.totalJobs, color: "indigo" },
          {
            label: "Published",
            value: stats.published,
            color: "green",
          },
          {
            label: "Total Apps",
            value: stats.totalApplications,
            color: "cyan",
          },
          {
            label: "Hired",
            value: stats.totalHired,
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
          data={jobs}
          page={page}
          pageSize={PAGE_SIZE}
          total={total} // من API مش filtered.length
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
