import React from "react";
import "../styles/theme.css";

// ─── Props ────────────────────────────────────────────────────────────────────
interface LoaderProps {
  /** Takes up the full viewport and sits above everything */
  fullPage?: boolean;
  /** Message shown below the spinner — animated dots are appended automatically */
  text?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
const Loader: React.FC<LoaderProps> = ({
  fullPage = false,
  text = "Loading",
}) => {
  return (
    <div
      className={`hk-loader-wrapper ${fullPage ? "hk-loader-wrapper--fullpage" : ""}`}
    >
      <div className="hk-loader-core">
        {/* ── Spinner ─────────────────────────────────────── */}
        <div className="hk-spinner">
          <div className="hk-spinner-pulse" />
          <div className="hk-spinner-track" />
          <div className="hk-spinner-arc" />
          <div className="hk-spinner-dot" />
          <div className="hk-spinner-brand">H</div>
        </div>

        {/* ── Label ───────────────────────────────────────── */}
        {text && (
          <span className="hk-loader-text">
            {text}
            <span className="hk-loader-dots">
              <span />
              <span />
              <span />
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Loader;
