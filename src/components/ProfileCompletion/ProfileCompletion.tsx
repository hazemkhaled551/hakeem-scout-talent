import { CheckCircle, AlertCircle } from "lucide-react";

interface CompletionProps {
  percentage: number;
  sections: Record<string, boolean>;
  title?: string;
  subtitle?: string;
}

export default function ProfileCompletion({
  percentage,
  sections,
  title = "Complete Your Profile",
  subtitle = "Complete your profile to get better results",
}: CompletionProps) {
  function formatLabel(key: string) {
    switch (key) {
      case "basicInfo":
        return "Basic Info";
      case "skillsCompleted":
        return "Skills";
      case "experienceCompleted":
        return "Experience";
      default:
        return key;
    }
  }

  return (
    <div className="pr-card pr-completion-card">
      <div className="pr-card-body">
        <div className="d-flex align-items-start justify-content-between mb-1">
          <div>
            <div className="pr-card-title" style={{ fontSize: "1rem" }}>
              {title}
            </div>
            <div
              style={{
                fontSize: "0.83rem",
                color: "var(--muted)",
                marginTop: "0.15rem",
              }}
            >
              {subtitle}
            </div>
          </div>

          <span className="pr-completion-badge">{percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="pr-progress-track">
          <div
            className="pr-progress-fill"
            style={
              {
                "--fill": `${percentage}%`,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Sections */}
        <div className="row g-2">
          {Object.entries(sections).map(([key, value]) => (
            <div key={key} className="col-auto">
              <div className="pr-check-item">
                {value ? (
                  <CheckCircle size={15} className="pr-check-done" />
                ) : (
                  <AlertCircle size={15} className="pr-check-pending" />
                )}
                {formatLabel(key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
