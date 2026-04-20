import { useState, useMemo } from "react";
import { CreditCard, Search, Eye, RefreshCw, TrendingUp } from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import AdminTable, {
  StatCard,
  Badge,
  type Column,
} from "../../components/Admintable";

/* ════════════════════════════════════════════════════════════
   TYPES & DUMMY
════════════════════════════════════════════════════════════ */
interface Payment {
  id: string;
  company: string;
  email: string;
  plan: string;
  amount: string;
  billing: "Monthly" | "Annual";
  method: string;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  date: string;
  invoice: string;
}

const DUMMY: Payment[] = [
  {
    id: "pay_001",
    company: "TechCorp Inc.",
    email: "hr@techcorp.com",
    plan: "Pro",
    amount: "$468.00",
    billing: "Annual",
    method: "Visa ••4242",
    status: "Paid",
    date: "Apr 1, 2026",
    invoice: "INV-0041",
  },
  {
    id: "pay_002",
    company: "CloudBase",
    email: "team@cloudbase.com",
    plan: "Enterprise",
    amount: "$2,400.00",
    billing: "Annual",
    method: "MC ••9999",
    status: "Paid",
    date: "Apr 1, 2026",
    invoice: "INV-0042",
  },
  {
    id: "pay_003",
    company: "DesignStudio",
    email: "jobs@design.io",
    plan: "Pro",
    amount: "$49.00",
    billing: "Monthly",
    method: "Visa ••1234",
    status: "Paid",
    date: "Apr 3, 2026",
    invoice: "INV-0043",
  },
  {
    id: "pay_004",
    company: "InnovateLabs",
    email: "jobs@innov.io",
    plan: "Pro",
    amount: "$49.00",
    billing: "Monthly",
    method: "MC ••5678",
    status: "Failed",
    date: "Apr 5, 2026",
    invoice: "INV-0044",
  },
  {
    id: "pay_005",
    company: "MediaGroup",
    email: "hr@media.com",
    plan: "Free",
    amount: "$0.00",
    billing: "Monthly",
    method: "—",
    status: "Paid",
    date: "Apr 10, 2026",
    invoice: "INV-0045",
  },
  {
    id: "pay_006",
    company: "StartupXYZ",
    email: "hi@startup.xyz",
    plan: "Pro",
    amount: "$49.00",
    billing: "Monthly",
    method: "Visa ••8888",
    status: "Refunded",
    date: "Mar 28, 2026",
    invoice: "INV-0039",
  },
  {
    id: "pay_007",
    company: "DataFlow Systems",
    email: "info@dataflow.io",
    plan: "Enterprise",
    amount: "$2,400.00",
    billing: "Annual",
    method: "Bank Transfer",
    status: "Paid",
    date: "Mar 1, 2026",
    invoice: "INV-0038",
  },
  {
    id: "pay_008",
    company: "MobileFirst",
    email: "hr@mobilefirst.dev",
    plan: "Pro",
    amount: "$468.00",
    billing: "Annual",
    method: "Amex ••0007",
    status: "Pending",
    date: "Apr 15, 2026",
    invoice: "INV-0046",
  },
];

const STATUS_COLOR: Record<string, "green" | "amber" | "red" | "gray"> = {
  Paid: "green",
  Pending: "amber",
  Failed: "red",
  Refunded: "gray",
};

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function AdminPayments() {
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
            p.company.toLowerCase().includes(q) ||
            p.invoice.toLowerCase().includes(q)) &&
          (!statusFilter || p.status === statusFilter)
        );
      }),
    [search, statusFilter],
  );

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = DUMMY.filter((p) => p.status === "Paid").reduce(
    (sum, p) => sum + parseFloat(p.amount.replace(/[$,]/g, "")),
    0,
  );

  const COLS: Column<Payment>[] = [
    {
      key: "invoice",
      label: "Invoice",
      render: (r) => (
        <span
          style={{
            fontFamily: "Syne",
            fontWeight: 700,
            fontSize: ".82rem",
            color: "var(--primary)",
          }}
        >
          {r.invoice}
        </span>
      ),
    },
    {
      key: "company",
      label: "Company",
      render: (r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: ".85rem" }}>{r.company}</div>
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
        <Badge
          label={r.plan}
          color={
            r.plan === "Enterprise"
              ? "cyan"
              : r.plan === "Pro"
                ? "indigo"
                : "gray"
          }
          dot={false}
        />
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (r) => (
        <span
          style={{ fontFamily: "Syne", fontWeight: 800, fontSize: ".9rem" }}
        >
          {r.amount}
        </span>
      ),
    },
    {
      key: "billing",
      label: "Billing",
      render: (r) => (
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          {r.billing}
        </span>
      ),
    },
    {
      key: "method",
      label: "Method",
      render: (r) => (
        <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
          {r.method}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge label={r.status} color={STATUS_COLOR[r.status]} />,
    },
    {
      key: "date",
      label: "Date",
      render: (r) => (
        <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>
          {r.date}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "90px",
      render: (r) => (
        <div className="d-flex gap-1">
          <button className="adm-row-btn">
            <Eye size={12} />
          </button>
          {r.status === "Failed" && (
            <button className="adm-row-btn adm-row-btn--success">
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Payments" breadcrumb="Payments">
      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: <CreditCard size={16} />,
            color: "green" as const,
            hint: "All time paid",
          },
          {
            label: "Transactions",
            value: DUMMY.length,
            icon: <TrendingUp size={16} />,
            color: "indigo" as const,
            hint: "Total",
          },
          {
            label: "Failed",
            value: DUMMY.filter((p) => p.status === "Failed").length,
            icon: <CreditCard size={16} />,
            color: "red" as const,
            hint: "Need attention",
          },
          {
            label: "Pending",
            value: DUMMY.filter((p) => p.status === "Pending").length,
            icon: <CreditCard size={16} />,
            color: "amber" as const,
            hint: "Awaiting",
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-md-3 adm-au adm-d${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-au adm-d2">
        <AdminTable<Payment>
          title="All Transactions"
          columns={COLS}
          data={paged}
          emptyTitle="No payments found"
          emptyIcon={<CreditCard size={22} />}
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
          searchSlot={
            <div className="d-flex align-items-center gap-2">
              <div className="adm-search-wrap">
                <Search size={13} className="adm-search-icon" />
                <input
                  className="adm-search"
                  placeholder="Search company or invoice…"
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
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
                <option>Refunded</option>
              </select>
            </div>
          }
        />
      </div>
    </AdminLayout>
  );
}
