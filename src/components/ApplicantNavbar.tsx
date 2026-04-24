import { NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import "../styles/navbar.css";
import { useAuth } from "../contexts/AuthContext";

const applicantLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Jobs", to: "/jobs" },
  { label: "Interviews", to: "/applicant/interview" },
  { label: "Offers", to: "/applicant/offers" },
];

export default function ApplicantNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAuth();

  const handleLogout = (navigate: ReturnType<typeof useNavigate>) => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar__inner">
          {/* Logo */}
          <div className="navbar__logo" onClick={() => navigate("/dashboard")}>
            <div className="navbar__logo-box">H</div>
            <span className="navbar__logo-name">Hakeem</span>
          </div>

          {/* Desktop links */}
          <div className="navbar__links">
            {applicantLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `navbar__link${isActive ? " navbar__link--active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="navbar__right">
            <button
              className="navbar__notif-btn"
              onClick={() => navigate("/notification")}
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>

            <div
              className="navbar__avatar navbar__avatar--purple"
              onClick={() => navigate("/applicant/profile")}
              role="button"
              aria-label="Profile"
            >
              AP
            </div>
            <button
              className="navbar__logout-btn"
              onClick={() => handleLogout(navigate)}
              aria-label="Logout"
            >
              <LogOut size={16} />
            </button>

            <button
              className={`navbar__hamburger${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar__mobile-menu${menuOpen ? " open" : ""}`}>
        {applicantLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `navbar__link${isActive ? " navbar__link--active" : ""}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}
