import { Route } from "react-router-dom";
import LandingPage from "../pages/Public/LandingPage/LandingPage";
import AuthPage from "../pages/Auth/AuthPage/AuthPage";
import VerifyEmail from "../pages/Auth/Verifyemail/Verifyemail";
import ResetPassword from "../pages/Auth/Resetpassword/Resetpassword";
import ForgotPasswordPage from "../pages/Auth/Forgotpasswordpage/Forgotpasswordpage";
import SelectRolePage from "../pages/Auth/Selectrolepage/Selectrolepage";
import RestoreAccount from "../pages/Auth/RestoreAccount/RestoreAccount";
import RequestRestore from "../pages/Auth/RestoreAccount/RestoreAccountRequest";
import GoogleCallback from "../pages/Auth/Googlecallback/Googlecallback";
import PublicProfile from "../pages/Public/Publicprofile/Publicprofile";
import JobDetails from "../pages/Public/Jobdetails/Jobdetails";
import AuthRoute from "./AuthRoute";
import Payment from "../pages/Public/Plans/Payment";
import Plans from "../pages/Public/Plans/Plans";

export const PublicRoutes = () => (
  <>
    <Route
      path="/"
      element={
        <AuthRoute>
          <LandingPage />
        </AuthRoute>
      }
    />
    <Route
      path="/auth"
      element={
        <AuthRoute>
          <AuthPage />
        </AuthRoute>
      }
    />

    <Route path="/auth/google/callback" element={<GoogleCallback />} />
    <Route path="/verify" element={<VerifyEmail />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/forget-password" element={<ForgotPasswordPage />} />
    <Route path="/request-restore" element={<RequestRestore />} />
    <Route path="/restore-email" element={<RestoreAccount />} />
    <Route path="/select-role" element={<SelectRolePage />} />

    <Route path="/jobs/:jobId" element={<JobDetails />} />
    <Route path="/profile/applicant/:id" element={<PublicProfile />} />
    <Route path="/profile/company/:id" element={<PublicProfile />} />

    <Route path="/company/plans" element={<Plans />} />
    <Route path="/company/payment" element={<Payment />} />
  </>
);
