import { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Edit2,
  Trash2,
  Plus,
  X,
  Lock,
  LayoutGrid,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";
import Modal from "../../components/Modal/Modal";
import {
  getFeatures,
  createFeature,
  getPermissions,
} from "../../services/AdminDashboard/featurePlanService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Permission {
  id: string;
  name: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  createdAt: string;
  updatedAt: string;
}

interface FeaturePermission {
  id: string;
  createdAt: string;
  permission: Permission;
}

interface Feature {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  featurePermissions: FeaturePermission[];
}

// ─── Create / Edit payload ────────────────────────────────────────────────────

interface FeaturePayload {
  name: string;
  description: string;
  permissionsId: string[];
}

// ─── Dummy permissions pool ───────────────────────────────────────────────────

// const ALL_PERMISSIONS: Permission[] = [
//   {
//     id: "963a3450-52f6-4ee3-a454-e03bd66b7839",
//     name: "candidate:reject_cv",
//     description: "Company rejects a candidate application",
//     method: "POST",
//     createdAt: "2026-05-08T07:51:08.817Z",
//     updatedAt: "2026-05-08T07:51:08.817Z",
//   },
//   {
//     id: "d8e01e9f-b280-4792-8ecd-34fe88ef6ea5",
//     name: "candidate:hire_cv",
//     description: "Company marks a candidate application as hired",
//     method: "POST",
//     createdAt: "2026-05-08T07:51:09.069Z",
//     updatedAt: "2026-05-08T07:51:09.069Z",
//   },
//   {
//     id: "00c2ea35-4951-4927-97fc-8b33b0bf0863",
//     name: "candidate:interview_cv",
//     description: "Company schedules an interview for a candidate application",
//     method: "POST",
//     createdAt: "2026-05-08T07:51:09.318Z",
//     updatedAt: "2026-05-08T07:51:09.318Z",
//   },
//   {
//     id: "11aa1234-0000-0000-0000-aaaaaaaaaaaa",
//     name: "job:create_post",
//     description: "Company creates a new job posting",
//     method: "POST",
//     createdAt: "2026-05-08T07:51:10.000Z",
//     updatedAt: "2026-05-08T07:51:10.000Z",
//   },
//   {
//     id: "22bb5678-0000-0000-0000-bbbbbbbbbbbb",
//     name: "job:delete_post",
//     description: "Company deletes an existing job posting",
//     method: "DELETE",
//     createdAt: "2026-05-08T07:51:11.000Z",
//     updatedAt: "2026-05-08T07:51:11.000Z",
//   },
//   {
//     id: "33cc9012-0000-0000-0000-cccccccccccc",
//     name: "candidate:view_profile",
//     description: "Company views a candidate's full profile",
//     method: "GET",
//     createdAt: "2026-05-08T07:51:12.000Z",
//     updatedAt: "2026-05-08T07:51:12.000Z",
//   },
//   {
//     id: "44dd3456-0000-0000-0000-dddddddddddd",
//     name: "analytics:export_report",
//     description: "User exports analytics data as a report",
//     method: "GET",
//     createdAt: "2026-05-08T07:51:13.000Z",
//     updatedAt: "2026-05-08T07:51:13.000Z",
//   },
//   {
//     id: "55ee7890-0000-0000-0000-eeeeeeeeeeee",
//     name: "team:invite_member",
//     description: "Admin invites a new team member",
//     method: "POST",
//     createdAt: "2026-05-08T07:51:14.000Z",
//     updatedAt: "2026-05-08T07:51:14.000Z",
//   },
// ];

// ─── Dummy features data (mirrors API response shape) ─────────────────────────

