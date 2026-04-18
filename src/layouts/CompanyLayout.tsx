import { Outlet } from "react-router-dom";

export default function CompanyLayout() {
  return (
    <div className="company-layout">
      {/* Sidebar */}
     

      <main>
       

        <Outlet />
      </main>
    </div>
  );
}
