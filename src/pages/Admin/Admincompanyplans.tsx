import { useState, useMemo } from "react";
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
  Briefcase,
  UserCheck,
  // Infinity,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlanType = "candidate" | "company";
type BillingCycle = "Monthly" | "Annual" | "Custom";
type PlanStatus = "Active" | "Inactive" | "Draft";

interface FeatureLimit {
  key: string;
  label: string;
  value: number | "unlimited";
  enabled: boolean;
}

interface Plan {
  id: string;
  type: PlanType;
  name: string;
  slug: string;
  price: string;
  billing: BillingCycle;
  status: PlanStatus;
  subscribers: number;
  createdAt: string;
  features: FeatureLimit[];
}

// ─── Candidate feature definitions ───────────────────────────────────────────

const CANDIDATE_FEATURE_DEFS: Omit<FeatureLimit, "value" | "enabled">[] = [
  { key: "cv_uploads", label: "CV Uploads" },
  { key: "job_applications", label: "Job Applications" },
  { key: "job_suggestions", label: "Job Suggestions" },
  { key: "profile_visibility", label: "Profile Visibility Boosts" },
  { key: "saved_jobs", label: "Saved Jobs" },
  { key: "resume_reviews", label: "AI Resume Reviews" },
];

// ─── Company feature definitions ─────────────────────────────────────────────

const COMPANY_FEATURE_DEFS: Omit<FeatureLimit, "value" | "enabled">[] = [
  { key: "job_posts", label: "Job Posts" },
  { key: "candidate_suggestions", label: "Candidate Suggestions" },
  { key: "received_applications", label: "Received Applications" },
  { key: "featured_posts", label: "Featured Job Posts" },
  { key: "team_members", label: "Team Members" },
  { key: "analytics_exports", label: "Analytics Exports" },
  { key: "api_access", label: "API Access (calls/month)" },
];

// ─── Default features factory ────────────────────────────────────────────────

