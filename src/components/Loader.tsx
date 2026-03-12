import React from "react";
import "../styles/theme.css";

interface LoaderProps {
  fullPage?: boolean;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullPage = false, text }) => {
  return (
    <div
      className="loader-wrapper"
      style={fullPage ? { minHeight: "100vh" } : {}}
    >
      <div className="text-center">
        <div className="loader-spinner"></div>

        {text && <p className="mt-3 text-muted">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
