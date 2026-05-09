// components/Footer.tsx
import { Link, useNavigate } from "react-router-dom";
import { FaTwitter, FaLinkedinIn, FaGithub, FaFacebookF } from "react-icons/fa";

const companyLinks = [
  { label: "Post a Job", to: "/company/post-job" },
  { label: "Find Talent", to: "/company/search" },
  { label: "Dashboard", to: "/company/dashboard" },
  { label: "Pricing", to: "/company/pricing" },
];

const applicantLinks = [
  { label: "Browse Jobs", to: "/jobs" },
  { label: "My Profile", to: "/applicant/profile" },
  { label: "My Applications", to: "/applicant/applications" },
  { label: "Job Alerts", to: "/applicant/alerts" },
];

const companyInfoLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer__top">
        {/* Brand */}
        <div className="footer__brand">
          <div
            className="navbar__logo mb-3"
            onClick={() => navigate("/dashboard")}
          >
            <div className="navbar__logo-box">H</div>
            <span className="navbar__logo-name text-white">Hakeem</span>
          </div>

          <p className="footer__desc">
            The smart hiring platform connecting top talent with the best
            companies.
          </p>

          <div className="footer__socials">
            <a href="#" aria-label="Twitter" className="footer__social-btn">
              <FaTwitter />
            </a>

            <a href="#" aria-label="LinkedIn" className="footer__social-btn">
              <FaLinkedinIn />
            </a>

            <a href="#" aria-label="Github" className="footer__social-btn">
              <FaGithub />
            </a>

            <a href="#" aria-label="Facebook" className="footer__social-btn">
              <FaFacebookF />
            </a>
          </div>
        </div>

        {/* Companies */}
        <div className="footer__col">
          <h3 className="footer__col-title">For Companies</h3>

          <ul className="footer__links">
            {companyLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Applicants */}
        <div className="footer__col">
          <h3 className="footer__col-title">For Applicants</h3>

          <ul className="footer__links">
            {applicantLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div className="footer__col">
          <h3 className="footer__col-title">Company</h3>

          <ul className="footer__links">
            {companyInfoLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">
          © {new Date().getFullYear()} <span>Hakeem</span>. All rights reserved.
        </p>

        <span className="footer__badge">Made with ♥ in Egypt</span>
      </div>
    </footer>
  );
}
