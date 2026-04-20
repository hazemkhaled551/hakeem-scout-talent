import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  CreditCard,
  TrendingUp,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  UserCell,
  type Column,
} from "../../components/Admintable";

/* ── Types ── */
interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  status: string;
}
interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: string;
  apps: number;
  postedAt: string;
}

/* ── Dummy ── */
const DUMMY_USERS: RecentUser[] = [
  {
    id: "1",
    name: "Sara Mostafa",
    email: "sara@example.com",
    role: "Applicant",
    joinedAt: "Apr 17, 2026",
    status: "Active",
  },
  {
    id: "2",
    name: "TechCorp Inc.",
    email: "hr@techcorp.com",
    role: "Company",
    joinedAt: "Apr 16, 2026",
    status: "Active",
  },
  {
    id: "3",
    name: "Ahmed Nour",
    email: "ahmed@example.com",
    role: "Applicant",
    joinedAt: "Apr 15, 2026",
    status: "Pending",
  },
  {
    id: "4",
    name: "InnovateLabs",
    email: "jobs@innov.io",
    role: "Company",
    joinedAt: "Apr 14, 2026",
    status: "Active",
  },
  {
    id: "5",
    name: "Mona Hassan",
    email: "mona@example.com",
    role: "Applicant",
    joinedAt: "Apr 14, 2026",
    status: "Inactive",
  },
];

const DUMMY_JOBS: RecentJob[] = [
  {
    id: "1",
    title: "Senior Backend Engineer",
    company: "TechCorp Inc.",
    status: "Published",
    apps: 24,
    postedAt: "Apr 16, 2026",
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "DesignStudio",
    status: "Published",
    apps: 18,
    postedAt: "Apr 15, 2026",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    company: "CloudBase",
    status: "Closed",
    apps: 31,
    postedAt: "Apr 12, 2026",
  },
  {
    id: "4",
    title: "UI/UX Designer",
    company: "MediaGroup",
    status: "Draft",
    apps: 0,
    postedAt: "Apr 11, 2026",
  },
];

const STATUS_COLOR: Record<string, "green" | "amber" | "red" | "gray"> = {
  Active: "green",
  Published: "green",
  Pending: "amber",
  Draft: "amber",
  Inactive: "red",
  Closed: "red",
};

const USER_COLS: Column<RecentUser>[] = [
  {
    key: "name",
    label: "User",
    render: (r) => <UserCell name={r.name} sub={r.email} />,
  },
  {
    key: "role",
    label: "Role",
    render: (r) => (
      <Badge label={r.role} color={r.role === "Company" ? "cyan" : "indigo"} />
    ),
  },
  {
    key: "joinedAt",
    label: "Joined",
    render: (r) => (
      <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
        {r.joinedAt}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <Badge label={r.status} color={STATUS_COLOR[r.status] ?? "gray"} />
    ),
  },
];

const JOB_COLS: Column<RecentJob>[] = [
  {
    key: "title",
    label: "Job Title",
    render: (r) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: ".85rem" }}>{r.title}</div>
        <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
          {r.company}
        </div>
      </div>
    ),
  },
  {
    key: "apps",
    label: "Apps",
    render: (r) => (
      <span
        style={{ fontFamily: "Syne", fontWeight: 700, color: "var(--primary)" }}
      >
        {r.apps}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (r) => (
      <Badge label={r.status} color={STATUS_COLOR[r.status] ?? "gray"} />
    ),
  },
  {
    key: "postedAt",
    label: "Posted",
    render: (r) => (
      <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
        {r.postedAt}
      </span>
    ),
  },
];

/* ════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview">
      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Users",
            value: "4,821",
            hint: "+12% this month",
            icon: <Users size={16} />,
            color: "indigo" as const,
            delta: { value: "12%", up: true },
          },
          {
            label: "Active Jobs",
            value: "138",
            hint: "Published",
            icon: <Briefcase size={16} />,
            color: "green" as const,
            delta: { value: "8%", up: true },
          },
          {
            label: "Revenue (MRR)",
            value: "$8,240",
            hint: "This month",
            icon: <CreditCard size={16} />,
            color: "cyan" as const,
            delta: { value: "22%", up: true },
          },
          {
            label: "Offers Sent",
            value: "312",
            hint: "This month",
            icon: <TrendingUp size={16} />,
            color: "amber" as const,
            delta: { value: "5%", up: false },
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-xl-3 adm-au adm-d${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Activity strip */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "New signups today",
            value: 14,
            icon: <Activity size={14} />,
            col: "var(--primary)",
          },
          {
            label: "Pending verifications",
            value: 7,
            icon: <Clock size={14} />,
            col: "var(--warning)",
          },
          {
            label: "Hired this week",
            value: 23,
            icon: <CheckCircle size={14} />,
            col: "var(--success)",
          },
          {
            label: "Rejected apps today",
            value: 5,
            icon: <XCircle size={14} />,
            col: "var(--danger)",
          },
        ].map((a, i) => (
          <div key={i} className={`col-6 col-lg-3 adm-au adm-d${i + 1}`}>
            <div
              style={{
                background: "var(--white)",
                borderRadius: 13,
                border: "1px solid var(--border)",
                padding: ".9rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: ".7rem",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: `${a.col}18`,
                  color: a.col,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {a.icon}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    color: "var(--text)",
                    lineHeight: 1,
                  }}
                >
                  {a.value}
                </div>
                <div
                  style={{
                    fontSize: ".74rem",
                    color: "var(--muted)",
                    marginTop: ".15rem",
                  }}
                >
                  {a.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="row g-4">
        <div className="col-12 col-xl-6 adm-au adm-d2">
          <AdminTable<RecentUser>
            title="Recent Users"
            columns={USER_COLS}
            data={DUMMY_USERS}
            loading={loading}
            emptyTitle="No users yet"
          />
        </div>
        <div className="col-12 col-xl-6 adm-au adm-d3">
          <AdminTable<RecentJob>
            title="Recent Jobs"
            columns={JOB_COLS}
            data={DUMMY_JOBS}
            loading={loading}
            emptyTitle="No jobs yet"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