// const DUMMY_FEATURES: Feature[] = [
//   {
//     id: "ac4c8bb6-d806-4073-add0-be8608cf7402",
//     name: "cv",
//     description: "CV management and application handling",
//     createdAt: "2026-05-08T08:29:55.364Z",
//     updatedAt: "2026-05-08T08:29:55.364Z",
//     featurePermissions: [
//       {
//         id: "c933ef98-f43b-477f-ad4c-e44ded1fb1ee",
//         createdAt: "2026-05-08T08:29:55.674Z",
//         permission: ALL_PERMISSIONS[0],
//       },
//       {
//         id: "d0c984ea-bc9a-4905-8150-0e81eceadba7",
//         createdAt: "2026-05-08T08:29:55.674Z",
//         permission: ALL_PERMISSIONS[1],
//       },
//       {
//         id: "a3f03de1-44c0-4baa-8b5b-555385118ca9",
//         createdAt: "2026-05-08T08:29:55.674Z",
//         permission: ALL_PERMISSIONS[2],
//       },
//     ],
//   },
//   {
//     id: "bb112233-aaaa-bbbb-cccc-001122334455",
//     name: "job_posts",
//     description: "Job posting creation and management",
//     createdAt: "2026-05-08T09:00:00.000Z",
//     updatedAt: "2026-05-08T09:00:00.000Z",
//     featurePermissions: [
//       {
//         id: "fp-001",
//         createdAt: "2026-05-08T09:00:01.000Z",
//         permission: ALL_PERMISSIONS[3],
//       },
//       {
//         id: "fp-002",
//         createdAt: "2026-05-08T09:00:01.000Z",
//         permission: ALL_PERMISSIONS[4],
//       },
//     ],
//   },
//   {
//     id: "cc223344-bbbb-cccc-dddd-112233445566",
//     name: "candidate_view",
//     description: "Access to view full candidate profiles",
//     createdAt: "2026-05-08T09:30:00.000Z",
//     updatedAt: "2026-05-08T09:30:00.000Z",
//     featurePermissions: [
//       {
//         id: "fp-003",
//         createdAt: "2026-05-08T09:30:01.000Z",
//         permission: ALL_PERMISSIONS[5],
//       },
//     ],
//   },
//   {
//     id: "dd334455-cccc-dddd-eeee-223344556677",
//     name: "analytics",
//     description: null,
//     createdAt: "2026-05-08T10:00:00.000Z",
//     updatedAt: "2026-05-08T10:00:00.000Z",
//     featurePermissions: [
//       {
//         id: "fp-004",
//         createdAt: "2026-05-08T10:00:01.000Z",
//         permission: ALL_PERMISSIONS[6],
//       },
//     ],
//   },
//   {
//     id: "ee445566-dddd-eeee-ffff-334455667788",
//     name: "team_management",
//     description: "Invite and manage team members",
//     createdAt: "2026-05-08T10:30:00.000Z",
//     updatedAt: "2026-05-08T10:30:00.000Z",
//     featurePermissions: [
//       {
//         id: "fp-005",
//         createdAt: "2026-05-08T10:30:01.000Z",
//         permission: ALL_PERMISSIONS[7],
//       },
//     ],
//   },
// ];

// ─── HTTP method badge color ───────────────────────────────────────────────────

const METHOD_COLOR: Record<
  string,
  "green" | "indigo" | "cyan" | "amber" | "gray"
> = {
  GET: "green",
  POST: "indigo",
  PUT: "cyan",
  PATCH: "amber",
  DELETE: "gray",
};

// ─── Modal form state ─────────────────────────────────────────────────────────

interface ModalForm {
  name: string;
  description: string;
  permissionsId: string[];
}

