import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Edit2,
  Trash2,
  Plus,
  Lock,
  Users,
  Key,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";

interface Permission {
  key: string;
  label: string;
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  adminCount: number;
  status: "Active" | "Inactive";
  createdAt: string;
  isSystem: boolean;
}

const ALL_PERMISSIONS: Permission[] = [
  { key: "manage_users", label: "Manage Users" },
  { key: "manage_admins", label: "Manage Admins" },
  { key: "manage_roles", label: "Manage Roles" },
  { key: "manage_plans", label: "Manage Plans" },
  { key: "manage_subscriptions", label: "Manage Subscriptions" },
  { key: "manage_jobs", label: "Manage Jobs" },
  { key: "manage_companies", label: "Manage Companies" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "manage_settings", label: "Manage Settings" },
  { key: "send_notifications", label: "Send Notifications" },
  { key: "export_data", label: "Export Data" },
  { key: "view_only", label: "View Only" },
];

const DUMMY: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    slug: "super-admin",
    description: "Full access to all system features and settings.",
    permissions: ALL_PERMISSIONS.map((p) => p.key),
    adminCount: 1,
    status: "Active",
    createdAt: "Jan 1, 2026",
    isSystem: true,
  },
  {
    id: "2",
    name: "Admin",
    slug: "admin",
    description:
      "Manage most platform features except roles and system settings.",
    permissions: [
      "manage_users",
      "manage_jobs",
      "manage_companies",
      "manage_subscriptions",
      "view_analytics",
      "export_data",
    ],
    adminCount: 2,
    status: "Active",
    createdAt: "Jan 1, 2026",
    isSystem: true,
  },
  {
    id: "3",
    name: "Moderator",
    slug: "moderator",
    description: "Review and moderate job listings and user content.",
    permissions: ["manage_jobs", "manage_companies", "view_analytics"],
    adminCount: 2,
    status: "Active",
    createdAt: "Jan 1, 2026",
    isSystem: true,
  },
  {
    id: "4",
    name: "Support",
    slug: "support",
    description: "Handle user inquiries and basic account management.",
    permissions: ["manage_users", "view_only", "send_notifications"],
    adminCount: 1,
    status: "Active",
    createdAt: "Feb 1, 2026",
    isSystem: true,
  },
  {
    id: "5",
    name: "Finance",
    slug: "finance",
    description: "Access billing, plans, and subscription management.",
    permissions: [
      "manage_plans",
      "manage_subscriptions",
      "view_analytics",
      "export_data",
    ],
    adminCount: 0,
    status: "Inactive",
    createdAt: "Mar 10, 2026",
    isSystem: false,
  },
];

const STATUS_COLOR: Record<string, "green" | "red"> = {
  Active: "green",
  Inactive: "red",
};

