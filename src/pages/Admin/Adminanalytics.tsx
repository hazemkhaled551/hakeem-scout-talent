import { Users, Briefcase, CreditCard, Activity } from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";
import { StatCard } from "../../components/Admintable";

/* ── Simple bar chart component ─────────────────────────── */
function BarChart({
  data,
  color = "var(--primary)",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: ".4rem",
        height: 120,
        padding: "0 .2rem",
      }}
    >
      {data.map((d) => (
        <div
          key={d.label}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: ".3rem",
          }}
        >
          <span
            style={{
              fontSize: ".65rem",
              color: "var(--muted)",
              fontFamily: "Syne",
              fontWeight: 700,
            }}
          >
            {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
          </span>
          <div
            style={{
              width: "100%",
              borderRadius: "5px 5px 0 0",
              height: `${Math.max((d.value / max) * 100, 4)}%`,
              background: color,
              opacity: 0.85,
              transition: "height .5s ease",
            }}
          />
          <span style={{ fontSize: ".62rem", color: "var(--muted)" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Line sparkline ──────────────────────────────────────── */
function Sparkline({
  values,
  color = "var(--primary)",
}: {
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
      />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 8) - 4;
        return i === values.length - 1 ? (
          <circle key={i} cx={x} cy={y} r="3.5" fill={color} />
        ) : null;
      })}
    </svg>
  );
}

/* ── Donut chart ─────────────────────────────────────────── */
function Donut({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, d) => s + d.value, 0);
//   let offset = 0;
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circ;
          const gap = circ - dash;

          const offset = segments
            .slice(0, i)
            .reduce((acc, s) => acc + (s.value / total) * circ, 0);

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "44px 44px",
              }}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={27} fill="var(--white)" />
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: "13px",
            fill: "var(--text)",
          }}
        >
          {total}
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
        {segments.map((seg) => (
          <div
            key={seg.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".4rem",
              fontSize: ".78rem",
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background: seg.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: "var(--muted)" }}>{seg.label}</span>
            <span
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                marginLeft: "auto",
                color: "var(--text)",
              }}
            >
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════ */
const SIGNUPS = [
  { label: "Nov", value: 120 },
  { label: "Dec", value: 195 },
  { label: "Jan", value: 230 },
  { label: "Feb", value: 180 },
  { label: "Mar", value: 310 },
  { label: "Apr", value: 285 },
];
const REVENUE = [
  { label: "Nov", value: 2400 },
  { label: "Dec", value: 3100 },
  { label: "Jan", value: 4200 },
  { label: "Feb", value: 3800 },
  { label: "Mar", value: 5900 },
  { label: "Apr", value: 8240 },
];
const JOBS_BAR = [
  { label: "Nov", value: 34 },
  { label: "Dec", value: 52 },
  { label: "Jan", value: 61 },
  { label: "Feb", value: 48 },
  { label: "Mar", value: 79 },
  { label: "Apr", value: 138 },
];
const APPS_BAR = [
  { label: "Nov", value: 210 },
  { label: "Dec", value: 380 },
  { label: "Jan", value: 520 },
  { label: "Feb", value: 440 },
  { label: "Mar", value: 690 },
  { label: "Apr", value: 820 },
];

const SPARK_USERS = [
  310, 380, 420, 395, 480, 540, 510, 620, 680, 720, 760, 820,
];
const SPARK_REVENUE = [
  2400, 3100, 2900, 4200, 3800, 5100, 5900, 6400, 7200, 7800, 8240, 9100,
];

const USER_ROLES = [
  { label: "Applicants", value: 3841, color: "var(--primary)" },
  { label: "Companies", value: 980, color: "var(--accent)" },
];
const JOB_STATUS = [
  { label: "Published", value: 138, color: "var(--success)" },
  { label: "Draft", value: 42, color: "var(--muted)" },
  { label: "Closed", value: 87, color: "var(--danger)" },
];

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 16,
        border: "1px solid var(--border)",
        boxShadow: "0 2px 12px rgba(79,70,229,.04)",
        padding: "1.2rem 1.4rem",
      }}
    >
      <div
        style={{
          fontFamily: "Syne",
          fontWeight: 700,
          fontSize: ".9rem",
          marginBottom: "1rem",
          color: "var(--text)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminLayout title="Analytics" breadcrumb="Analytics">
      {/* KPI */}
      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Users",
            value: "4,821",
            hint: "+18% vs last month",
            icon: <Users size={16} />,
            color: "indigo" as const,
            delta: { value: "18%", up: true },
          },
          {
            label: "Active Jobs",
            value: "138",
            hint: "+32% vs last month",
            icon: <Briefcase size={16} />,
            color: "green" as const,
            delta: { value: "32%", up: true },
          },
          {
            label: "MRR",
            value: "$8,240",
            hint: "+22% vs last month",
            icon: <CreditCard size={16} />,
            color: "cyan" as const,
            delta: { value: "22%", up: true },
          },
          {
            label: "Applications",
            value: "820",
            hint: "This month",
            icon: <Activity size={16} />,
            color: "amber" as const,
            delta: { value: "12%", up: true },
          },
        ].map((s, i) => (
          <div key={i} className={`col-6 col-md-3 adm-au adm-d${i + 1}`}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Sparklines */}
      <div className="row g-3 mb-4">
        {[
          {
            title: "User Growth (12 mo)",
            values: SPARK_USERS,
            color: "var(--primary)",
            suffix: "users",
          },
          {
            title: "Revenue Trend (12 mo)",
            values: SPARK_REVENUE,
            color: "var(--success)",
            suffix: "$",
          },
        ].map((s, i) => (
          <div key={i} className={`col-12 col-md-6 adm-au adm-d${i + 1}`}>
            <ChartCard title={s.title}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span
                  style={{
                    fontFamily: "Syne",
                    fontWeight: 800,
                    fontSize: "1.5rem",
                    color: "var(--text)",
                  }}
                >
                  {s.suffix === "$"
                    ? `$${s.values[s.values.length - 1].toLocaleString()}`
                    : s.values[s.values.length - 1].toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: ".74rem",
                    color: "var(--success)",
                    fontWeight: 600,
                  }}
                >
                  ↑ Latest
                </span>
              </div>
              <Sparkline values={s.values} color={s.color} />
            </ChartCard>
          </div>
        ))}
      </div>

      {/* Bar charts */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 adm-au adm-d2">
          <ChartCard title="New Signups by Month">
            <BarChart data={SIGNUPS} color="var(--primary)" />
          </ChartCard>
        </div>
        <div className="col-12 col-md-6 adm-au adm-d3">
          <ChartCard title="Revenue by Month ($)">
            <BarChart data={REVENUE} color="var(--success)" />
          </ChartCard>
        </div>
        <div className="col-12 col-md-6 adm-au adm-d2">
          <ChartCard title="Active Jobs by Month">
            <BarChart data={JOBS_BAR} color="var(--accent)" />
          </ChartCard>
        </div>
        <div className="col-12 col-md-6 adm-au adm-d3">
          <ChartCard title="Applications by Month">
            <BarChart data={APPS_BAR} color="var(--warning)" />
          </ChartCard>
        </div>
      </div>

      {/* Donuts */}
      <div className="row g-3">
        <div className="col-12 col-md-6 adm-au adm-d2">
          <ChartCard title="Users by Role">
            <Donut segments={USER_ROLES} />
          </ChartCard>
        </div>
        <div className="col-12 col-md-6 adm-au adm-d3">
          <ChartCard title="Jobs by Status">
            <Donut segments={JOB_STATUS} />
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
}
