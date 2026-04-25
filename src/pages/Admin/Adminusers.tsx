import { useState, useEffect } from "react";
import { Users, Search, Eye, Ban, CheckCircle } from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  Badge,
  UserCell,
  type Column,
} from "../../components/Admintable";

import {
  getAllUsers,
  // getUserDetails,
  banUser,
  unbanUser,
} from "../../services/AdminDashboard/users";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Applicant" | "Company";
  status: "Active" | "Pending" | "Suspended" | "Banned";
  verified: boolean;
  joinedAt: string;
  plan?: string;
}

// const DUMMY: User[] = [
//   {
//     id: "1",
//     name: "Sara Mostafa",
//     email: "sara@example.com",
//     role: "Applicant",
//     status: "Active",
//     verified: true,
//     joinedAt: "Apr 17, 2026",
//   },
//   {
//     id: "2",
//     name: "TechCorp Inc.",
//     email: "hr@techcorp.com",
//     role: "Company",
//     status: "Active",
//     verified: true,
//     joinedAt: "Apr 16, 2026",
//     plan: "Pro",
//   },
//   {
//     id: "3",
//     name: "Ahmed Nour",
//     email: "ahmed@example.com",
//     role: "Applicant",
//     status: "Pending",
//     verified: false,
//     joinedAt: "Apr 15, 2026",
//   },
//   {
//     id: "4",
//     name: "InnovateLabs",
//     email: "jobs@innov.io",
//     role: "Company",
//     status: "Active",
//     verified: true,
//     joinedAt: "Apr 14, 2026",
//     plan: "Free",
//   },
//   {
//     id: "5",
//     name: "Mona Hassan",
//     email: "mona@example.com",
//     role: "Applicant",
//     status: "Suspended",
//     verified: true,
//     joinedAt: "Apr 13, 2026",
//   },
//   {
//     id: "6",
//     name: "CloudBase",
//     email: "team@cloudbase.com",
//     role: "Company",
//     status: "Active",
//     verified: true,
//     joinedAt: "Apr 12, 2026",
//     plan: "Enterprise",
//   },
//   {
//     id: "7",
//     name: "Omar Fathy",
//     email: "omar@example.com",
//     role: "Applicant",
//     status: "Active",
//     verified: true,
//     joinedAt: "Apr 11, 2026",
//   },
//   {
//     id: "8",
//     name: "MediaGroup",
//     email: "hr@media.com",
//     role: "Company",
//     status: "Pending",
//     verified: false,
//     joinedAt: "Apr 10, 2026",
//     plan: "Free",
//   },
// ];

const STATUS_COLOR: Record<string, "green" | "amber" | "red"> = {
  Online: "green",
  Offline: "amber",
  Suspended: "red",
};

function mapUsers(apiUsers: any[]): User[] {
  return apiUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,

    status: u.status,

    verified: u.isEmailVerified,

    joinedAt: new Date(u.createAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),

    plan: u.role === "Company" ? "Free" : undefined, // مؤقت لحد ما API يبقى فيه plans
  }));
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 6;

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);

      const res = await getAllUsers(page, PAGE_SIZE);

      const data = res.data.data;

      setUsers(mapUsers(data.users));
      setStats(data.status);
      setTotal(data.pagination.total);

      setLoading(false);
    }

    loadUsers();
  }, [page, search, roleFilter, statusFilter]);

  async function handleBan(userId: string) {
    await banUser(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "Suspended" } : u)),
    );
  }
  async function handleUnban(userId: string) {
    await unbanUser(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "Active" } : u)),
    );
  }

  const COLS: Column<User>[] = [
    {
      key: "name",
      label: "User",
      render: (r) => <UserCell name={r.name} sub={r.email} />,
    },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <Badge
          label={r.role}
          color={r.role === "Company" ? "cyan" : "indigo"}
        />
      ),
    },
    {
      key: "plan",
      label: "Plan",
      render: (r) =>
        r.plan ? (
          <Badge
            label={r.plan}
            color={
              r.plan === "Pro"
                ? "indigo"
                : r.plan === "Enterprise"
                  ? "cyan"
                  : "gray"
            }
            dot={false}
          />
        ) : (
          <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>—</span>
        ),
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
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
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
      width: "140px",
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn">
            <Eye size={12} /> View
          </button>
          {r.status !== "Suspended" ? (
            <button
              onClick={() => handleBan(r.id)}
              className="adm-row-btn adm-row-btn--danger"
            >
              <Ban size={12} /> Ban
            </button>
          ) : (
            <button
              onClick={() => handleUnban(r.id)}
              className="adm-row-btn adm-row-btn--success"
            >
              <CheckCircle size={12} /> Unban
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Users" breadcrumb="Users">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Users", value: stats.totalUser, color: "indigo" },
          {
            label: "Applicants",
            value: stats.applicants,
            color: "indigo",
          },
          {
            label: "Companies",
            value: stats.companys,
            color: "cyan",
          },
          {
            label: "Suspended",
            value: stats.ban,
            color: "red",
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
        <AdminTable<User>
          title="All Users"
          columns={COLS}
          data={users}
          loading={loading}
          emptyTitle="No users found"
          emptyIcon={<Users size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
          searchSlot={
            <div className="d-flex align-items-center gap-2">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search users…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <select
                className="adm-select"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Roles</option>
                <option value="Applicant">Applicant</option>
                <option value="Company">Company</option>
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
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          }
        />
      </div>
    </AdminLayout>
  );
}
