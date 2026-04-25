import { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  Eye,
  Ban,
  CheckCircle,
  MapPin,
  // Plus,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  Badge,
  UserCell,
  type Column,
} from "../../components/Admintable";

import {
  getAllCompanies,
  banUser,
  unbanUser,
} from "../../services/AdminDashboard/users";

/* ════════════════════════════════════════════════════════════
   TYPES & DUMMY
════════════════════════════════════════════════════════════ */
interface Company {
  id: string;
  name: string;
  email: string;
  location: string;
  plan: "Free" | "Pro" | "Enterprise";
  status: "Active" | "Pending" | "Suspended";
  jobs: number;
  hires: number;
  joinedAt: string;
  verified: boolean;
}

// const DUMMY: Company[] = [
//   {
//     id: "1",
//     name: "TechCorp Inc.",
//     email: "hr@techcorp.com",
//     location: "Cairo, Egypt",
//     plan: "Pro",
//     status: "Active",
//     jobs: 12,
//     hires: 8,
//     joinedAt: "Jan 5, 2026",
//     verified: true,
//   },
//   {
//     id: "2",
//     name: "CloudBase",
//     email: "team@cloudbase.com",
//     location: "Dubai, UAE",
//     plan: "Enterprise",
//     status: "Active",
//     jobs: 27,
//     hires: 19,
//     joinedAt: "Feb 1, 2026",
//     verified: true,
//   },
//   {
//     id: "3",
//     name: "DesignStudio",
//     email: "jobs@design.io",
//     location: "Alexandria, Egypt",
//     plan: "Pro",
//     status: "Active",
//     jobs: 6,
//     hires: 3,
//     joinedAt: "Mar 10, 2026",
//     verified: true,
//   },
//   {
//     id: "4",
//     name: "MediaGroup",
//     email: "hr@media.com",
//     location: "Giza, Egypt",
//     plan: "Free",
//     status: "Pending",
//     jobs: 2,
//     hires: 0,
//     joinedAt: "Apr 10, 2026",
//     verified: false,
//   },
//   {
//     id: "5",
//     name: "InnovateLabs",
//     email: "jobs@innov.io",
//     location: "Cairo, Egypt",
//     plan: "Pro",
//     status: "Active",
//     jobs: 9,
//     hires: 5,
//     joinedAt: "Mar 15, 2026",
//     verified: true,
//   },
//   {
//     id: "6",
//     name: "StartupXYZ",
//     email: "hi@startup.xyz",
//     location: "Remote",
//     plan: "Free",
//     status: "Suspended",
//     jobs: 1,
//     hires: 0,
//     joinedAt: "Jan 20, 2026",
//     verified: false,
//   },
//   {
//     id: "7",
//     name: "DataFlow Systems",
//     email: "info@dataflow.io",
//     location: "Cairo, Egypt",
//     plan: "Enterprise",
//     status: "Active",
//     jobs: 18,
//     hires: 12,
//     joinedAt: "Dec 1, 2025",
//     verified: true,
//   },
//   {
//     id: "8",
//     name: "MobileFirst",
//     email: "hr@mobilefirst.dev",
//     location: "Remote",
//     plan: "Pro",
//     status: "Active",
//     jobs: 5,
//     hires: 2,
//     joinedAt: "Apr 5, 2026",
//     verified: true,
//   },
// ];

const PLAN_COLOR: Record<string, "indigo" | "cyan" | "gray"> = {
  Pro: "indigo",
  Enterprise: "cyan",
  Free: "gray",
};
const STATUS_COLOR: Record<string, "green" | "amber" | "red"> = {
  Active: "green",
  Pending: "amber",
  Suspended: "red",
};

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */

function mapCompanies(apiUsers: any[]): Company[] {
  return apiUsers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    location: c.location || "—",

    // 🔥 Status Logic
    status: c.isBanned ? "Suspended" : c.isDelete ? "Suspended" : "Active",

    verified: c.isEmailVerified,

    joinedAt: new Date(c.createAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),

    plan: "Free",
    jobs: 0,
    hires: 0,
  }));
}
export default function AdminCompanies() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);

      const res = await getAllCompanies(page, PAGE_SIZE);

      const data = res.data.data;

      setCompanies(mapCompanies(data.users));
      setStats(data.status);
      setTotal(data.pagination.total);

      setLoading(false);
    }

    loadCompanies();
  }, [page, search, planFilter, statusFilter]);

  async function handleBan(id: string) {
    await banUser(id);
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Suspended" } : c)),
    );
  }
  async function handleUnban(id: string) {
    await unbanUser(id);
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Active" } : c)),
    );
  }
  // const filtered = useMemo(
  //   () =>
  //     DUMMY.filter((c) => {
  //       const q = search.toLowerCase();
  //       return (
  //         (!q ||
  //           c.name.toLowerCase().includes(q) ||
  //           c.email.toLowerCase().includes(q)) &&
  //         (!planFilter || c.plan === planFilter) &&
  //         (!statusFilter || c.status === statusFilter)
  //       );
  //     }),
  //   [search, planFilter, statusFilter],
  // );

  // const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const COLS: Column<Company>[] = [
    {
      key: "name",
      label: "Company",
      render: (r) => <UserCell name={r.name} sub={r.email} />,
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
      key: "plan",
      label: "Plan",
      render: (r) => (
        <Badge label={r.plan} color={PLAN_COLOR[r.plan]} dot={false} />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    {
      key: "verified",
      label: "Verified",
      render: (r) =>
        r.verified ? (
          <Badge label="Verified" color="green" dot={false} />
        ) : (
          <Badge label="Unverified" color="amber" dot={false} />
        ),
    },
    {
      key: "jobs",
      label: "Jobs",
      render: (r) => (
        <span
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            color: "var(--primary)",
          }}
        >
          {r.jobs}
        </span>
      ),
    },
    {
      key: "hires",
      label: "Hires",
      render: (r) => (
        <span
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            color: "var(--success)",
          }}
        >
          {r.hires}
        </span>
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
      key: "actions",
      label: "Actions",
      width: "130px",
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn">
            <Eye size={12} /> View
          </button>
          {r.status !== "Suspended" ? (
            <button
              className="adm-row-btn adm-row-btn--danger"
              onClick={() => handleBan(r.id)}
            >
              <Ban size={12} />
            </button>
          ) : (
            <button
              className="adm-row-btn adm-row-btn--success"
              onClick={() => handleUnban(r.id)}
            >
              <CheckCircle size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Companies" breadcrumb="Companies">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total ",
            value: stats.totalCompanies || 0,
            color: "indigo" as const,
          },
          {
            label: "Active",
            value: stats.active || 0,
            color: "green" as const,
          },
          // {
          //   label: "Pro / Enterprise",
          //   value: DUMMY.filter((c) => c.plan !== "Free").length,
          //   color: "cyan" as const,
          // },
          {
            label: "Suspended",
            value: stats.ban || 0,
            color: "red" as const,
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
        <AdminTable<Company>
          title="All Companies"
          columns={COLS}
          data={companies}
          loading={loading}
          emptyTitle="No companies found"
          emptyIcon={<Briefcase size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          searchSlot={
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search companies…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select
                className="adm-select"
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Plans</option>
                <option>Free</option>
                <option>Pro</option>
                <option>Enterprise</option>
              </select>
              <select
                className="adm-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Status</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
          }
        />
      </div>
    </AdminLayout>
  );
}
