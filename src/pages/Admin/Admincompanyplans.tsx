import { useState, useMemo } from "react";
import {
  Package,
  Search,
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
//   DollarSign,
  Users,
  Zap,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: string;
  billing: "Monthly" | "Annual" | "Custom";
  maxJobs: number | "Unlimited";
  maxUsers: number | "Unlimited";
  features: string[];
  status: "Active" | "Inactive" | "Draft";
  subscribers: number;
  createdAt: string;
}

const DUMMY: Plan[] = [
  {
    id: "1",
    name: "Free",
    slug: "free",
    price: "$0",
    billing: "Monthly",
    maxJobs: 3,
    maxUsers: 1,
    features: ["3 Job Posts", "Basic Analytics", "Email Support"],
    status: "Active",
    subscribers: 142,
    createdAt: "Jan 1, 2026",
  },
  {
    id: "2",
    name: "Starter",
    slug: "starter",
    price: "$19/mo",
    billing: "Monthly",
    maxJobs: 10,
    maxUsers: 3,
    features: [
      "10 Job Posts",
      "Advanced Analytics",
      "Priority Support",
      "Custom Branding",
    ],
    status: "Active",
    subscribers: 87,
    createdAt: "Jan 1, 2026",
  },
  {
    id: "3",
    name: "Pro",
    slug: "pro",
    price: "$49/mo",
    billing: "Monthly",
    maxJobs: 50,
    maxUsers: 10,
    features: [
      "50 Job Posts",
      "Full Analytics",
      "Priority Support",
      "Custom Branding",
      "API Access",
    ],
    status: "Active",
    subscribers: 214,
    createdAt: "Jan 1, 2026",
  },
  {
    id: "4",
    name: "Pro Annual",
    slug: "pro-annual",
    price: "$468/yr",
    billing: "Annual",
    maxJobs: 50,
    maxUsers: 10,
    features: [
      "50 Job Posts",
      "Full Analytics",
      "Priority Support",
      "Custom Branding",
      "API Access",
      "2 Months Free",
    ],
    status: "Active",
    subscribers: 96,
    createdAt: "Feb 1, 2026",
  },
  {
    id: "5",
    name: "Enterprise",
    slug: "enterprise",
    price: "Custom",
    billing: "Custom",
    maxJobs: "Unlimited",
    maxUsers: "Unlimited",
    features: [
      "Unlimited Job Posts",
      "Dedicated Manager",
      "SLA Support",
      "Custom Integrations",
      "White Label",
    ],
    status: "Active",
    subscribers: 12,
    createdAt: "Jan 1, 2026",
  },
  {
    id: "6",
    name: "Agency",
    slug: "agency",
    price: "$199/mo",
    billing: "Monthly",
    maxJobs: "Unlimited",
    maxUsers: 50,
    features: [
      "Unlimited Job Posts",
      "Multi-Brand",
      "Team Management",
      "API Access",
    ],
    status: "Draft",
    subscribers: 0,
    createdAt: "Apr 20, 2026",
  },
];

const STATUS_COLOR: Record<string, "green" | "amber" | "gray"> = {
  Active: "green",
  Inactive: "amber",
  Draft: "gray",
};

const BILLING_COLOR: Record<string, "indigo" | "cyan" | "amber"> = {
  Monthly: "indigo",
  Annual: "cyan",
  Custom: "amber",
};

export default function AdminCompanyPlans() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const filtered = useMemo(
    () =>
      DUMMY.filter((p) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            p.name.toLowerCase().includes(q) ||
            p.slug.toLowerCase().includes(q)) &&
          (!statusFilter || p.status === statusFilter)
        );
      }),
    [search, statusFilter],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSubs = DUMMY.reduce((acc, p) => acc + p.subscribers, 0);
  const activePlans = DUMMY.filter((p) => p.status === "Active").length;

  const COLS: Column<Plan>[] = [
    {
      key: "name",
      label: "Plan Name",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: ".85rem" }}>{r.name}</div>
          <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
            /{r.slug}
          </div>
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
      key: "limits",
      label: "Limits",
      render: (r) => (
        <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          <span>{r.maxJobs} jobs</span>
          <span style={{ margin: "0 4px" }}>·</span>
          <span>{r.maxUsers} users</span>
        </div>
      ),
    },
    {
      key: "features",
      label: "Features",
      render: (r) => (
        <div
          style={{ fontSize: ".74rem", color: "var(--muted)", maxWidth: 200 }}
        >
          {r.features.slice(0, 2).join(", ")}
          {r.features.length > 2 && (
            <span style={{ color: "var(--accent)" }}>
              {" "}
              +{r.features.length - 2} more
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
      render: () => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn">
            <Edit2 size={12} />
          </button>
          <button className="adm-row-btn adm-row-btn--danger">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Company Plans" breadcrumb="Plans">
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Plans",
            value: DUMMY.length,
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
            label: "Total Subscribers",
            value: totalSubs,
            icon: <Users size={16} />,
            color: "cyan" as const,
            hint: "",
          },
          {
            label: "Enterprise Clients",
            value: DUMMY.find((p) => p.slug === "enterprise")?.subscribers ?? 0,
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
            <button className="adm-btn adm-btn--primary adm-btn--sm">
              <Plus size={13} /> New Plan
            </button>
          }
          searchSlot={
            <div className="d-flex align-items-center gap-2">
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
    </AdminLayout>
  );
}
