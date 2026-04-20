import { Route } from "react-router-dom";
import AdminDashboard from "../pages/Admin/Admindashboard";
import AdminPlans from "../pages/Admin/Adminplans";
import AdminUsers from "../pages/Admin/Adminusers";
import AdminAnalytics from "../pages/Admin/Adminanalytics";
import AdminCompanies from "../pages/Admin/Admincompanies";
import AdminJobs from "../pages/Admin/Adminjobs";
import AdminPayments from "../pages/Admin/Adminpayments";
import AdminSettings from "../pages/Admin/Adminsettings";

export const AdminRoutes = () => (
  <>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/plans" element={<AdminPlans />} />
    <Route path="/admin/companies" element={<AdminCompanies />} />
    <Route path="/admin/jobs" element={<AdminJobs />} />
    <Route path="/admin/payments" element={<AdminPayments />} />
    <Route path="/admin/analytics" element={<AdminAnalytics />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
  </>
);
