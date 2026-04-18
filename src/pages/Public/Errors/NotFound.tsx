import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./error-pages.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page d-flex align-items-center justify-content-center">
      <div className="error-card text-center p-5">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Page Not Found</h2>
        <p className="error-text">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        <button
          className="btn btn-primary custom-btn mt-4"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
