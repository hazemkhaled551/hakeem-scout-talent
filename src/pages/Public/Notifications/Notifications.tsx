import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Video,
  Briefcase,
  MessageSquare,
  Gift,
  CheckCircle,
  X,
  Users,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import "./Notifications.css";
import ApplicantNavbar from "../../../components/ApplicantNavbar";
import CompanyNavbar from "../../../components/CompanyNavbar";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
export type NotificationType =
  | "interview_scheduled"
  | "interview_rescheduled"
  | "interview_cancelled"
  | "status_changed"
  | "feedback_submitted"
  | "job_published"
  | "job_closed"
  | "new_applicant"
  | "offer_sent"
  | "hired"
  | "rejected";

export type NotificationRecipient = "applicant" | "company";

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  recipient: NotificationRecipient;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string; // ISO
  // optional contextual links
  actionUrl?: string; // e.g. "/applicant/interviews"
  meta?: {
    candidateName?: string;
    jobTitle?: string;
    companyName?: string;
    interviewDate?: string;
    status?: string;
    nextStep?: string;
  };
}

type FilterTab = "All" | "Unread" | NotificationType;

/* ════════════════════════════════════════════════════════════
   DUMMY DATA  (replace with API)
════════════════════════════════════════════════════════════ */
const DUMMY_APPLICANT: NotificationDTO[] = [
  {
    id: "1",
    type: "interview_scheduled",
    recipient: "applicant",
    isRead: false,
    createdAt: "2026-03-25T08:00:00Z",
    title: "Interview Scheduled",
    body: "Your Technical interview with TechCorp Inc. is set for Mar 25, 2026 at 10:00 AM.",
    actionUrl: "/applicant/interviews",
    meta: {
      companyName: "TechCorp Inc.",
      interviewDate: "Mar 25, 2026 · 10:00 AM",
      jobTitle: "Senior Software Engineer",
    },
  },
  {
    id: "2",
    type: "feedback_submitted",
    recipient: "applicant",
    isRead: false,
    createdAt: "2026-03-18T12:00:00Z",
    title: "Interview Feedback Available",
    body: "TechCorp Inc. submitted feedback for your Frontend Engineer interview. Next step: Offer.",
    actionUrl: "/applicant/interviews",
    meta: { companyName: "DesignStudio", nextStep: "Offer" },
  },
  {
    id: "3",
    type: "status_changed",
    recipient: "applicant",
    isRead: false,
    createdAt: "2026-03-17T09:00:00Z",
    title: "Application Status Updated",
    body: "Your application for Full Stack Developer at InnovateLabs moved to Screening.",
    actionUrl: "/applicant",
    meta: {
      jobTitle: "Full Stack Developer",
      companyName: "InnovateLabs",
      status: "Screening",
    },
  },
  {
    id: "4",
    type: "offer_sent",
    recipient: "applicant",
    isRead: true,
    createdAt: "2026-03-15T14:00:00Z",
    title: "Offer Received! 🎉",
    body: "TechCorp Inc. sent you an offer for Senior Software Engineer. Check your dashboard.",
    actionUrl: "/applicant",
    meta: {
      jobTitle: "Senior Software Engineer",
      companyName: "TechCorp Inc.",
    },
  },
  {
    id: "5",
    type: "interview_rescheduled",
    recipient: "applicant",
    isRead: true,
    createdAt: "2026-03-14T10:00:00Z",
    title: "Interview Rescheduled",
    body: "Your Culture Fit interview with CloudBase has been moved to Mar 29, 2026 at 3:30 PM.",
    actionUrl: "/applicant/interviews",
    meta: { companyName: "CloudBase", interviewDate: "Mar 29, 2026 · 3:30 PM" },
  },
  {
    id: "6",
    type: "interview_cancelled",
    recipient: "applicant",
    isRead: true,
    createdAt: "2026-03-13T11:00:00Z",
    title: "Interview Cancelled",
    body: "DataFlow Systems cancelled your Final interview. The position has been filled.",
    actionUrl: "/applicant/interviews",
    meta: { companyName: "DataFlow Systems" },
  },
  {
    id: "7",
    type: "rejected",
    recipient: "applicant",
    isRead: true,
    createdAt: "2026-03-10T09:00:00Z",
    title: "Application Update",
    body: "Thank you for applying to Backend Developer at DataFlow Systems. We've decided to move forward with other candidates.",
    actionUrl: "/applicant",
    meta: { jobTitle: "Backend Developer", companyName: "DataFlow Systems" },
  },
];

