import { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Globe,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "../../layouts/Adminlayout";

/* ── Reusable field ──────────────────────────────────────── */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label
        style={{
          display: "block",
          fontSize: ".72rem",
          fontWeight: 700,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: ".05em",
          marginBottom: ".3rem",
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <div
          style={{
            fontSize: ".74rem",
            color: "var(--muted)",
            marginTop: ".28rem",
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ position: "relative" }}>
      <input
        type={isPass && show ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: ".62rem 1rem",
          paddingRight: isPass ? "2.5rem" : "1rem",
          border: "1.5px solid var(--border)",
          borderRadius: 10,
          fontFamily: "DM Sans, sans-serif",
          fontSize: ".9rem",
          color: "var(--text)",
          outline: "none",
          transition: "border-color .2s, box-shadow .2s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--primary)";
          e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,.09)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--border)";
          e.target.style.boxShadow = "none";
        }}
      />
      {isPass && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: "absolute",
            right: ".75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted)",
            display: "flex",
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: value ? "var(--primary)" : "var(--border)",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: value ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--white)",
        borderRadius: 16,
        border: "1px solid var(--border)",
        overflow: "hidden",
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          padding: ".9rem 1.4rem .8rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: ".45rem",
        }}
      >
        <span style={{ color: "var(--primary)" }}>{icon}</span>
        <span
          style={{ fontFamily: "Syne", fontWeight: 700, fontSize: ".95rem" }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "1.2rem 1.4rem" }}>{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════════ */
export default function AdminSettings() {
  const [saved, setSaved] = useState(false);

  /* General */
  const [siteName, setSiteName] = useState("Hakeem");
  const [supportEmail, setSupportEmail] = useState("support@hakeem.io");
  const [timezone, setTimezone] = useState("Africa/Cairo");

  /* Security */
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [twoFa, setTwoFa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");

  /* Notifications */
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [newUserAlert, setNewUserAlert] = useState(true);
  const [paymentAlert, setPaymentAlert] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  /* Platform */
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);
  const [maxJobs, setMaxJobs] = useState("3");
  const [maxApps, setMaxApps] = useState("15");

  function handleSave() {
    // 🔥 await updateAdminSettings({ ... });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const toggleRow = (
    label: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: ".55rem 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: ".86rem", color: "var(--text)" }}>{label}</span>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  return (
    <AdminLayout title="Settings" breadcrumb="Settings">
      <div className="row g-4">
        <div className="col-12 col-xl-8">
          {/* General */}
          <Section title="General" icon={<Settings size={15} />}>
            <div className="row g-3">
              <div className="col-12 col-sm-6">
                <Field label="Platform Name">
                  <Input
                    value={siteName}
                    onChange={setSiteName}
                    placeholder="Hakeem"
                  />
                </Field>
              </div>
              <div className="col-12 col-sm-6">
                <Field label="Support Email">
                  <Input
                    value={supportEmail}
                    onChange={setSupportEmail}
                    placeholder="support@hakeem.io"
                  />
                </Field>
              </div>
              <div className="col-12 col-sm-6">
                <Field label="Timezone" hint="Affects all date/time displays">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: ".62rem 1rem",
                      border: "1.5px solid var(--border)",
                      borderRadius: 10,
                      fontFamily: "DM Sans",
                      fontSize: ".9rem",
                      outline: "none",
                    }}
                  >
                    <option value="Africa/Cairo">Africa/Cairo (GMT+2)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="America/New_York">
                      America/New_York (GMT-5)
                    </option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                  </select>
                </Field>
              </div>
            </div>
          </Section>

          {/* Security */}
          <Section title="Security" icon={<Shield size={15} />}>
            <Field label="Current Password">
              <Input
                value={currentPass}
                onChange={setCurrentPass}
                type="password"
                placeholder="••••••••"
              />
            </Field>
            <Field label="New Password">
              <Input
                value={newPass}
                onChange={setNewPass}
                type="password"
                placeholder="Min. 8 characters"
              />
            </Field>
            <Field
              label="Session Timeout"
              hint="Admin session auto-logout after this many minutes"
            >
              <Input
                value={sessionTimeout}
                onChange={setSessionTimeout}
                placeholder="60"
              />
            </Field>
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: ".75rem",
              }}
            >
              {toggleRow("Two-Factor Authentication (2FA)", twoFa, setTwoFa)}
            </div>
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={<Bell size={15} />}>
            {toggleRow("Email alerts enabled", emailAlerts, setEmailAlerts)}
            {toggleRow(
              "Alert on new user signup",
              newUserAlert,
              setNewUserAlert,
            )}
            {toggleRow(
              "Alert on payment failure",
              paymentAlert,
              setPaymentAlert,
            )}
            {toggleRow(
              "Weekly analytics report via email",
              weeklyReport,
              setWeeklyReport,
            )}
          </Section>

          {/* Platform */}
          <Section title="Platform Controls" icon={<Globe size={15} />}>
            <div
              style={{
                background: "rgba(239,68,68,.05)",
                border: "1px solid rgba(239,68,68,.18)",
                borderRadius: 12,
                padding: ".85rem 1rem",
                marginBottom: "1rem",
                fontSize: ".84rem",
                color: "#991b1b",
              }}
            >
              ⚠️ Maintenance mode will make the platform inaccessible to all
              non-admin users.
            </div>
            {toggleRow("Maintenance Mode", maintenanceMode, setMaintenanceMode)}
            {toggleRow(
              "Allow New Registrations",
              allowSignups,
              setAllowSignups,
            )}
            <div style={{ marginTop: "1rem" }}>
              <div className="row g-3">
                <div className="col-6">
                  <Field label="Free Plan Max Jobs" hint="Default: 3">
                    <Input value={maxJobs} onChange={setMaxJobs} />
                  </Field>
                </div>
                <div className="col-6">
                  <Field
                    label="Free Plan Max Applications"
                    hint="Per job. Default: 15"
                  >
                    <Input value={maxApps} onChange={setMaxApps} />
                  </Field>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Right: Save card */}
        <div className="col-12 col-xl-4">
          <div
            style={{
              background: "var(--white)",
              borderRadius: 16,
              border: "1px solid var(--border)",
              padding: "1.4rem",
              position: "sticky",
              top: 80,
            }}
          >
            <div
              style={{
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: ".92rem",
                marginBottom: ".5rem",
              }}
            >
              Save Changes
            </div>
            <p
              style={{
                fontSize: ".83rem",
                color: "var(--muted)",
                lineHeight: 1.6,
                marginBottom: "1.2rem",
              }}
            >
              Review your changes before saving. Some settings may require a
              page refresh to take effect.
            </p>

            {saved && (
              <div
                style={{
                  background: "rgba(16,185,129,.07)",
                  border: "1px solid rgba(16,185,129,.2)",
                  borderRadius: 10,
                  padding: ".7rem .9rem",
                  fontSize: ".82rem",
                  color: "#065f46",
                  display: "flex",
                  alignItems: "center",
                  gap: ".4rem",
                  marginBottom: "1rem",
                }}
              >
                <CheckCircle size={14} /> Settings saved successfully.
              </div>
            )}

            <button
              className="adm-btn adm-btn--primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: ".72rem",
              }}
              onClick={handleSave}
            >
              <Save size={15} /> Save All Settings
            </button>
            <button
              className="adm-btn adm-btn--outline"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: ".72rem",
                marginTop: ".6rem",
              }}
              onClick={() => {
                setSiteName("Hakeem");
                setEmailAlerts(true);
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
