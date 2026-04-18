import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./error-pages.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page d-flex align-items-center justify-content-center">
      <div className="error-card text-center p-5">
        <h1 className="error-code">401</h1>
        <h2 className="error-title">Unauthorized</h2>
        <p className="error-text">
          You don’t have permission to access this page.
        </p>

        <div className="d-flex gap-3 justify-content-center mt-4">
          <button
            className="btn btn-primary custom-btn"
            onClick={() => navigate("/auth")}
          >
            Login
          </button>

          <button
            className="btn btn-outline-secondary custom-outline"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