const DUMMY_COMPANY: NotificationDTO[] = [
  {
    id: "c1",
    type: "new_applicant",
    recipient: "company",
    isRead: false,
    createdAt: "2026-03-25T09:30:00Z",
    title: "New Application Received",
    body: "Alex Johnson applied for Senior Software Engineer. AI Match Score: 95%.",
    actionUrl: "/company",
    meta: {
      candidateName: "Alex Johnson",
      jobTitle: "Senior Software Engineer",
    },
  },
  {
    id: "c2",
    type: "new_applicant",
    recipient: "company",
    isRead: false,
    createdAt: "2026-03-25T07:00:00Z",
    title: "New Application Received",
    body: "Maria Garcia applied for Full Stack Developer. AI Match Score: 92%.",
    actionUrl: "/company",
    meta: { candidateName: "Maria Garcia", jobTitle: "Full Stack Developer" },
  },
  {
    id: "c3",
    type: "interview_scheduled",
    recipient: "company",
    isRead: false,
    createdAt: "2026-03-24T15:00:00Z",
    title: "Interview Confirmed",
    body: "Interview with Alex Johnson for Senior Software Engineer is confirmed for Mar 25 at 10:00 AM.",
    actionUrl: "/company/interviews",
    meta: {
      candidateName: "Alex Johnson",
      interviewDate: "Mar 25, 2026 · 10:00 AM",
    },
  },
  {
    id: "c4",
    type: "interview_cancelled",
    recipient: "company",
    isRead: true,
    createdAt: "2026-03-22T10:00:00Z",
    title: "Interview Cancelled by Applicant",
    body: "Emily Brown cancelled her HR interview for UI/UX Developer.",
    actionUrl: "/company/interviews",
    meta: { candidateName: "Emily Brown", jobTitle: "UI/UX Developer" },
  },
  {
    id: "c5",
    type: "job_published",
    recipient: "company",
    isRead: true,
    createdAt: "2026-03-20T08:00:00Z",
    title: "Job Post Published",
    body: "Senior Software Engineer is now live and visible to applicants.",
    actionUrl: "/company/jobs",
    meta: { jobTitle: "Senior Software Engineer" },
  },
  {
    id: "c6",
    type: "hired",
    recipient: "company",
    isRead: true,
    createdAt: "2026-03-15T16:00:00Z",
    title: "Candidate Hired",
    body: "Thomas Moore has been successfully marked as Hired for DevOps Engineer.",
    actionUrl: "/company",
    meta: { candidateName: "Thomas Moore", jobTitle: "DevOps Engineer" },
  },
];

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  interview_scheduled: <Video size={16} />,
  interview_rescheduled: <Clock size={16} />,
  interview_cancelled: <X size={16} />,
  status_changed: <ArrowRight size={16} />,
  feedback_submitted: <MessageSquare size={16} />,
  job_published: <Briefcase size={16} />,
  job_closed: <Briefcase size={16} />,
  new_applicant: <Users size={16} />,
  offer_sent: <Gift size={16} />,
  hired: <CheckCircle size={16} />,
  rejected: <X size={16} />,
};

