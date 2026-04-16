import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import LandingPage from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import ApplicantDashboard from "./pages/Applicantdashboard/Applicantdashboard";
import ApplicantProfile from "./pages/Applicantprofile/Applicantprofile";
import JobList from "./pages/Joblist/Joblist";
import JobDetails from "./pages/Jobdetails/Jobdetails";
import JobApplication from "./pages/Jobapplication/Jobapplication";
import { UserProvider } from "./contexts/UserContext";
import CompanyDashboard from "./pages/Companydashboard/Companydashboard";
import CompanyProfile from "./pages/CompanyProfile/CompanyProfile";
import CompanyJobs from "./pages/Companyjobs/Companyjobs";
import CandidateEvaluation from "./pages/Candidateevaluation/Candidateevaluation";
import CompanyInterviews from "./pages/Companyinterviews/Companyinterviews";
import ApplicantInterviews from "./pages/Applicantinterviews/Applicantinterviews";
import NotificationsPage from "./pages/Notifications/Notifications";
import VerifyEmail from "./pages/Verifyemail/Verifyemail";
import ResetPassword from "./pages/Resetpassword/Resetpassword";
import ForgotPasswordPage from "./pages/Forgotpasswordpage/Forgotpasswordpage";
import SelectRolePage from "./pages/Selectrolepage/Selectrolepage";
import RestoreAccount from "./pages/RestoreAccount/RestoreAccount";
import RequestRestore from "./pages/RestoreAccount/RestoreAccountRequest";
import ApplicationStatus from "./pages/Applicationstatus/Applicationstatus";
import GoogleCallback from "./pages/Googlecallback/Googlecallback";
import CandidatePipeline from "./pages/Candidatepipeline/Candidatepipeline";
import CompanyOffers from "./pages/Offers/Companyoffers";
import ApplicantOffers from "./pages/Offers/Applicantoffers";
import CandidateSuggestions from "./pages/Candidatesuggestions/Candidatesuggestions";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/Errors/NotFound";
import Unauthorized from "./pages/Errors/Unauthorized";
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forget-password" element={<ForgotPasswordPage />} />
            <Route path="/request-restore" element={<RequestRestore />} />
            <Route path="/restore-email" element={<RestoreAccount />} />
            <Route path="/select-role" element={<SelectRolePage />} />
            /* ================= PROTECTED ROUTES for APPLICANT
            ================= */
            <Route element={<ProtectedRoute allowedRoles={"Applicant"} />}>
              <Route path="/applicant/profile" element={<ApplicantProfile />} />
              <Route path="/dashboard" element={<ApplicantDashboard />} />
              <Route path="/applicant/offers" element={<ApplicantOffers />} />

              <Route
                path="/applicant/interview"
                element={<ApplicantInterviews />}
              />
              <Route
                path="/applicant/app-status/:id"
                element={<ApplicationStatus />}
              />
              <Route path="/jobs" element={<JobList />} />

              <Route path="/jobs/:jobId/apply" element={<JobApplication />} />
            </Route>
            /* ================= PROTECTED ROUTES for COMPANY =================
            */
            <Route element={<ProtectedRoute allowedRoles={"Company"} />}>
              <Route path="/company/dashboard" element={<CompanyDashboard />} />
              <Route path="/company/profile" element={<CompanyProfile />} />
              <Route path="/company/jobs" element={<CompanyJobs />} />
              <Route
                path="/company/interviews"
                element={<CompanyInterviews />}
              />
              <Route
                path="/company/candidateevaluation/:id"
                element={<CandidateEvaluation />}
              />
              <Route path="/company/offers" element={<CompanyOffers />} />
              <Route
                path="/company/jobs/candidates"
                element={<CandidateSuggestions />}
              />
              <Route path="/company/pipeline" element={<CandidatePipeline />} />
            </Route>
            <Route
              path="/notification"
              element={<NotificationsPage role="company" />}
            />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}
