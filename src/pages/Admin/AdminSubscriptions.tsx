import { useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";

interface Subscription {
  id: string;
  companyName: string;
  email: string;
  plan: "Free" | "Pro" | "Enterprise";
  billing: "Monthly" | "Annual";
  status: "Active" | "Cancelled" | "Past Due";
  amount: string;
  startedAt: string;
  renewsAt: string;
}

const DUMMY: Subscription[] = [
  {
    id: "1",
    companyName: "TechCorp Inc.",
    email: "hr@techcorp.com",
    plan: "Pro",
    billing: "Annual",
    status: "Active",
    amount: "$468/yr",
    startedAt: "Jan 1, 2026",
    renewsAt: "Jan 1, 2027",
  },
  {
    id: "2",
    companyName: "CloudBase",
    email: "team@cloudbase.com",
    plan: "Enterprise",
    billing: "Annual",
    status: "Active",
    amount: "Custom",
    startedAt: "Feb 1, 2026",
    renewsAt: "Feb 1, 2027",
  },
  {
    id: "3",
    companyName: "DesignStudio",
    email: "jobs@design.io",
    plan: "Pro",
    billing: "Monthly",
    status: "Active",
    amount: "$49/mo",
    startedAt: "Mar 1, 2026",
    renewsAt: "May 1, 2026",
  },
  {
    id: "4",
    companyName: "MediaGroup",
    email: "hr@media.com",
    plan: "Free",
    billing: "Monthly",
    status: "Active",
    amount: "$0",
    startedAt: "Apr 10, 2026",
    renewsAt: "—",
  },
  {
    id: "5",
    companyName: "InnovateLabs",
    email: "jobs@innov.io",
    plan: "Pro",
    billing: "Monthly",
    status: "Past Due",
    amount: "$49/mo",
    startedAt: "Mar 15, 2026",
    renewsAt: "Apr 15, 2026",
  },
  {
    id: "6",
    companyName: "StartupXYZ",
    email: "hi@startup.xyz",
    plan: "Pro",
    billing: "Annual",
    status: "Cancelled",
    amount: "$468/yr",
    startedAt: "Jan 5, 2026",
    renewsAt: "—",
  },
];

const PLAN_COLOR: Record<string, "indigo" | "cyan" | "amber" | "gray"> = {
  Pro: "indigo",
  Enterprise: "cyan",
  Free: "gray",
};
const STATUS_COLOR: Record<string, "green" | "amber" | "red"> = {
  Active: "green",
  "Past Due": "amber",
  Cancelled: "red",
};

export default function AdminSubscriptions() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  const filtered = useMemo(
    () =>
      DUMMY.filter((s) => {
        const q = search.toLowerCase();
        return (
          (!q ||
            s.companyName.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)) &&
          (!planFilter || s.plan === planFilter)
        );
      }),
    [search, planFilter],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const mrr =
    DUMMY.filter(
      (s) =>
        s.status === "Active" && s.plan !== "Free" && s.billing === "Monthly",
    ).length *
      49 +
    DUMMY.filter(
      (s) =>
        s.status === "Active" && s.plan !== "Free" && s.billing === "Annual",
    ).length *
      39;

  const COLS: Column<Subscription>[] = [
    {
      key: "company",
      label: "Company",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: ".85rem" }}>
            {r.companyName}
          </div>
          <div style={{ fontSize: ".74rem", color: "var(--muted)" }}>
            {r.email}
          </div>
        </div>
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
      key: "billing",
      label: "Billing",
      render: (r) => (
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
          {r.billing}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => (
        <span
          style={{ fontFamily: "Syne", fontWeight: 700, fontSize: ".85rem" }}
        >
          {r.amount}
        </span>
      ),
    },
    {
      key: "renewsAt",
      label: "Renews",
      render: (r) => (
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
          {r.renewsAt}
        </span>
      ),
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
    <AdminLayout title="Plans & Subscriptions" breadcrumb="Plans">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Subscriptions",
            value: DUMMY.length,
            icon: <CreditCard size={16} />,
            color: "indigo" as const,
          },
          {
            label: "Pro Subscribers",
            value: DUMMY.filter((s) => s.plan === "Pro").length,
            icon: <CheckCircle size={16} />,
            color: "green" as const,
          },
          {
            label: "Enterprise",
            value: DUMMY.filter((s) => s.plan === "Enterprise").length,
            icon: <CheckCircle size={16} />,
            color: "cyan" as const,
          },
          {
            label: "Est. MRR",
            value: `$${mrr}/mo`,
            icon: <CreditCard size={16} />,
            color: "amber" as const,
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-md-3 adm-au adm-d${i + 1}`}>
            <StatCard {...s} hint="" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-au adm-d2">
        <AdminTable<Subscription>
          title="All Subscriptions"
          columns={COLS}
          data={paged}
          emptyTitle="No subscriptions found"
          emptyIcon={<CreditCard size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          actions={
            <button className="adm-btn adm-btn--primary adm-btn--sm">
              <Plus size={13} /> Add Plan
            </button>
          }
          searchSlot={
            <div className="d-flex align-items-center gap-2">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search…"
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
                <option value="Free">Free</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          }
        />
      </div>
    </AdminLayout>
  );
}