export default function AdminRoles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>(DUMMY);
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const PAGE_SIZE = 6;

  const filtered = useMemo(
    () =>
      roles.filter((r) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            r.name.toLowerCase().includes(q) ||
            r.slug.toLowerCase().includes(q)) &&
          (!statusFilter || r.status === statusFilter)
        );
      }),
    [search, statusFilter, roles],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => {
    setEditRole(null);
    setForm({ name: "", description: "", permissions: [] });
    setShowModal(true);
  };

  const openEdit = (role: Role) => {
    setEditRole(role);
    setForm({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowModal(true);
  };

  const togglePerm = (key: string) => {
    setForm((p) => ({
      ...p,
      permissions: p.permissions.includes(key)
        ? p.permissions.filter((k) => k !== key)
        : [...p.permissions, key],
    }));
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editRole) {
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editRole.id
            ? {
                ...r,
                name: form.name,
                description: form.description,
                permissions: form.permissions,
              }
            : r,
        ),
      );
    } else {
      const slug = form.name.toLowerCase().replace(/\s+/g, "-");
      setRoles((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          name: form.name,
          slug,
          description: form.description,
          permissions: form.permissions,
          adminCount: 0,
          status: "Active",
          createdAt: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          isSystem: false,
        },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const COLS: Column<Role>[] = [
    {
      key: "name",
      label: "Role",
      render: (r) => (
        <div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontWeight: 600, fontSize: ".85rem" }}>
              {r.name}
            </span>
            {r.isSystem && (
              <span
                style={{
                  fontSize: ".65rem",
                  background: "rgba(99,102,241,.15)",
                  color: "#818cf8",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                SYSTEM
              </span>
            )}
          </div>
          <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
            /{r.slug}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (r) => (
        <span
          style={{
            fontSize: ".8rem",
            color: "var(--muted)",
            maxWidth: 220,
            display: "block",
          }}
        >
          {r.description}
        </span>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (r) => (
        <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
          <span style={{ color: "var(--text)", fontWeight: 600 }}>
            {r.permissions.length}
          </span>
          <span> / {ALL_PERMISSIONS.length} permissions</span>
        </div>
      ),
    },
    {
      key: "adminCount",
      label: "Admins",
      render: (r) => (
        <span style={{ fontWeight: 600, fontSize: ".85rem" }}>
          {r.adminCount}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (r) => (
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
          {r.createdAt}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "100px",
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn" onClick={() => openEdit(r)}>
            <Edit2 size={12} />
          </button>
          {!r.isSystem && (
            <button
              className="adm-row-btn adm-row-btn--danger"
              onClick={() => handleDelete(r.id)}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Admin Roles" breadcrumb="Roles">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Roles",
            value: roles.length,
            icon: <ShieldCheck size={16} />,
            color: "indigo" as const,
            hint: "",
          },
          {
            label: "Active Roles",
            value: roles.filter((r) => r.status === "Active").length,
            icon: <Key size={16} />,
            color: "green" as const,
            hint: "",
          },
          {
            label: "System Roles",
            value: roles.filter((r) => r.isSystem).length,
            icon: <Lock size={16} />,
            color: "cyan" as const,
            hint: "",
          },
          {
            label: "Permissions",
            value: ALL_PERMISSIONS.length,
            icon: <Users size={16} />,
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
        <AdminTable<Role>
          title="All Roles"
          columns={COLS}
          data={paged}
          emptyTitle="No roles found"
          emptyIcon={<ShieldCheck size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          actions={
            <button
              className="adm-btn adm-btn--primary adm-btn--sm"
              onClick={openAdd}
            >
              <Plus size={13} /> New Role
            </button>
          }
          searchSlot={
            <div className="d-flex align-items-center gap-2">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search roles…"
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          }
        />
      </div>

      {/* Add / Edit Role Modal */}
      {showModal && (
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
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "28px 24px",
              width: 480,
              maxHeight: "85vh",
              overflowY: "auto",
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
              {editRole ? "Edit Role" : "New Role"}
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Role Name
                </label>
                <input
                  className="adm-search"
                  style={{ width: "100%", padding: "8px 12px" }}
                  placeholder="e.g. Content Manager"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
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
                  Description
                </label>
                <input
                  className="adm-search"
                  style={{ width: "100%", padding: "8px 12px" }}
                  placeholder="Brief description of this role…"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              {/* Permissions Grid */}
              <div>
                <label
                  style={{
                    fontSize: ".78rem",
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 10,
                  }}
                >
                  Permissions ({form.permissions.length} selected)
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {ALL_PERMISSIONS.map((perm) => {
                    const checked = form.permissions.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 10px",
                          borderRadius: 7,
                          border: `1px solid ${checked ? "rgba(99,102,241,.5)" : "var(--border)"}`,
                          background: checked
                            ? "rgba(99,102,241,.08)"
                            : "transparent",
                          cursor: "pointer",
                          fontSize: ".78rem",
                          fontWeight: checked ? 600 : 400,
                          transition: "all .15s",
                        }}
                      >
                        <input
                          type="checkbox"
                          style={{
                            accentColor: "#6366f1",
                            width: 13,
                            height: 13,
                          }}
                          checked={checked}
                          onChange={() => togglePerm(perm.key)}
                        />
                        {perm.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div
                className="d-flex gap-2 justify-content-end"
                style={{ marginTop: 4 }}
              >
                <button
                  className="adm-btn adm-btn--sm"
                  style={{ background: "var(--border)", color: "var(--text)" }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="adm-btn adm-btn--primary adm-btn--sm"
                  onClick={handleSave}
                >
                  {editRole ? (
                    "Save Changes"
                  ) : (
                    <>
                      <Plus size={13} /> Create Role
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
