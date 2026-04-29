// ApplicantLayout.tsx
import { Outlet } from "react-router-dom";
import ApplicantNavbar from "../components/ApplicantNavbar";
import Footer from "../components/Footer";

export default function ApplicantLayout() {
  return (
    <div className="applicant-layout">
      <main>
        <ApplicantNavbar />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
