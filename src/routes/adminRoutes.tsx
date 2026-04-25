import { Route } from "react-router-dom";
import AdminDashboard from "../pages/Admin/Admindashboard";
import AdminSubscriptions from "../pages/Admin/AdminSubscriptions";
import AdminUsers from "../pages/Admin/Adminusers";
import AdminAnalytics from "../pages/Admin/Adminanalytics";
import AdminCompanies from "../pages/Admin/Admincompanies";
import AdminJobs from "../pages/Admin/Adminjobs";
import AdminPayments from "../pages/Admin/Adminpayments";
import AdminSettings from "../pages/Admin/Adminsettings";
import AdminCompanyPlans from "../pages/Admin/Admincompanyplans";
import AdminAdmins from "../pages/Admin/Adminadmins";
import AdminRoles from "../pages/Admin/Adminroles";

export const AdminRoutes = () => (
  <>
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/users" element={<AdminUsers />} />
    <Route path="/admin/plans" element={<AdminCompanyPlans />} />
    <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
    <Route path="/admin/admins" element={<AdminAdmins />} />
    <Route path="/admin/roles" element={<AdminRoles />} />
    <Route path="/admin/companies" element={<AdminCompanies />} />
    <Route path="/admin/jobs" element={<AdminJobs />} />
    <Route path="/admin/payments" element={<AdminPayments />} />
    <Route path="/admin/analytics" element={<AdminAnalytics />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
  </>
);
