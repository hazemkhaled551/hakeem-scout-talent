import { useState, useRef } from "react";
import { Share2, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import {
  shareApplicantProfile,
  shareCompanyProfile,
} from "../services/profileService";
import { createPortal } from "react-dom";

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
interface ShareProfileButtonProps {
  role: "applicant" | "company";
  /** Visual variant — use "outline" inside profile cards, "primary" for standalone */
  variant?: "outline" | "primary" | "ghost";
  size?: "sm" | "md";
  className?: string;
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function ShareProfileButton({
  role,
  variant = "outline",
  size = "sm",
  className = "",
}: ShareProfileButtonProps) {
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const rect = buttonRef.current?.getBoundingClientRect();

  const popoverStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.right - 300, // نفس عرض البوكس
        zIndex: 1000000,
        background: "#fff",
        borderRadius: 14,
        border: "1px solid var(--border,#e2e0f5)",
        boxShadow: "0 12px 40px rgba(79,70,229,.14)",
        padding: "1rem",
        width: 300,
        animation: "fadeUp .25s ease",
      }
    : {};

  /* ── Get or reuse slug ──────────────────────────────────── */
  async function handleShare() {
    setError(null);

    // If we already have the slug, just open the popover
    if (slug) {
      setOpen(true);
      return;
    }

    try {
      setLoading(true);
      const res =
        role === "applicant"
          ? await shareApplicantProfile()
          : await shareCompanyProfile();

      // API returns: { success, data: { slug: "abc123" } }
      const returnedSlug = res.data?.data?.slug ?? res.data?.slug;
      if (!returnedSlug) throw new Error("No slug returned");

      setSlug(returnedSlug);
      setOpen(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? "Failed to generate share link.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Copy to clipboard ──────────────────────────────────── */
  function copyLink() {
    if (!slug) return;
    const url = `${window.location.origin}/profile/${role}/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  /* ── Open profile page ──────────────────────────────────── */
  function openProfile() {
    if (!slug) return;
    window.open(`/profile/${role}/${slug}`, "_blank", "noreferrer");
  }

  const profileUrl = slug
    ? `${window.location.origin}/profile/${role}/${slug}`
    : "";

  /* ── Base button styles ─────────────────────────────────── */
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: ".32rem",
    fontFamily: "Syne, sans-serif",
    fontWeight: 600,
    fontSize: size === "sm" ? ".78rem" : ".88rem",
    padding: size === "sm" ? ".32rem .78rem" : ".52rem 1.1rem",
    borderRadius: 10,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all .2s",
    ...(variant === "outline"
      ? {
          background: "transparent",
          border: "1.5px solid var(--border, #e2e0f5)",
          color: "var(--muted, #64748b)",
        }
      : variant === "primary"
        ? {
            background:
              "linear-gradient(135deg, var(--primary,#4f46e5), #3730a3)",
            border: "none",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(79,70,229,.28)",
          }
        : {
            background: "transparent",
            border: "none",
            color: "var(--muted, #64748b)",
          }),
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      className={className}
    >
      {/* Trigger button */}
      <button
        ref={buttonRef}
        style={{ ...baseStyle, opacity: loading ? 0.65 : 1 }}
        onClick={handleShare}
        disabled={loading}
        onMouseEnter={(e) => {
          if (variant === "outline") {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--primary,#4f46e5)";
            (e.currentTarget as HTMLElement).style.color =
              "var(--primary,#4f46e5)";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "outline") {
            (e.currentTarget as HTMLElement).style.borderColor =
              "var(--border,#e2e0f5)";
            (e.currentTarget as HTMLElement).style.color =
              "var(--muted,#64748b)";
          }
        }}
      >
        {loading ? (
          <Loader2
            size={13}
            style={{ animation: "spin .7s linear infinite" }}
          />
        ) : (
          <Share2 size={13} />
        )}
        {loading ? "Generating…" : "Share Profile"}
      </button>

      {/* Error */}
      {error && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            zIndex: 99999999,
            background: "rgba(239,68,68,.07)",
            border: "1px solid rgba(239,68,68,.2)",
            borderRadius: 10,
            padding: ".55rem .8rem",
            fontSize: ".76rem",
            color: "#991b1b",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 16px rgba(0,0,0,.1)",
          }}
        >
          {error}
        </div>
      )}

      {/* Share popover */}
      {open &&
        slug &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 999999,
              }}
              onClick={() => setOpen(false)}
            />

            {/* Popover */}
            <div style={popoverStyle}>
              <div
                style={{
                  fontFamily: "Syne",
                  fontWeight: 700,
                  fontSize: ".88rem",
                  marginBottom: ".65rem",
                }}
              >
                <ExternalLink /> Share Your Profile
              </div>

              {/* URL */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".4rem",
                  background: "var(--surface,#f8f7ff)",
                  borderRadius: 9,
                  border: "1px solid var(--border,#e2e0f5)",
                  padding: ".42rem .55rem .42rem .8rem",
                  marginBottom: ".75rem",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: ".74rem",
                    color: "var(--muted,#64748b)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {profileUrl}
                </span>

                <button
                  onClick={copyLink}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".25rem",
                    background: copied
                      ? "rgba(16,185,129,.1)"
                      : "var(--primary,#4f46e5)",
                    color: copied ? "#065f46" : "#fff",
                    border: "none",
                    borderRadius: 7,
                    cursor: "pointer",
                    padding: ".28rem .65rem",
                    fontFamily: "Syne",
                    fontWeight: 700,
                    fontSize: ".72rem",
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: ".5rem" }}>
                <button
                  onClick={openProfile}
                  style={{
                    flex: 1,
                    padding: ".45rem",
                    border: "1.5px solid var(--border,#e2e0f5)",
                    borderRadius: 9,
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: ".78rem",
                  }}
                >
                  Preview
                </button>

                <button
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    padding: ".45rem",
                    border: "none",
                    borderRadius: 9,
                    background: "var(--surface,#f8f7ff)",
                    cursor: "pointer",
                    fontSize: ".78rem",
                  }}
                >
                  Done
                </button>
              </div>

              <div
                style={{
                  fontSize: ".7rem",
                  color: "var(--muted,#64748b)",
                  marginTop: ".65rem",
                }}
              >
                Anyone with this link can view your public profile.
              </div>
            </div>
          </>,
          document.body,
        )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
