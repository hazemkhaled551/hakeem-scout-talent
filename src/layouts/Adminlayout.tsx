import { useState, useEffect, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import "../styles/Admin.css";

/* ════════════════════════════════════════════════════════════
   NAV CONFIG
════════════════════════════════════════════════════════════ */
const NAV_GROUPS = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={16} />, to: "/admin" },
      { label: "Admins", icon: <LayoutDashboard size={16} />, to: "/admin/admins" },
      { label: "Amin Roles", icon: <LayoutDashboard size={16} />, to: "/admin/roles" },
      { label: "Users", icon: <Users size={16} />, to: "/admin/users" },
      {
        label: "Companies",
        icon: <Briefcase size={16} />,
        to: "/admin/companies",
      },
      { label: "Jobs", icon: <Briefcase size={16} />, to: "/admin/jobs" },
    ],
  },
  {
    label: "Finance",
    items: [

      { label: "Subscriptions", icon: <CreditCard size={16} />, to: "/admin/subscriptions" },
      { label: "Plans", icon: <CreditCard size={16} />, to: "/admin/plans" },
      {
        label: "Payments",
        icon: <CreditCard size={16} />,
        to: "/admin/payments",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Analytics",
        icon: <BarChart2 size={16} />,
        to: "/admin/analytics",
      },
      {
        label: "Settings",
        icon: <Settings size={16} />,
        to: "/admin/settings",
      },
    ],
  },
];

/* ════════════════════════════════════════════════════════════
   PROPS
════════════════════════════════════════════════════════════ */
interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function AdminLayout({
  children,
  title,
  breadcrumb,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close mobile drawer on nav */
  function handleNavClick() {
    setMobileOpen(false);
  }

  return (
    <div className="adm-shell">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 199,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══ SIDEBAR ══════════════════════════════════════════ */}
      <aside
        className={`adm-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Logo */}
        <div className="adm-sb-logo">
          <div className="adm-sb-logo-box">H</div>
          {!collapsed && (
            <>
              <span className="adm-sb-logo-name">
                Hakeem <span className="adm-sb-logo-badge">ADMIN</span>
              </span>
            </>
          )}
          <button
            className="adm-sb-toggle"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: ".5rem 0" }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && <div className="adm-sb-group">{group.label}</div>}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    `adm-sb-link ${isActive ? "adm-sb-link--active" : ""}`
                  }
                  onClick={handleNavClick}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="adm-sb-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="adm-sb-link-text">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="adm-sb-footer">
          <button
            className="adm-sb-link"
            style={{ color: "rgba(239,68,68,.7)" }}
            onClick={() => navigate("/")}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut size={16} className="adm-sb-icon" />
            {!collapsed && <span className="adm-sb-link-text">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ══ TOPBAR ═══════════════════════════════════════════ */}
      <header
        className={`adm-topbar ${scrolled ? "scrolled" : ""} ${collapsed ? "collapsed" : ""}`}
      >
        {/* Left: mobile menu + title */}
        <div
          className="d-flex align-items-center gap-1rem"
          style={{ gap: ".75rem" }}
        >
          <button
            className="adm-tb-btn d-md-none"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
          <div>
            <div className="adm-page-title">{title}</div>
            {breadcrumb && (
              <div className="adm-breadcrumb">
                Admin / <span>{breadcrumb}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="adm-topbar-right">
          <button
            className="adm-tb-btn"
            onClick={() => navigate("/admin/settings")}
          >
            <Bell size={15} />
            <div className="adm-notif-dot" />
          </button>
          <button
            className="adm-tb-btn"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings size={15} />
          </button>
          <div
            className="adm-admin-avatar"
            onClick={() => navigate("/admin/settings")}
          >
            AD
          </div>
        </div>
      </header>

      {/* ══ CONTENT ══════════════════════════════════════════ */}
      <main className={`adm-content ${collapsed ? "collapsed" : ""}`}>
        <div className="adm-page">{children}</div>
      </main>
    </div>
  );
}
