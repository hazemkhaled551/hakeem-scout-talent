import { useState, useMemo } from "react";
import {
  Users,
  Search,
  Edit2,
  Trash2,
  Plus,
  UserCheck,
  ShieldCheck,
  UserX,
  Mail,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin" | "Moderator" | "Support";
  status: "Active" | "Inactive" | "Pending";
  lastLogin: string;
  joinedAt: string;
  avatar: string;
}

const DUMMY: Admin[] = [
  {
    id: "1",
    name: "Omar Khalil",
    email: "omar@admin.com",
    role: "Super Admin",
    status: "Active",
    lastLogin: "Today, 9:42 AM",
    joinedAt: "Jan 1, 2026",
    avatar: "OK",
  },
  {
    id: "2",
    name: "Sara Ahmed",
    email: "sara@admin.com",
    role: "Admin",
    status: "Active",
    lastLogin: "Today, 11:05 AM",
    joinedAt: "Jan 10, 2026",
    avatar: "SA",
  },
  {
    id: "3",
    name: "Youssef Nabil",
    email: "youssef@admin.com",
    role: "Moderator",
    status: "Active",
    lastLogin: "Yesterday",
    joinedAt: "Feb 3, 2026",
    avatar: "YN",
  },
  {
    id: "4",
    name: "Nour Hassan",
    email: "nour@admin.com",
    role: "Support",
    status: "Active",
    lastLogin: "Apr 20, 2026",
    joinedAt: "Mar 1, 2026",
    avatar: "NH",
  },
  {
    id: "5",
    name: "Karim Mostafa",
    email: "karim@admin.com",
    role: "Admin",
    status: "Inactive",
    lastLogin: "Mar 15, 2026",
    joinedAt: "Feb 15, 2026",
    avatar: "KM",
  },
  {
    id: "6",
    name: "Dina Farouk",
    email: "dina@admin.com",
    role: "Moderator",
    status: "Pending",
    lastLogin: "—",
    joinedAt: "Apr 24, 2026",
    avatar: "DF",
  },
];

const ROLE_COLOR: Record<string, "indigo" | "cyan" | "amber" | "gray"> = {
  "Super Admin": "cyan",
  Admin: "indigo",
  Moderator: "amber",
  Support: "gray",
};

const STATUS_COLOR: Record<string, "green" | "amber" | "red"> = {
  Active: "green",
  Pending: "amber",
  Inactive: "red",
};

const AVATAR_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#8b5cf6",
];

export default function AdminAdmins() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "Admin",
  });
  const [admins, setAdmins] = useState<Admin[]>(DUMMY);
  const PAGE_SIZE = 6;

  const filtered = useMemo(
    () =>
      admins.filter((a) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            a.name.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q)) &&
          (!roleFilter || a.role === roleFilter)
        );
      }),
    [search, roleFilter, admins],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) return;
    const initials = newAdmin.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const added: Admin = {
      id: String(Date.now()),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role as Admin["role"],
      status: "Pending",
      lastLogin: "—",
      joinedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      avatar: initials,
    };
    setAdmins((prev) => [added, ...prev]);
    setNewAdmin({ name: "", email: "", role: "Admin" });
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    setAdmins((prev) => prev.filter((a) => a.id !== id));
  };

  const COLS: Column<Admin>[] = [
    {
      key: "admin",
      label: "Admin",
      render: (r, i) => (
        <div className="d-flex align-items-center gap-2">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: ".7rem",
              fontWeight: 700,
              flexShrink: 0,
              fontFamily: "Syne",
            }}
          >
            {r.avatar}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: ".85rem" }}>{r.name}</div>
            <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
              {r.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r) => (
        <Badge label={r.role} color={ROLE_COLOR[r.role]} dot={false} />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (r) => (
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
          {r.lastLogin}
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
      width: "120px",
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn">
            <Edit2 size={12} />
          </button>
          <button className="adm-row-btn">
            <Mail size={12} />
          </button>
          <button
            className="adm-row-btn adm-row-btn--danger"
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Admins" breadcrumb="Admins">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Admins",
            value: admins.length,
            icon: <Users size={16} />,
            color: "indigo" as const,
            hint: "",
          },
          {
            label: "Active Admins",
            value: admins.filter((a) => a.status === "Active").length,
            icon: <UserCheck size={16} />,
            color: "green" as const,
            hint: "",
          },
          {
            label: "Super Admins",
            value: admins.filter((a) => a.role === "Super Admin").length,
            icon: <ShieldCheck size={16} />,
            color: "cyan" as const,
            hint: "",
          },
          {
            label: "Pending Invites",
            value: admins.filter((a) => a.status === "Pending").length,
            icon: <UserX size={16} />,
            color: "amber" as const,
            hint: "",
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-md-3 adm-au adm-d${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-au adm-d2">
        <AdminTable<Admin>
          title="All Admins"
          columns={COLS}
          data={paged}
          emptyTitle="No admins found"
          emptyIcon={<Users size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          actions={
            <button
              className="adm-btn adm-btn--primary adm-btn--sm"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={13} /> Add Admin
            </button>
          }
          searchSlot={
            <div className="d-flex align-items-center gap-2">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search admins…"
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
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="Support">Support</option>
              </select>
            </div>
          }
        />
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setShowAddModal(false)
          }
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "28px 24px",
              width: 380,
              boxShadow: "0 20px 60px rgba(0,0,0,.3)",
            }}
          >
            <h5
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                marginBottom: 20,
                fontSize: "1rem",
              }}
            >
              Add New Admin
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Full Name
                </label>
                <input
                  className="adm-search"
                  style={{ width: "100%", padding: "8px 12px" }}
                  placeholder="e.g. Sara Ahmed"
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Email Address
                </label>
                <input
                  className="adm-search"
                  style={{ width: "100%", padding: "8px 12px" }}
                  placeholder="admin@example.com"
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Role
                </label>
                <select
                  className="adm-select"
                  style={{ width: "100%" }}
                  value={newAdmin.role}
                  onChange={(e) =>
                    setNewAdmin((p) => ({ ...p, role: e.target.value }))
                  }
                >
                  <option value="Admin">Admin</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Support">Support</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div
                className="d-flex gap-2 justify-content-end"
                style={{ marginTop: 8 }}
              >
                <button
                  className="adm-btn adm-btn--sm"
                  style={{ background: "var(--border)", color: "var(--text)" }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="adm-btn adm-btn--primary adm-btn--sm"
                  onClick={handleAddAdmin}
                >
                  <Plus size={13} /> Add Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
