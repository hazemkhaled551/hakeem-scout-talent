import { useState, useMemo, useEffect } from "react";
import {
  Package,
  Search,
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
  Users,
  Zap,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";
import {
  getPlans,
  createPlan,
} from "../../services/AdminDashboard/plansService";
import { getFeatures } from "../../services/AdminDashboard/featurePlanService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiPermission {
  id: string;
  name: string;
  description: string;
  method: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiFeaturePermission {
  id: string;
  createdAt: string;
  permission: ApiPermission;
}

interface ApiFeature {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  featurePermissions: ApiFeaturePermission[];
}

interface ApiPlan {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  durationInDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiStats {
  totalPlans: number;
  activePlans: number;
  totalSubscribers: number;
  enterpriseSubscribers: number;
}

// Permission with limit (local state for modal)
interface PermissionWithLimit {
  permissionId: string;
  permissionName: string;
  permissionDescription: string;
  enabled: boolean;
  limit: number | "unlimited";
}

interface FeatureWithPermissions {
  featureId: string;
  featureName: string;
  expanded: boolean;
  permissions: PermissionWithLimit[];
}

// ─── Modal form state ─────────────────────────────────────────────────────────

interface ModalForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  durationInDays: number;
  isDefault: boolean;
  isAutoRenew: boolean;
  features: FeatureWithPermissions[];
}

const emptyForm = (apiFeatures: ApiFeature[]): ModalForm => ({
  name: "",
  description: "",
  price: "",
  currency: "EGP",
  durationInDays: 30,
  isDefault: false,
  isAutoRenew: false,
  features: apiFeatures.map((f) => ({
    featureId: f.id,
    featureName: f.name,
    expanded: false,
    permissions: f.featurePermissions.map((fp) => ({
      permissionId: fp.permission.id,
      permissionName: fp.permission.name,
      permissionDescription: fp.permission.description,
      enabled: false,
      limit: 10,
    })),
  })),
});

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, "green" | "amber" | "gray"> = {
  true: "green",
  false: "amber",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPlans() {
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [apiFeatures, setApiFeatures] = useState<ApiFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ModalForm>(emptyForm([]));
  const [saving, setSaving] = useState(false);

  // ── Fetch plans & features ──────────────────────────────────────────────────

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPlans(); // adjust base URL as needed

      setPlans(res.data.data.plans);
      setStats(res.data.data.stats);
    } catch {
      setError("Network error — could not load plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async () => {
    try {
      const res = await getFeatures(); // adjust base URL as needed
      setApiFeatures(res.data.data);
    } catch (e: any) {
      // silently fail — features will just be empty
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchFeatures();
  }, []);

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q)) &&
        (!statusFilter ||
          (statusFilter === "Active" ? p.isActive : !p.isActive)),
    );
  }, [plans, search, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm(apiFeatures));
    setModalOpen(true);
  };

  const openEdit = (plan: ApiPlan) => {
    setEditId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      price: plan.price,
      currency: plan.currency,
      durationInDays: plan.durationInDays,
      isDefault: false,
      isAutoRenew: false,
      features: apiFeatures.map((f) => ({
        featureId: f.id,
        featureName: f.name,
        expanded: false,
        permissions: f.featurePermissions.map((fp) => ({
          permissionId: fp.permission.id,
          permissionName: fp.permission.name,
          permissionDescription: fp.permission.description,
          enabled: false,
          limit: 10,
        })),
      })),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const toggleFeatureExpanded = (featureId: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.featureId === featureId ? { ...f, expanded: !f.expanded } : f,
      ),
    }));
  };

  const updatePermissionEnabled = (
    featureId: string,
    permId: string,
    enabled: boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.featureId === featureId
          ? {
              ...f,
              permissions: f.permissions.map((p) =>
                p.permissionId === permId ? { ...p, enabled } : p,
              ),
            }
          : f,
      ),
    }));
  };

  const updatePermissionLimit = (
    featureId: string,
    permId: string,
    limit: number | "unlimited",
  ) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.featureId === featureId
          ? {
              ...f,
              permissions: f.permissions.map((p) =>
                p.permissionId === permId ? { ...p, limit } : p,
              ),
            }
          : f,
      ),
    }));
  };

  const buildPayload = () => {
    const permissions: string[] = [];
    form.features.forEach((f) => {
      f.permissions.forEach((p) => {
        if (p.enabled) permissions.push(p.permissionId);
      });
    });

    return {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      currency: form.currency,
      durationInDays: form.durationInDays,
      isDefault: form.isDefault,
      isAutoRenew: form.isAutoRenew,
      permissions,
    };
  };

  const saveForm = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      await createPlan(payload);
      await fetchPlans();
    } catch (e: any) {
      console.log(e);
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await fetch(`/api/plans/${id}`, { method: "DELETE" });
      await fetchPlans();
    } catch {
      alert("Delete failed");
    }
  };

  // ── Table columns ───────────────────────────────────────────────────────────

  const COLS: Column<ApiPlan>[] = [
    {
      key: "name",
      label: "Plan Name",
      render: (r) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
              fontSize: ".85rem",
            }}
          >
            <Package size={13} color="var(--primary)" />
            {r.name}
          </div>
          {r.description && (
            <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
              {r.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (r) => (
        <span
          style={{ fontFamily: "Syne", fontWeight: 700, fontSize: ".85rem" }}
        >
          {parseFloat(r.price).toLocaleString()} {r.currency}
        </span>
      ),
    },
    {
      key: "durationInDays",
      label: "Duration",
      render: (r) => (
        <span style={{ fontSize: ".82rem" }}>{r.durationInDays} days</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge
          label={r.isActive ? "Active" : "Inactive"}
          color={STATUS_COLOR[String(r.isActive)]}
        />
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (r) => (
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          {new Date(r.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
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
          <button
            className="adm-row-btn adm-row-btn--danger"
            onClick={() => deletePlan(r.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  // ── Loading / Error states ──────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminLayout title="Plans" breadcrumb="Plans">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            gap: 10,
            color: "var(--muted)",
          }}
        >
          <Loader2 size={20} className="spin" />
          <span>Loading plans…</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Plans" breadcrumb="Plans">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            gap: 10,
            color: "var(--danger, #ef4444)",
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            className="adm-btn adm-btn--outline adm-btn--sm"
            onClick={fetchPlans}
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Plans" breadcrumb="Plans">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Plans",
            value: stats?.totalPlans ?? plans.length,
            icon: <Package size={16} />,
            color: "indigo" as const,
            hint: "",
          },
          {
            label: "Active Plans",
            value: stats?.activePlans ?? plans.filter((p) => p.isActive).length,
            icon: <CheckCircle size={16} />,
            color: "green" as const,
            hint: "",
          },
          {
            label: "Total Subscribers",
            value: stats?.totalSubscribers ?? 0,
            icon: <Users size={16} />,
            color: "cyan" as const,
            hint: "",
          },
          {
            label: "Enterprise Clients",
            value: stats?.enterpriseSubscribers ?? 0,
            icon: <Zap size={16} />,
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
        <AdminTable<ApiPlan>
          title="All Plans"
          columns={COLS}
          data={paged}
          emptyTitle="No plans found"
          emptyIcon={<Package size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          actions={
            <button
              className="adm-btn adm-btn--primary adm-btn--sm"
              onClick={openCreate}
            >
              <Plus size={13} /> New Plan
            </button>
          }
          searchSlot={
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search plans…"
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

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,14,26,0.55)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 700,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 80px rgba(15,14,26,0.2)",
              animation: "adm-scaleIn .22s ease",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
                borderRadius: "20px 20px 0 0",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, var(--primary), var(--accent))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Package size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: "var(--text)",
                  }}
                >
                  {editId ? "Edit Plan" : "New Plan"}
                </div>
                <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
                  {editId
                    ? "Update plan details and permissions"
                    : "Define details and permissions for the new plan"}
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1.5px solid var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted)",
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Basic info */}
              <div>
                <SectionLabel>Basic info</SectionLabel>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <FormField label="Plan name *">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      placeholder="e.g. Pro Plan"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </FormField>

                  <FormField label="Currency">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      placeholder="e.g. EGP"
                      value={form.currency}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          currency: e.target.value,
                        }))
                      }
                    />
                  </FormField>

                  <FormField label="Price *">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      type="number"
                      min={0}
                      placeholder="e.g. 300"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                  </FormField>

                  <FormField label="Duration (days)">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      type="number"
                      min={1}
                      placeholder="e.g. 30"
                      value={form.durationInDays}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          durationInDays: Number(e.target.value),
                        }))
                      }
                    />
                  </FormField>

                  <FormField label="Description">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      placeholder="Optional description"
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </FormField>
                </div>

                {/* Toggles */}
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 12,
                  }}
                >
                  {(
                    [
                      { key: "isDefault", label: "Default Plan" },
                      { key: "isAutoRenew", label: "Auto Renew" },
                    ] as { key: keyof ModalForm; label: string }[]
                  ).map(({ key, label }) => (
                    <label
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        fontSize: ".82rem",
                        fontWeight: 600,
                        color: "var(--text)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form[key] as boolean}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        style={{
                          accentColor: "var(--primary)",
                          cursor: "pointer",
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Features & Permissions */}
              <div>
                <SectionLabel>Features & Permissions</SectionLabel>
                {form.features.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      color: "var(--muted)",
                      fontSize: ".82rem",
                      border: "1.5px dashed var(--border)",
                      borderRadius: 12,
                    }}
                  >
                    No features available
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {form.features.map((feat) => {
                      const enabledCount = feat.permissions.filter(
                        (p) => p.enabled,
                      ).length;
                      return (
                        <div
                          key={feat.featureId}
                          style={{
                            border: `1.5px solid ${enabledCount > 0 ? "rgba(79,70,229,0.2)" : "var(--border)"}`,
                            borderRadius: 12,
                            overflow: "hidden",
                            background:
                              enabledCount > 0
                                ? "rgba(79,70,229,0.02)"
                                : "var(--surface)",
                            transition: "all .15s",
                          }}
                        >
                          {/* Feature header */}
                          <button
                            onClick={() =>
                              toggleFeatureExpanded(feat.featureId)
                            }
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: ".84rem",
                                color:
                                  enabledCount > 0
                                    ? "var(--primary)"
                                    : "var(--text)",
                                flex: 1,
                                textTransform: "capitalize",
                              }}
                            >
                              {feat.featureName}
                            </span>
                            {enabledCount > 0 && (
                              <span
                                style={{
                                  fontSize: ".72rem",
                                  background: "rgba(79,70,229,0.1)",
                                  color: "var(--primary)",
                                  borderRadius: 20,
                                  padding: "2px 8px",
                                  fontWeight: 700,
                                }}
                              >
                                {enabledCount} enabled
                              </span>
                            )}
                            {feat.expanded ? (
                              <ChevronUp size={14} color="var(--muted)" />
                            ) : (
                              <ChevronDown size={14} color="var(--muted)" />
                            )}
                          </button>

                          {/* Permissions list */}
                          {feat.expanded && (
                            <div
                              style={{
                                borderTop: "1px solid var(--border)",
                                padding: "8px 14px 12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {feat.permissions.map((perm) => (
                                <div
                                  key={perm.permissionId}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12,
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    background: perm.enabled
                                      ? "rgba(79,70,229,0.04)"
                                      : "#fff",
                                    border: `1px solid ${perm.enabled ? "rgba(79,70,229,0.12)" : "var(--border)"}`,
                                    transition: "all .12s",
                                  }}
                                >
                                  {/* Enable checkbox */}
                                  <label
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 8,
                                      cursor: "pointer",
                                      flex: 1,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={perm.enabled}
                                      onChange={(e) =>
                                        updatePermissionEnabled(
                                          feat.featureId,
                                          perm.permissionId,
                                          e.target.checked,
                                        )
                                      }
                                      style={{
                                        accentColor: "var(--primary)",
                                        cursor: "pointer",
                                        marginTop: 2,
                                      }}
                                    />
                                    <div>
                                      <div
                                        style={{
                                          fontWeight: 600,
                                          fontSize: ".78rem",
                                          color: perm.enabled
                                            ? "var(--text)"
                                            : "var(--muted)",
                                          fontFamily: "monospace",
                                        }}
                                      >
                                        {perm.permissionName}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: ".72rem",
                                          color: "var(--muted)",
                                          marginTop: 1,
                                        }}
                                      >
                                        {perm.permissionDescription}
                                      </div>
                                    </div>
                                  </label>

                                  {/* Limit controls */}
                                  {perm.enabled && (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <label
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 4,
                                          cursor: "pointer",
                                          fontSize: ".72rem",
                                          color: "var(--muted)",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={perm.limit === "unlimited"}
                                          onChange={(e) =>
                                            updatePermissionLimit(
                                              feat.featureId,
                                              perm.permissionId,
                                              e.target.checked
                                                ? "unlimited"
                                                : 10,
                                            )
                                          }
                                          style={{
                                            accentColor: "var(--accent)",
                                            cursor: "pointer",
                                          }}
                                        />
                                        Unlimited
                                      </label>

                                      <input
                                        type="number"
                                        min={0}
                                        disabled={perm.limit === "unlimited"}
                                        value={
                                          perm.limit === "unlimited"
                                            ? ""
                                            : perm.limit
                                        }
                                        onChange={(e) =>
                                          updatePermissionLimit(
                                            feat.featureId,
                                            perm.permissionId,
                                            Number(e.target.value),
                                          )
                                        }
                                        placeholder="Limit"
                                        style={{
                                          width: 72,
                                          padding: "4px 8px",
                                          borderRadius: 8,
                                          border: "1.5px solid var(--border)",
                                          fontFamily: "DM Sans",
                                          fontSize: ".8rem",
                                          color: "var(--text)",
                                          background:
                                            perm.limit === "unlimited"
                                              ? "var(--surface)"
                                              : "#fff",
                                          opacity:
                                            perm.limit === "unlimited"
                                              ? 0.5
                                              : 1,
                                          textAlign: "center",
                                          outline: "none",
                                        }}
                                      />

                                      <div
                                        className="adm-badge adm-badge--indigo"
                                        style={{ fontSize: ".68rem" }}
                                      >
                                        {perm.limit === "unlimited"
                                          ? "∞"
                                          : perm.limit}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                position: "sticky",
                bottom: 0,
                background: "#fff",
                borderRadius: "0 0 20px 20px",
              }}
            >
              <button
                className="adm-btn adm-btn--outline adm-btn--sm"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={saveForm}
                disabled={!form.name || !form.price || saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={12} className="spin" /> Saving…
                  </>
                ) : editId ? (
                  "Save changes"
                ) : (
                  "Create plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "Syne",
        fontWeight: 700,
        fontSize: ".74rem",
        color: "var(--muted)",
        textTransform: "uppercase",
        letterSpacing: ".06em",
        paddingBottom: 8,
        borderBottom: "1px solid var(--border)",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          fontSize: ".74rem",
          fontWeight: 600,
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