const emptyForm = (): ModalForm => ({
  name: "",
  description: "",
  permissionsId: [],
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminFeatures() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ModalForm>(emptyForm());
  const [permSearch, setPermSearch] = useState("");

  const fetchFeatures = async () => {
    try {
      const [featuresRes, permissionsRes] = await Promise.all([
        getFeatures(),
        getPermissions(),
      ]);

      setFeatures(featuresRes.data.data);
      setAvailablePermissions(permissionsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };
  useEffect(() => {
    async function fetchData() {
      await fetchFeatures();
    }
    fetchData();
  }, []);

  // ── Stats ───────────────────────────────────────────────────────────────────

  const totalPermissions = new Set(
    features?.flatMap((f) => f?.featurePermissions.map((fp) => fp.permission.id)),
  ).size;

  //   const featuresWithDesc = features.filter((f) => !!f.description).length;

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return features.filter(
      (f) =>
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.description ?? "").toLowerCase().includes(q),
    );
  }, [features, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Filtered permissions in modal ───────────────────────────────────────────

  const filteredPerms = useMemo(() => {
    const q = permSearch.toLowerCase();
    return availablePermissions.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [availablePermissions, permSearch]);

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setPermSearch("");
    setModalOpen(true);
  };

  const openEdit = (feature: Feature) => {
    setEditId(feature.id);
    setForm({
      name: feature.name,
      description: feature.description ?? "",
      permissionsId: feature.featurePermissions.map((fp) => fp.permission.id),
    });
    setPermSearch("");
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const togglePermission = (permId: string) => {
    setForm((prev) => ({
      ...prev,
      permissionsId: prev.permissionsId.includes(permId)
        ? prev.permissionsId.filter((id) => id !== permId)
        : [...prev.permissionsId, permId],
    }));
  };

  const saveForm = async () => {
    if (!form.name) return;

    if (editId) {
      setFeatures((prev) =>
        prev.map((f) => {
          if (f.id !== editId) return f;
          // Rebuild featurePermissions from selected IDs
          const newPerms: FeaturePermission[] = form.permissionsId.map(
            (pid) => {
              const existing = f.featurePermissions.find(
                (fp) => fp.permission.id === pid,
              );
              if (existing) return existing;
              const perm = availablePermissions.find((p) => p.id === pid)!;
              return {
                id: `fp-${Date.now()}-${pid}`,
                createdAt: new Date().toISOString(),
                permission: perm,
              };
            },
          );
          return {
            ...f,
            name: form.name,
            description: form.description || null,
            featurePermissions: newPerms,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    } else {
      try {
        const payload: FeaturePayload = {
          name: form.name,
          description: form.description,
          permissionsId: form.permissionsId,
        };

        const res = await createFeature(payload);

        setFeatures((prev) => [...prev, res.data]);

        closeModal();
      } catch (error) {
        console.error("Failed to create feature", error);
      }
    }
    closeModal();
  };

  const deleteFeature = (id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  // ── Format date ─────────────────────────────────────────────────────────────

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // ── Table columns ───────────────────────────────────────────────────────────

  const COLS: Column<Feature>[] = [
    {
      key: "name",
      label: "Feature Name",
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
            <ShieldCheck size={13} color="var(--primary)" />
            {r.name}
          </div>
          {r.description && (
            <div
              style={{
                fontSize: ".74rem",
                color: "var(--muted)",
                marginTop: 2,
                maxWidth: 220,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (r) => {
        const perms = r.featurePermissions;
        const shown = perms.slice(0, 2);
        const rest = perms.length - shown.length;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {shown.map((fp) => (
              <span
                key={fp.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: ".7rem",
                  fontWeight: 600,
                  background: "rgba(79,70,229,0.07)",
                  color: "var(--primary)",
                  border: "1px solid rgba(79,70,229,0.15)",
                  fontFamily: "monospace",
                }}
              >
                <Badge
                  label={fp.permission.method}
                  color={METHOD_COLOR[fp.permission.method] ?? "gray"}
                  dot={false}
                />
                {fp.permission.name.split(":")[1] ?? fp.permission.name}
              </span>
            ))}
            {rest > 0 && (
              <span
                style={{
                  fontSize: ".7rem",
                  color: "var(--accent)",
                  fontWeight: 700,
                  padding: "2px 4px",
                }}
              >
                +{rest} more
              </span>
            )}
            {perms.length === 0 && (
              <span style={{ fontSize: ".74rem", color: "var(--muted)" }}>
                No permissions
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "permCount",
      label: "Perm Count",
      render: (r) => (
        <span style={{ fontWeight: 600, fontSize: ".85rem" }}>
          {r.featurePermissions.length}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (r) => (
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          {fmtDate(r.createdAt)}
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
            onClick={() => deleteFeature(r.id)}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Platform Features" breadcrumb="Platform Features">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Features",
            value: features.length,
            icon: <LayoutGrid size={16} />,
            color: "indigo" as const,
            hint: "",
          },
          {
            label: "Total Permissions",
            value: totalPermissions,
            icon: <Lock size={16} />,
            color: "cyan" as const,
            hint: "",
          },
        ].map((s, i) => (
          <div key={i} className={`col-6  adm-au adm-d${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-au adm-d2">
        <AdminTable<Feature>
          title="All Platform Features"
          columns={COLS}
          data={paged}
          emptyTitle="No features found"
          emptyIcon={<ShieldCheck size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          actions={
            <button
              className="adm-btn adm-btn--primary adm-btn--sm"
              onClick={openCreate}
            >
              <Plus size={13} /> New Feature
            </button>
          }
          searchSlot={
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search features…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          }
        />
      </div>

      {/* ── Modal ── */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        size="lg"
        title={editId ? "Edit Feature" : "New Feature"}
        icon={<ShieldCheck size={16} />}
        footer={
          <>
            <button
              className="adm-btn adm-btn--outline adm-btn--sm"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="adm-btn adm-btn--primary adm-btn--sm"
              onClick={saveForm}
              disabled={!form.name}
            >
              {editId ? "Save changes" : "Create feature"}
            </button>
          </>
        }
      >
        <div
          style={{
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
              <FormField label="Feature name">
                <input
                  className="adm-search"
                  style={{ width: "100%", paddingLeft: ".9rem" }}
                  placeholder="e.g. cv"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Description">
                <input
                  className="adm-search"
                  style={{ width: "100%", paddingLeft: ".9rem" }}
                  placeholder="Short description…"
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
          </div>

          {/* Permissions */}
          <div>
            <SectionLabel>
              Permissions
              {form.permissionsId.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "var(--primary)",
                    color: "#fff",
                    borderRadius: 20,
                    padding: "1px 8px",
                    fontSize: ".68rem",
                    fontWeight: 700,
                    letterSpacing: 0,
                    textTransform: "none",
                  }}
                >
                  {form.permissionsId.length} selected
                </span>
              )}
            </SectionLabel>

            {/* Permission search */}
            {/* <div
              className="adm-search-wrap"
              style={{ marginBottom: 10, width: "100%" }}
            >
              <Search size={13} className="adm-search-icon" />
              <input
                className="adm-search"
                style={{ width: "100%" }}
                placeholder="Search permissions…"
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
              />
            </div> */}

            {/* Permission list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 300,
                overflowY: "auto",
                paddingRight: 2,
              }}
            >
              {filteredPerms.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    fontSize: ".8rem",
                    padding: "1rem",
                  }}
                >
                  No permissions found
                </div>
              )}
              {filteredPerms.map((perm) => {
                const selected = form.permissionsId.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => togglePermission(perm.id)}
                    style={{
                      background: selected
                        ? "rgba(79,70,229,0.05)"
                        : "var(--surface)",
                      border: `1.5px solid ${selected ? "rgba(79,70,229,0.25)" : "var(--border)"}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => togglePermission(perm.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        accentColor: "var(--primary)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    />

                    {/* Method badge */}
                    <Badge
                      label={perm.method}
                      color={METHOD_COLOR[perm.method] ?? "gray"}
                      dot={false}
                    />

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: ".8rem",
                          color: selected ? "var(--primary)" : "var(--text)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {perm.name}
                      </div>
                      <div
                        style={{
                          fontSize: ".72rem",
                          color: "var(--muted)",
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {perm.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected permissions summary */}
          {form.permissionsId.length > 0 && (
            <div>
              <SectionLabel>Selected permissions</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {form.permissionsId.map((pid) => {
                  const p = availablePermissions.find((p) => p.id === pid);
                  if (!p) return null;
                  return (
                    <span
                      key={pid}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontSize: ".74rem",
                        fontWeight: 600,
                        background: "rgba(79,70,229,0.07)",
                        color: "var(--primary)",
                        border: "1px solid rgba(79,70,229,0.2)",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.name}
                      <button
                        onClick={() => togglePermission(pid)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          color: "var(--muted)",
                        }}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
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
        display: "flex",
        alignItems: "center",
        gap: 6,
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
