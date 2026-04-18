import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");

      if (token) {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (user?.role === "Applicant") {
          setRedirectTo("/dashboard");
        } else if (user?.role === "Company") {
          setRedirectTo("/company/dashboard");
        }
      }
    }, 2000); // 5 ثواني

    return () => clearTimeout(timer);
  }, []);

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default AuthRoute;