const defaultFeatures = (type: PlanType): FeatureLimit[] =>
  (type === "candidate" ? CANDIDATE_FEATURE_DEFS : COMPANY_FEATURE_DEFS).map(
    (f) => ({ ...f, value: 10, enabled: false }),
  );

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY: Plan[] = [
  {
    id: "1",
    type: "candidate",
    name: "Free Seeker",
    slug: "free-seeker",
    price: "$0",
    billing: "Monthly",
    status: "Active",
    subscribers: 842,
    createdAt: "Jan 1, 2026",
    features: [
      { key: "cv_uploads", label: "CV Uploads", value: 1, enabled: true },
      {
        key: "job_applications",
        label: "Job Applications",
        value: 5,
        enabled: true,
      },
      {
        key: "job_suggestions",
        label: "Job Suggestions",
        value: 0,
        enabled: false,
      },
      {
        key: "profile_visibility",
        label: "Profile Visibility Boosts",
        value: 0,
        enabled: false,
      },
      { key: "saved_jobs", label: "Saved Jobs", value: 10, enabled: true },
      {
        key: "resume_reviews",
        label: "AI Resume Reviews",
        value: 0,
        enabled: false,
      },
    ],
  },
  {
    id: "2",
    type: "candidate",
    name: "Pro Seeker",
    slug: "pro-seeker",
    price: "$12/mo",
    billing: "Monthly",
    status: "Active",
    subscribers: 312,
    createdAt: "Jan 1, 2026",
    features: [
      { key: "cv_uploads", label: "CV Uploads", value: 5, enabled: true },
      {
        key: "job_applications",
        label: "Job Applications",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "job_suggestions",
        label: "Job Suggestions",
        value: 10,
        enabled: true,
      },
      {
        key: "profile_visibility",
        label: "Profile Visibility Boosts",
        value: 3,
        enabled: true,
      },
      {
        key: "saved_jobs",
        label: "Saved Jobs",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "resume_reviews",
        label: "AI Resume Reviews",
        value: 2,
        enabled: true,
      },
    ],
  },
  {
    id: "3",
    type: "candidate",
    name: "Elite Seeker",
    slug: "elite-seeker",
    price: "$29/mo",
    billing: "Monthly",
    status: "Active",
    subscribers: 98,
    createdAt: "Feb 1, 2026",
    features: [
      {
        key: "cv_uploads",
        label: "CV Uploads",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "job_applications",
        label: "Job Applications",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "job_suggestions",
        label: "Job Suggestions",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "profile_visibility",
        label: "Profile Visibility Boosts",
        value: 10,
        enabled: true,
      },
      {
        key: "saved_jobs",
        label: "Saved Jobs",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "resume_reviews",
        label: "AI Resume Reviews",
        value: "unlimited",
        enabled: true,
      },
    ],
  },
  {
    id: "4",
    type: "company",
    name: "Starter Hire",
    slug: "starter-hire",
    price: "$19/mo",
    billing: "Monthly",
    status: "Active",
    subscribers: 87,
    createdAt: "Jan 1, 2026",
    features: [
      { key: "job_posts", label: "Job Posts", value: 5, enabled: true },
      {
        key: "candidate_suggestions",
        label: "Candidate Suggestions",
        value: 0,
        enabled: false,
      },
      {
        key: "received_applications",
        label: "Received Applications",
        value: 50,
        enabled: true,
      },
      {
        key: "featured_posts",
        label: "Featured Job Posts",
        value: 0,
        enabled: false,
      },
      { key: "team_members", label: "Team Members", value: 2, enabled: true },
      {
        key: "analytics_exports",
        label: "Analytics Exports",
        value: 0,
        enabled: false,
      },
      {
        key: "api_access",
        label: "API Access (calls/month)",
        value: 0,
        enabled: false,
      },
    ],
  },
  {
    id: "5",
    type: "company",
    name: "Pro Hire",
    slug: "pro-hire",
    price: "$49/mo",
    billing: "Monthly",
    status: "Active",
    subscribers: 214,
    createdAt: "Jan 1, 2026",
    features: [
      { key: "job_posts", label: "Job Posts", value: 25, enabled: true },
      {
        key: "candidate_suggestions",
        label: "Candidate Suggestions",
        value: 50,
        enabled: true,
      },
      {
        key: "received_applications",
        label: "Received Applications",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "featured_posts",
        label: "Featured Job Posts",
        value: 3,
        enabled: true,
      },
      { key: "team_members", label: "Team Members", value: 10, enabled: true },
      {
        key: "analytics_exports",
        label: "Analytics Exports",
        value: 10,
        enabled: true,
      },
      {
        key: "api_access",
        label: "API Access (calls/month)",
        value: 0,
        enabled: false,
      },
    ],
  },
  {
    id: "6",
    type: "company",
    name: "Enterprise",
    slug: "enterprise",
    price: "Custom",
    billing: "Custom",
    status: "Active",
    subscribers: 12,
    createdAt: "Jan 1, 2026",
    features: [
      {
        key: "job_posts",
        label: "Job Posts",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "candidate_suggestions",
        label: "Candidate Suggestions",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "received_applications",
        label: "Received Applications",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "featured_posts",
        label: "Featured Job Posts",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "team_members",
        label: "Team Members",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "analytics_exports",
        label: "Analytics Exports",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "api_access",
        label: "API Access (calls/month)",
        value: "unlimited",
        enabled: true,
      },
    ],
  },
  {
    id: "7",
    type: "company",
    name: "Agency Pro",
    slug: "agency-pro",
    price: "$199/mo",
    billing: "Monthly",
    status: "Draft",
    subscribers: 0,
    createdAt: "Apr 20, 2026",
    features: [
      {
        key: "job_posts",
        label: "Job Posts",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "candidate_suggestions",
        label: "Candidate Suggestions",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "received_applications",
        label: "Received Applications",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "featured_posts",
        label: "Featured Job Posts",
        value: 10,
        enabled: true,
      },
      { key: "team_members", label: "Team Members", value: 50, enabled: true },
      {
        key: "analytics_exports",
        label: "Analytics Exports",
        value: "unlimited",
        enabled: true,
      },
      {
        key: "api_access",
        label: "API Access (calls/month)",
        value: 10000,
        enabled: true,
      },
    ],
  },
];

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<PlanStatus, "green" | "amber" | "gray"> = {
  Active: "green",
  Inactive: "amber",
  Draft: "gray",
};

