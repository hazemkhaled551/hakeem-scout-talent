import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { UserProvider } from "./contexts/UserContext";

import { PublicRoutes } from "./routes/publicRoutes";
import { ApplicantRoutes } from "./routes/applicantRoutes";
import { CompanyRoutes } from "./routes/companyRoutes";

import NotificationsPage from "./pages/Public/Notifications/Notifications";
import NotFound from "./pages/Public/Errors/NotFound";
import Unauthorized from "./pages/Public/Errors/Unauthorized";
import { AdminRoutes } from "./routes/adminRoutes";

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            {PublicRoutes()}

            {ApplicantRoutes()}
            {CompanyRoutes()}
            {AdminRoutes()}
            <Route
              path="/notification"
              element={<NotificationsPage role="company" />}
            />
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}
