import { useEffect } from "react";
import { X } from "lucide-react";
import "./Modal.css";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the user closes the modal (X button or overlay click) */
  onClose: () => void;
  /** Modal title text (required) */
  title: string;
  /** Optional lucide icon rendered before the title */
  icon?: React.ReactNode;
  /** Width preset: sm = 400px | md = 560px (default) | lg = 720px */
  size?: "sm" | "md" | "lg";
  /** Footer content — usually action buttons */
  footer?: React.ReactNode;
  /** Body content */
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Modal({
  open,
  onClose,
  title,
  icon,
  size = "md",
  footer,
  children,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="hk-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`hk-modal hk-modal--${size}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="hk-modal-header">
          <span className="hk-modal-title">
            {icon && icon}
            {title}
          </span>
          <button
            className="hk-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="hk-modal-body">{children}</div>

        {/* Footer (optional) */}
        {footer && <div className="hk-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
