import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import ApplicantDashboard from "../pages/Applicant/Applicantdashboard/Applicantdashboard";
import ApplicantProfile from "../pages/Applicant/Applicantprofile/Applicantprofile";
import ApplicantInterviews from "../pages/Applicant/Applicantinterviews/Applicantinterviews";
import JobList from "../pages/Applicant/Joblist/Joblist";
import JobApplication from "../pages/Applicant/Jobapplication/Jobapplication";
import ApplicationStatus from "../pages/Applicant/Applicationstatus/Applicationstatus";
import ApplicantOffers from "../pages/Public/Offers/Applicantoffers";
import JobSuggestions from "../pages/Applicant/Jobsuggestions/Jobsuggestions";
import ApplicantLayout from "../layouts/ApplicantLayout";

export const ApplicantRoutes = () => (
  <Route element={<ProtectedRoute allowedRoles={"Applicant"} />}>
    <Route element={<ApplicantLayout />}>
      <Route path="/dashboard" element={<ApplicantDashboard />} />
      <Route path="/applicant/profile" element={<ApplicantProfile />} />
      <Route path="/applicant/offers" element={<ApplicantOffers />} />
      <Route path="/applicant/interview" element={<ApplicantInterviews />} />
      <Route path="/applicant/app-status/:id" element={<ApplicationStatus />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/suggestions" element={<JobSuggestions />} />
      <Route path="/jobs/:jobId/apply" element={<JobApplication />} />
    </Route>
  </Route>
);
