import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  render: (row: T, index: number) => ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyIcon?: ReactNode;
  // pagination
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (p: number) => void;
  // header slot
  title?: string;
  actions?: ReactNode;
  searchSlot?: ReactNode;
}

/* ════════════════════════════════════════════════════════════
   STAT CARD  (exported for convenience)
════════════════════════════════════════════════════════════ */
interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  color?: "indigo" | "green" | "amber" | "red" | "cyan";
  delta?: { value: string; up: boolean };
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  color = "indigo",
  delta,
}: StatCardProps) {
  return (
    <div className={`adm-stat adm-stat--${color}`}>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="adm-stat-label">{label}</span>
        <div className={`adm-stat-icon adm-stat-icon--${color}`}>{icon}</div>
      </div>
      <div className={`adm-stat-val adm-stat-val--${color}`}>{value}</div>
      {delta && (
        <div
          className={`adm-stat-delta adm-stat-delta--${delta.up ? "up" : "down"}`}
        >
          {delta.up ? "↑" : "↓"} {delta.value}
        </div>
      )}
      {hint && !delta && (
        <div
          style={{
            fontSize: ".72rem",
            color: "var(--muted)",
            marginTop: ".18rem",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   BADGE  (exported helper)
════════════════════════════════════════════════════════════ */
type BadgeColor = "green" | "amber" | "red" | "indigo" | "gray" | "cyan";
interface BadgeProps {
  label: string;
  color: BadgeColor;
  dot?: boolean;
}

export function Badge({ label, color, dot = true }: BadgeProps) {
  return (
    <span className={`adm-badge adm-badge--${color}`}>
      {dot && <span className="adm-badge-dot" />}
      {label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   USER CELL  (avatar + name + sub)
════════════════════════════════════════════════════════════ */
interface UserCellProps {
  name: string;
  sub?: string;
  initials?: string;
}
export function UserCell({ name, sub, initials }: UserCellProps) {
  const ini =
    initials ??
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  return (
    <div className="adm-cell-user">
      <div className="adm-cell-avatar">{ini}</div>
      <div>
        <div className="adm-cell-name">{name}</div>
        {sub && <div className="adm-cell-sub">{sub}</div>}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   TABLE COMPONENT
════════════════════════════════════════════════════════════ */
export default function AdminTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  emptyTitle = "No data found",
  emptyIcon,
  page = 1,
  pageSize = 10,
  total,
  onPageChange,
  title,
  actions,
  searchSlot,
}: AdminTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = total ? Math.min(page * pageSize, total) : data.length;

  return (
    <div className="adm-table-wrap">
      {/* Header */}
      {(title || actions || searchSlot) && (
        <div className="adm-table-header">
          {title && <span className="adm-table-title">{title}</span>}
          <div
            className="d-flex align-items-center gap-2 flex-wrap"
            style={{ marginLeft: "auto" }}
          >
            {searchSlot}
            {actions}
          </div>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="adm-loading">
          <div className="adm-spinner" />
          Loading…
        </div>
      ) : data.length === 0 ? (
        <div className="adm-empty">
          {emptyIcon && <div className="adm-empty-icon">{emptyIcon}</div>}
          <div className="adm-empty-title">{emptyTitle}</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="adm-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} style={{ width: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col.key}>{col.render(row, i)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {onPageChange && total && total > pageSize && (
        <div className="adm-pagination">
          <button
            className="adm-page-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={13} />
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                className={`adm-page-btn ${page === p ? "adm-page-btn--active" : ""}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            );
          })}

          <button
            className="adm-page-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRight size={13} />
          </button>

          <span className="adm-page-info">
            {from}–{to} of {total}
          </span>
        </div>
      )}
    </div>
  );
}