const TYPE_ICON_CLASS: Record<NotificationType, string> = {
  interview_scheduled: "nt-icon--interview",
  interview_rescheduled: "nt-icon--job",
  interview_cancelled: "nt-icon--rejection",
  status_changed: "nt-icon--status",
  feedback_submitted: "nt-icon--feedback",
  job_published: "nt-icon--job",
  job_closed: "nt-icon--job",
  new_applicant: "nt-icon--applicant",
  offer_sent: "nt-icon--offer",
  hired: "nt-icon--feedback",
  rejected: "nt-icon--rejection",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function groupByDate(
  items: NotificationDTO[],
): { label: string; items: NotificationDTO[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yday = new Date(today.getTime() - 86400000);

  const groups: Record<string, NotificationDTO[]> = {};

  items.forEach((n) => {
    const d = new Date(n.createdAt);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    let label = "";
    if (day.getTime() === today.getTime()) label = "Today";
    else if (day.getTime() === yday.getTime()) label = "Yesterday";
    else
      label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

const FILTER_TABS: Array<{ id: FilterTab; label: string }> = [
  { id: "All", label: "All" },
  { id: "Unread", label: "Unread" },
  { id: "interview_scheduled", label: "Interviews" },
  { id: "status_changed", label: "Status" },
  { id: "feedback_submitted", label: "Feedback" },
  { id: "new_applicant", label: "Applicants" },
  { id: "job_published", label: "Jobs" },
];

/* ════════════════════════════════════════════════════════════
   NOTIFICATION ITEM (shared by dropdown + full page)
════════════════════════════════════════════════════════════ */
interface NotifItemProps {
  notif: NotificationDTO;
  onRead: (id: string) => void;
  onNavigate: (url?: string) => void;
  compact?: boolean;
}

export function NotifItem({
  notif,
  onRead,
  onNavigate,
  compact,
}: NotifItemProps) {
  function handleClick() {
    if (!notif.isRead) onRead(notif.id);
    onNavigate(notif.actionUrl);
  }

  return (
    <div
      className={`nt-item ${notif.isRead ? "" : "nt-item--unread"}`}
      onClick={handleClick}
    >
      <div className={`nt-icon ${TYPE_ICON_CLASS[notif.type]}`}>
        {TYPE_ICON[notif.type]}
      </div>

      <div className="nt-content">
        <div
          className="nt-title"
          dangerouslySetInnerHTML={{ __html: notif.title }}
        />
        {!compact && (
          <div
            style={{
              fontSize: ".8rem",
              color: "var(--muted)",
              lineHeight: 1.55,
              marginBottom: ".25rem",
            }}
          >
            {notif.body}
          </div>
        )}
        <div className="nt-meta">
          <Clock size={11} />
          {timeAgo(notif.createdAt)}
          {notif.meta?.companyName && (
            <>
              <span>·</span>
              {notif.meta.companyName}
            </>
          )}
          {notif.meta?.jobTitle && (
            <>
              <span>·</span>
              {notif.meta.jobTitle}
            </>
          )}
        </div>
      </div>

      {!notif.isRead && <div className="nt-dot" />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   BELL DROPDOWN  (used in app headers)
════════════════════════════════════════════════════════════ */
interface NotifBellProps {
  notifications: NotificationDTO[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewAll: () => void;
}

export function NotifBell({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
}: NotifBellProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleNavigate(url?: string) {
    setOpen(false);
    if (url) navigate(url);
  }

  return (
    <div className="nt-bell-wrap" ref={ref}>
      <button className="nt-bell-btn" onClick={() => setOpen((o) => !o)}>
        <Bell size={18} />
      </button>
      {unread > 0 && (
        <span className="nt-badge">{unread > 9 ? "9+" : unread}</span>
      )}

      {open && (
        <div className="nt-dropdown asi">
          <div className="nt-dropdown-header">
            <span className="nt-dropdown-title">
              Notifications{" "}
              {unread > 0 && (
                <span style={{ color: "var(--primary)", fontWeight: 800 }}>
                  ({unread})
                </span>
              )}
            </span>
            {unread > 0 && (
              <button className="nt-mark-all" onClick={onMarkAllRead}>
                <Check
                  size={12}
                  style={{ marginRight: ".25rem", verticalAlign: "middle" }}
                />
                Mark all read
              </button>
            )}
          </div>

          <div className="nt-dropdown-list">
            {notifications.length === 0 ? (
              <div className="nt-empty" style={{ padding: "2rem 1rem" }}>
                <div className="nt-empty-icon">
                  <Bell size={20} />
                </div>
                <div className="nt-empty-title">All caught up!</div>
              </div>
            ) : (
              notifications
                .slice(0, 6)
                .map((n) => (
                  <NotifItem
                    key={n.id}
                    notif={n}
                    onRead={onMarkRead}
                    onNavigate={handleNavigate}
                    compact
                  />
                ))
            )}
          </div>

          <div className="nt-dropdown-footer">
            <button
              className="nt-see-all"
              onClick={() => {
                setOpen(false);
                onViewAll();
              }}
            >
              View all notifications{" "}
              <ArrowRight
                size={12}
                style={{ marginLeft: ".25rem", verticalAlign: "middle" }}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FULL PAGE COMPONENT
════════════════════════════════════════════════════════════ */
interface NotificationsPageProps {
  /** "applicant" or "company" — controls which data + filters show */
  role: NotificationRecipient;
}

export default function NotificationsPage({ role }: NotificationsPageProps) {
  const navigate = useNavigate();
  // const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  // Use role-specific dummy data (swap with API)
  const [notifications, setNotifications] = useState<NotificationDTO[]>(
    role === "applicant" ? DUMMY_APPLICANT : DUMMY_COMPANY,
  );

  // useEffect(() => {
  //   const fn = () => setScrolled(window.scrollY > 16);
  //   window.addEventListener("scroll", fn);
  // TODO: replace with API call
  // loadNotifications();
  //   return () => window.removeEventListener("scroll", fn);
  // }, []);

  /* ── Counts ─────────────────────────────────────────────── */
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ── Filter ─────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "All") return true;
      if (activeTab === "Unread") return !n.isRead;
      // group similar types
      if (activeTab === "interview_scheduled")
        return n.type.startsWith("interview");
      if (activeTab === "job_published") return n.type.startsWith("job");
      return n.type === activeTab;
    });
  }, [notifications, activeTab]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  /* ── Actions ─────────────────────────────────────────────── */
  function markRead(id: string) {
    setNotifications((p) =>
      p.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    // TODO: PATCH /notifications/:id/read
  }

  function markAllRead() {
    setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
    // TODO: PATCH /notifications/read-all
  }

  function handleNavigate(url?: string) {
    if (url) navigate(url);
  }

  /* ── Render ──────────────────────────────────────────────── */
  // const backPath = role === "applicant" ? "/applicant" : "/company";

  return (
    <div className="nt-page">
      {/* HEADER */}
      {role === "applicant" ? <ApplicantNavbar /> : <CompanyNavbar />}

      <main className="nt-main">
        {/* Page heading */}
        <div className="d-flex align-items-start justify-content-between mb-4 au">
          <div>
            <h1 className="nt-page-title">Notifications</h1>
            <p className="nt-page-sub">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              className="nt-btn nt-btn--outline nt-btn--sm"
              onClick={markAllRead}
            >
              <Check size={13} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="nt-tabs mb-4 au d1">
          {FILTER_TABS
            // hide "Applicants" tab for applicant role, hide "Feedback" for company
            .filter((t) => {
              if (role === "applicant" && t.id === "new_applicant")
                return false;
              return true;
            })
            .map((t) => {
              const count =
                t.id === "All"
                  ? notifications.length
                  : t.id === "Unread"
                    ? unreadCount
                    : notifications.filter((n) => {
                        if (t.id === "interview_scheduled")
                          return n.type.startsWith("interview");
                        if (t.id === "job_published")
                          return n.type.startsWith("job");
                        return n.type === t.id;
                      }).length;
              return (
                <button
                  key={t.id}
                  className={`nt-tab ${activeTab === t.id ? "nt-tab--active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.label}
                  {count > 0 && <span className="nt-tab-count">{count}</span>}
                </button>
              );
            })}
        </div>

        {/* Notifications list */}
        {grouped.length === 0 ? (
          <div className="nt-empty au d2">
            <div className="nt-empty-icon">
              <Bell size={22} />
            </div>
            <div className="nt-empty-title">No notifications</div>
            <span style={{ fontSize: ".84rem" }}>
              {activeTab === "Unread"
                ? "You've read everything!"
                : "Nothing here yet."}
            </span>
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={group.label} className={`au d${Math.min(gi + 1, 4)}`}>
              <div className="nt-group-label">{group.label}</div>
              <div className="nt-card">
                {group.items.map((n) => (
                  <NotifItem
                    key={n.id}
                    notif={n}
                    onRead={markRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
