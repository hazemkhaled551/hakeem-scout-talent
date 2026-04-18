import { Outlet } from "react-router-dom";

export default function ApplicantLayout() {
  return (
    <div className="applicant-layout">
      {/* Sidebar */}

      {/* Main content */}
      <main>
        {/* Navbar */}

        {/* Pages */}
        <Outlet />
      </main>
    </div>
  );
}