const BILLING_COLOR: Record<BillingCycle, "indigo" | "cyan" | "amber"> = {
  Monthly: "indigo",
  Annual: "cyan",
  Custom: "amber",
};

// ─── Feature summary helper ───────────────────────────────────────────────────

const featureSummary = (features: FeatureLimit[]): string => {
  const enabled = features.filter((f) => f.enabled);
  if (enabled.length === 0) return "No features";
  const first = enabled
    .slice(0, 2)
    .map((f) => `${f.value === "unlimited" ? "∞" : f.value} ${f.label}`)
    .join(", ");
  const more = enabled.length > 2 ? ` +${enabled.length - 2} more` : "";
  return first + more;
};

// ─── Modal form state ─────────────────────────────────────────────────────────

interface ModalForm {
  type: PlanType;
  name: string;
  slug: string;
  price: string;
  billing: BillingCycle;
  status: PlanStatus;
  features: FeatureLimit[];
}

const emptyForm = (): ModalForm => ({
  type: "candidate",
  name: "",
  slug: "",
  price: "",
  billing: "Monthly",
  status: "Active",
  features: defaultFeatures("candidate"),
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminPlans() {
  const [plans, setPlans] = useState<Plan[]>(DUMMY);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | PlanType>("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ModalForm>(emptyForm());

  // ── Computed stats ──────────────────────────────────────────────────────────

  const totalSubs = plans.reduce((a, p) => a + p.subscribers, 0);
  const activePlans = plans.filter((p) => p.status === "Active").length;
  const candidatePlans = plans.filter((p) => p.type === "candidate").length;
  const companyPlans = plans.filter((p) => p.type === "company").length;

  // ── Filtering ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter(
      (p) =>
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)) &&
        (!statusFilter || p.status === statusFilter) &&
        (typeFilter === "all" || p.type === typeFilter),
    );
  }, [plans, search, statusFilter, typeFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Modal helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditId(plan.id);
    setForm({
      type: plan.type,
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      billing: plan.billing,
      status: plan.status,
      features: plan.features.map((f) => ({ ...f })),
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const updateFormType = (type: PlanType) => {
    setForm((prev) => ({
      ...prev,
      type,
      features: defaultFeatures(type),
    }));
  };

  const updateFeatureEnabled = (key: string, enabled: boolean) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.key === key ? { ...f, enabled } : f,
      ),
    }));
  };

  const updateFeatureValue = (key: string, value: number | "unlimited") => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) => (f.key === key ? { ...f, value } : f)),
    }));
  };

  const updateFeatureUnlimited = (key: string, unlimited: boolean) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.key === key ? { ...f, value: unlimited ? "unlimited" : 10 } : f,
      ),
    }));
  };

  const saveForm = () => {
    if (!form.name || !form.slug || !form.price) return;

    if (editId) {
      setPlans((prev) =>
        prev.map((p) => (p.id === editId ? { ...p, ...form } : p)),
      );
    } else {
      const newPlan: Plan = {
        ...form,
        id: String(Date.now()),
        subscribers: 0,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };
      setPlans((prev) => [...prev, newPlan]);
    }
    closeModal();
  };

  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // ── Table columns ───────────────────────────────────────────────────────────

  const COLS: Column<Plan>[] = [
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
            {r.type === "candidate" ? (
              <UserCheck size={13} color="var(--primary)" />
            ) : (
              <Briefcase size={13} color="var(--accent)" />
            )}
            {r.name}
          </div>
          <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
            /{r.slug}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (r) => (
        <Badge
          label={r.type === "candidate" ? "Candidate" : "Company"}
          color={r.type === "candidate" ? "indigo" : "cyan"}
          dot={false}
        />
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (r) => (
        <span
          style={{ fontFamily: "Syne", fontWeight: 700, fontSize: ".85rem" }}
        >
          {r.price}
        </span>
      ),
    },
    {
      key: "billing",
      label: "Billing",
      render: (r) => (
        <Badge label={r.billing} color={BILLING_COLOR[r.billing]} dot={false} />
      ),
    },
    {
      key: "features",
      label: "Features",
      render: (r) => (
        <div
          style={{ fontSize: ".74rem", color: "var(--muted)", maxWidth: 220 }}
        >
          {featureSummary(r.features).split(" +")[0]}
          {r.features.filter((f) => f.enabled).length > 2 && (
            <span style={{ color: "var(--accent)" }}>
              {" "}
              +{r.features.filter((f) => f.enabled).length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: "subscribers",
      label: "Subscribers",
      render: (r) => (
        <span style={{ fontWeight: 600, fontSize: ".85rem" }}>
          {r.subscribers}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Plans" breadcrumb="Plans">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Plans",
            value: plans.length,
            icon: <Package size={16} />,
            color: "indigo" as const,
            hint: "",
          },
          {
            label: "Active Plans",
            value: activePlans,
            icon: <CheckCircle size={16} />,
            color: "green" as const,
            hint: "",
          },
          {
            label: "Candidate Plans",
            value: candidatePlans,
            icon: <UserCheck size={16} />,
            color: "cyan" as const,
            hint: "",
          },
          {
            label: "Company Plans",
            value: companyPlans,
            icon: <Briefcase size={16} />,
            color: "amber" as const,
            hint: "",
          },
          {
            label: "Total Subscribers",
            value: totalSubs,
            icon: <Users size={16} />,
            color: "indigo" as const,
            hint: "",
          },
          {
            label: "Enterprise Clients",
            value: plans.find((p) => p.slug === "enterprise")?.subscribers ?? 0,
            icon: <Zap size={16} />,
            color: "amber" as const,
            hint: "",
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-md-2 adm-au adm-d${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-au adm-d2">
        <AdminTable<Plan>
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
              {/* Type filter tabs */}
              <div className="d-flex gap-1">
                {(["all", "candidate", "company"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTypeFilter(t);
                      setPage(1);
                    }}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: ".76rem",
                      fontFamily: "Syne",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1.5px solid",
                      borderColor:
                        typeFilter === t ? "var(--primary)" : "var(--border)",
                      background:
                        typeFilter === t ? "var(--primary)" : "transparent",
                      color: typeFilter === t ? "#fff" : "var(--muted)",
                      transition: "all .15s",
                    }}
                  >
                    {t === "all"
                      ? "All"
                      : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

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
                <option value="Draft">Draft</option>
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
              maxWidth: 680,
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
                    ? "Update plan details and features"
                    : "Define features and limits for the new plan"}
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
              {/* Plan type selector */}
              <div>
                <SectionLabel>Plan type</SectionLabel>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {(["candidate", "company"] as PlanType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateFormType(t)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        border:
                          form.type === t
                            ? "2px solid var(--primary)"
                            : "1.5px solid var(--border)",
                        background:
                          form.type === t
                            ? "rgba(79,70,229,0.06)"
                            : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all .15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        {t === "candidate" ? (
                          <UserCheck
                            size={15}
                            color={
                              form.type === t
                                ? "var(--primary)"
                                : "var(--muted)"
                            }
                          />
                        ) : (
                          <Briefcase
                            size={15}
                            color={
                              form.type === t
                                ? "var(--primary)"
                                : "var(--muted)"
                            }
                          />
                        )}
                        <span
                          style={{
                            fontFamily: "Syne",
                            fontWeight: 700,
                            fontSize: ".85rem",
                            color:
                              form.type === t
                                ? "var(--primary)"
                                : "var(--text)",
                          }}
                        >
                          {t === "candidate" ? "Candidate" : "Company"}
                        </span>
                      </div>
                      <div
                        style={{ fontSize: ".74rem", color: "var(--muted)" }}
                      >
                        {t === "candidate"
                          ? "For job seekers — CVs, applications & suggestions"
                          : "For employers — job posts, suggestions & applications"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

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
                  <FormField label="Plan name">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      placeholder="e.g. Pro Seeker"
                      value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          name,
                          slug:
                            prev.slug ||
                            name.toLowerCase().replace(/\s+/g, "-"),
                        }));
                      }}
                    />
                  </FormField>
                  <FormField label="Slug">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      placeholder="e.g. pro-seeker"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Price">
                    <input
                      className="adm-search"
                      style={{ width: "100%", paddingLeft: ".9rem" }}
                      placeholder="e.g. $29/mo or Custom"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                  </FormField>
                  <FormField label="Billing cycle">
                    <select
                      className="adm-select"
                      style={{ width: "100%" }}
                      value={form.billing}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          billing: e.target.value as BillingCycle,
                        }))
                      }
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Annual">Annual</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </FormField>
                  <FormField label="Status">
                    <select
                      className="adm-select"
                      style={{ width: "100%" }}
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as PlanStatus,
                        }))
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Features & limits */}
              <div>
                <SectionLabel>Features & limits</SectionLabel>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {form.features.map((feat) => (
                    <div
                      key={feat.key}
                      style={{
                        background: feat.enabled
                          ? "rgba(79,70,229,0.03)"
                          : "var(--surface)",
                        border: `1.5px solid ${feat.enabled ? "rgba(79,70,229,0.15)" : "var(--border)"}`,
                        borderRadius: 12,
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "all .15s",
                      }}
                    >
                      {/* Enable toggle */}
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          flex: 1,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={feat.enabled}
                          onChange={(e) =>
                            updateFeatureEnabled(feat.key, e.target.checked)
                          }
                          style={{
                            accentColor: "var(--primary)",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: ".82rem",
                            color: feat.enabled
                              ? "var(--text)"
                              : "var(--muted)",
                          }}
                        >
                          {feat.label}
                        </span>
                      </label>

                      {/* Limit controls */}
                      {feat.enabled && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          {/* Unlimited toggle */}
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              cursor: "pointer",
                              fontSize: ".74rem",
                              color: "var(--muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={feat.value === "unlimited"}
                              onChange={(e) =>
                                updateFeatureUnlimited(
                                  feat.key,
                                  e.target.checked,
                                )
                              }
                              style={{
                                accentColor: "var(--accent)",
                                cursor: "pointer",
                              }}
                            />
                            {/* <Infinity size={12} color="var(--accent)" /> */}
                            Unlimited
                          </label>

                          {/* Number input */}
                          <input
                            type="number"
                            min={0}
                            disabled={feat.value === "unlimited"}
                            value={feat.value === "unlimited" ? "" : feat.value}
                            onChange={(e) =>
                              updateFeatureValue(
                                feat.key,
                                Number(e.target.value),
                              )
                            }
                            placeholder="Limit"
                            style={{
                              width: 80,
                              padding: "4px 8px",
                              borderRadius: 8,
                              border: "1.5px solid var(--border)",
                              fontFamily: "DM Sans",
                              fontSize: ".82rem",
                              color: "var(--text)",
                              background:
                                feat.value === "unlimited"
                                  ? "var(--surface)"
                                  : "#fff",
                              opacity: feat.value === "unlimited" ? 0.5 : 1,
                              textAlign: "center",
                              outline: "none",
                            }}
                          />

                          {/* Current value badge */}
                          <div
                            className="adm-badge adm-badge--indigo"
                            style={{ fontSize: ".7rem" }}
                          >
                            {feat.value === "unlimited" ? "∞" : feat.value}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
              >
                Cancel
              </button>
              <button
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={saveForm}
                disabled={!form.name || !form.slug || !form.price}
              >
                {editId ? "Save changes" : "Create plan"}
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
