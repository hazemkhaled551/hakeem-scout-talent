import { Navigate, Outlet } from "react-router-dom";

interface Props {
  allowedRoles: string;
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const raw = localStorage.getItem("user");
  
  const user = raw ? JSON.parse(raw) : null;
  console.log(user.role);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
