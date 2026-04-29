// CompanyLayout.tsx
import { Outlet } from "react-router-dom";
import CompanyNavbar from "../components/CompanyNavbar";
import Footer from "../components/Footer";

export default function CompanyLayout() {
  return (
    <div className="company-layout">
      <main>
        <CompanyNavbar />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
