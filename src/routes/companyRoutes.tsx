import { Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import CompanyDashboard from "../pages/Company/Companydashboard/Companydashboard";
import CompanyProfile from "../pages/Company/CompanyProfile/CompanyProfile";
import CompanyJobs from "../pages/Company/Companyjobs/Companyjobs";
import CompanyInterviews from "../pages/Company/Companyinterviews/Companyinterviews";
import CandidateEvaluation from "../pages/Company/Candidateevaluation/Candidateevaluation";
import CompanyOffers from "../pages/Public/Offers/Companyoffers";
import CandidateSuggestions from "../pages/Company/Candidatesuggestions/Candidatesuggestions";
import CandidatePipeline from "../pages/Company/Candidatepipeline/Candidatepipeline";
import CompanyLayout from "../layouts/CompanyLayout";

export const CompanyRoutes = () => (
  <Route element={<ProtectedRoute allowedRoles={"Company"} />}>
    <Route element={<CompanyLayout />}>
      <Route path="/company/dashboard" element={<CompanyDashboard />} />
      <Route path="/company/profile" element={<CompanyProfile />} />
      <Route path="/company/jobs" element={<CompanyJobs />} />
      <Route path="/company/interviews" element={<CompanyInterviews />} />
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
  </Route>
);
