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
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ApplicantDashboard />} />
            <Route path="/applicant/profile" element={<ApplicantProfile />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:jobId" element={<JobDetails />} />
            <Route path="/jobs/:id/apply" element={<JobApplication />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}
