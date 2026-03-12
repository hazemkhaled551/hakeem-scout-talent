import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./LandingPage.css";
import { Trophy } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Candidate {
  name: string;
  role: string;
  score: number;
  colorVar: string;
  colorHex: string;
}
interface Stat {
  num: string;
  label: string;
}
interface Step {
  num: string;
  title: string;
  desc: string;
}
interface Feature {
  icon: string;
  bgClass: string;
  title: string;
  desc: string;
}
interface Testimonial {
  name: string;
  role: string;
  colorHex: string;
  stars: number;
  quote: string;
}
interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  featured: boolean;
}
interface FooterCol {
  title: string;
  links: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const candidates: Candidate[] = [
  {
    name: "Sarah Johnson",
    role: "Frontend Developer",
    score: 94,
    colorVar: "var(--primary)",
    colorHex: "#4f46e5",
  },
  {
    name: "Michael Chen",
    role: "Data Scientist",
    score: 91,
    colorVar: "var(--success)",
    colorHex: "#10b981",
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager",
    score: 88,
    colorVar: "var(--warning)",
    colorHex: "#f59e0b",
  },
];

const stats: Stat[] = [
  { num: "14k+", label: "Candidates Matched" },
  { num: "98%", label: "Satisfaction Rate" },
  { num: "3.2x", label: "Faster Hiring" },
  { num: "180+", label: "Companies Trust Us" },
];

const steps: Step[] = [
  {
    num: "01",
    title: "Post Your Job",
    desc: "Describe the role in natural language. Our AI extracts the key requirements automatically.",
  },
  {
    num: "02",
    title: "AI Scans CVs",
    desc: "Semantic analysis reads between the lines — matching skills, context, and culture fit.",
  },
  {
    num: "03",
    title: "Review & Hire",
    desc: "Get a ranked shortlist with bias alerts and detailed match explanations.",
  },
];

const features: Feature[] = [
  {
    icon: "🧠",
    bgClass: "bg-primary-soft",
    title: "Semantic AI Matching",
    desc: "Goes beyond keywords — understands context, synonyms, and transferable skills.",
  },
  {
    icon: "📄",
    bgClass: "bg-accent-soft",
    title: "Smart CV Parsing",
    desc: "Extracts skills, tenure, and achievements with 99.2% accuracy from any format.",
  },
  {
    icon: "⚖️",
    bgClass: "bg-success-soft",
    title: "Bias Detection",
    desc: "Real-time alerts flag gender, age, and origin bias before decisions are made.",
  },
  {
    icon: "📊",
    bgClass: "bg-warning-soft",
    title: "Analytics Dashboard",
    desc: "Track pipeline health, time-to-hire, and diversity metrics in one view.",
  },
  {
    icon: "🔗",
    bgClass: "bg-indigo-soft",
    title: "ATS Integration",
    desc: "One-click sync with Greenhouse, Lever, Workday, and 30+ other platforms.",
  },
  {
    icon: "🔒",
    bgClass: "bg-danger-soft",
    title: "GDPR Compliant",
    desc: "Enterprise-grade data protection with candidate consent management built in.",
  },
];

// feature icon background colours (kept here, not in CSS, since they're dynamic per-card)
const featureBg: Record<string, string> = {
  "bg-primary-soft": "rgba(79,70,229,.1)",
  "bg-accent-soft": "rgba(6,182,212,.1)",
  "bg-success-soft": "rgba(16,185,129,.1)",
  "bg-warning-soft": "rgba(245,158,11,.1)",
  "bg-indigo-soft": "rgba(99,102,241,.1)",
  "bg-danger-soft": "rgba(239,68,68,.08)",
};

const testimonials: Testimonial[] = [
  {
    name: "Layla Hassan",
    role: "Head of Talent, Noon",
    colorHex: "#4f46e5",
    stars: 5,
    quote:
      "Hakeem cut our time-to-offer from 6 weeks to 12 days. The bias reports alone are worth the subscription.",
  },
  {
    name: "James Okafor",
    role: "CTO, Fintech Scale-up",
    colorHex: "#10b981",
    stars: 5,
    quote:
      "We stopped missing hidden gems. Candidates we'd have filtered out are now our top performers.",
  },
  {
    name: "Amira Elmasry",
    role: "HR Director, Majid Al Futtaim",
    colorHex: "#f59e0b",
    stars: 5,
    quote:
      "The semantic matching is genuinely different. It reads CVs the way an experienced recruiter would.",
  },
];

const plans: Plan[] = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    featured: false,
    cta: "Get Started",
    features: [
      "10 active job posts",
      "Basic AI matching",
      "CV parsing (50/mo)",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    featured: true,
    cta: "Start Free Trial",
    features: [
      "Unlimited job posts",
      "Advanced semantic AI",
      "Unlimited CV parsing",
      "Bias detection",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    featured: false,
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "Custom AI models",
      "ATS integrations",
      "Dedicated CSM",
      "SLA guarantee",
    ],
  },
];

const footerCols: FooterCol[] = [
  {
    title: "Product",
    links: ["Features", "How it works", "Pricing", "Changelog"],
  },
  { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "GDPR"] },
];

// ─── useScrollReveal ──────────────────────────────────────────────────────────
function useScrollReveal(): void {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add("visible"),
        ),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header className={`hk-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container py-3">
          <div className="d-flex align-items-center justify-content-between">
            <a
              href="#"
              className="d-flex align-items-center gap-2 text-decoration-none"
            >
              <div className="hk-logo-box">H</div>
              <span className="hk-brand-name">Hakeem</span>
            </a>

            <nav className="d-none d-md-flex gap-4 align-items-center">
              {(["Features", "How it works", "Pricing", "Blog"] as const).map(
                (label) => (
                  <a
                    key={label}
                    href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                    className="hk-nav-link"
                  >
                    {label}
                  </a>
                ),
              )}
            </nav>

            <div className="d-flex gap-2">
              <button
                className="hk-btn-outline d-none d-md-block"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </button>
              <button
                className="hk-btn-primary"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="hk-hero" id="features">
        <div className="hk-hero-blob hk-hero-blob--right" />
        <div className="hk-hero-blob hk-hero-blob--left" />

        <div className="container">
          <div className="row align-items-center g-5">
            {/* Left copy */}
            <div className="col-lg-6">
              <div className="hk-badge anim-fade-up delay-1 mb-4">
                <span className="hk-badge-dot" />
                AI Powered Recruitment
              </div>

              <h1 className="anim-fade-up delay-2 mb-4">
                Hire the <span className="highlight">Right People</span> Faster
              </h1>

              <p className="hk-hero-lead anim-fade-up delay-3 mb-5">
                Transform your recruitment process using ethical AI matching and
                semantic CV analysis. Less bias, better hires.
              </p>

              <div className="d-flex flex-wrap gap-3 anim-fade-up delay-4">
                <button
                  className="hk-btn-primary hk-btn-lg"
                  onClick={() => navigate("/auth")}
                >
                  Start Free Trial
                </button>
                <button className="hk-btn-outline hk-btn-lg">
                  ▶ Watch Demo
                </button>
              </div>

              <p className="hk-hero-footnote anim-fade-up delay-5 mt-3">
                No credit card required · 14-day free trial
              </p>
            </div>

            {/* Right — candidate card */}
            <div className="col-lg-6 anim-slide-left delay-3">
              <div className="hk-hero-card">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <span className="hk-card-title">
                    <Trophy /> Top Candidates
                  </span>
                  <span className="hk-live-pill">Live</span>
                </div>

                {candidates.map((c, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 mb-4">
                    <div
                      className="hk-avatar"
                      style={{ background: c.colorHex }}
                    >
                      {c.name[0]}
                    </div>
                    <div className="flex-grow-1">
                      <div className="hk-candidate-name">{c.name}</div>
                      <div className="hk-candidate-role">{c.role}</div>
                      <div className="hk-progress-track">
                        <div
                          className="hk-progress-fill"
                          style={
                            {
                              "--fill": `${c.score}%`,
                              background: c.colorHex,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>
                    <div className="hk-score" style={{ color: c.colorHex }}>
                      {c.score}%
                    </div>
                  </div>
                ))}

                <div className="hk-live-notice">
                  <span className="hk-live-dot" /> 3 new matches in the last
                  hour
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═══════════════════════════════════════════ */}
      <section className="hk-stats" id="how-it-works">
        <div className="container">
          <div className="row g-4">
            {stats.map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div
                  className="hk-stat-item reveal"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="hk-stat-num">{s.num}</div>
                  <div className="hk-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section className="hk-how">
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className="hk-badge mb-3">Process</div>
            <h2 className="hk-section-title">How Hakeem Works</h2>
            <p className="hk-section-sub">
              Three steps to your next great hire
            </p>
          </div>

          <div className="row g-4">
            {steps.map((s, i) => (
              <div
                key={i}
                className="col-md-4 reveal"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="hk-step-card">
                  <div className="hk-step-num">{s.num}</div>
                  <h5 className="hk-step-title">{s.title}</h5>
                  <p className="hk-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section className="hk-features" id="pricing">
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className="hk-badge mb-3">Capabilities</div>
            <h2 className="hk-section-title">Powerful AI Recruitment</h2>
            <p className="hk-section-sub">
              Everything you need to hire smarter and faster
            </p>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="col-md-6 col-lg-4 reveal"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="hk-feature-card">
                  <div
                    className="hk-feature-icon"
                    style={{ background: featureBg[f.bgClass] }}
                  >
                    {f.icon}
                  </div>
                  <h5 className="hk-feature-title">{f.title}</h5>
                  <p className="hk-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════ */}
      <section className="hk-testimonials">
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className="hk-badge mb-3">Testimonials</div>
            <h2 className="hk-section-title">Trusted by Hiring Teams</h2>
          </div>

          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="col-md-4 reveal"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="hk-testi-card">
                  <div className="hk-testi-stars">{"★".repeat(t.stars)}</div>
                  <p className="hk-testi-quote">"{t.quote}"</p>
                  <div className="d-flex align-items-center gap-3 mt-3">
                    <div
                      className="hk-testi-avatar"
                      style={{ background: t.colorHex }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="hk-testi-name">{t.name}</div>
                      <div className="hk-testi-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ═════════════════════════════════════════════ */}
      <section className="hk-pricing">
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className="hk-badge mb-3">Pricing</div>
            <h2 className="hk-section-title">Simple, Transparent Pricing</h2>
            <p className="hk-section-sub">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="row g-4 justify-content-center">
            {plans.map((p, i) => (
              <div
                key={i}
                className="col-md-4 reveal"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div
                  className={`hk-price-card ${p.featured ? "featured" : ""}`}
                >
                  {p.featured && (
                    <div className="hk-popular-badge">Most Popular</div>
                  )}
                  <h5 className="hk-plan-name">{p.name}</h5>
                  <div className="d-flex align-items-end gap-1 justify-content-center my-3">
                    <div className="hk-price-amt">{p.price}</div>
                    <div className="hk-price-period">{p.period}</div>
                  </div>
                  <ul className="hk-price-feature-list">
                    {p.features.map((f, j) => (
                      <li key={j}>
                        <span className="hk-check">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`${p.featured ? "hk-btn-primary" : "hk-btn-outline"} hk-btn-block`}
                    onClick={() => navigate("/auth")}
                  >
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ══════════════════════════════════════════ */}
      <section className="hk-cta">
        <div className="hk-cta-glow hk-cta-glow--left" />
        <div className="hk-cta-glow hk-cta-glow--right" />

        <div className="container position-relative text-center">
          <div className="reveal">
            <div className="hk-badge hk-badge--dark mb-4">
              Ready to get started?
            </div>
            <h2 className="hk-cta-title">
              Your next great hire is
              <br />
              one click away
            </h2>
            <p className="hk-cta-sub">
              Join 180+ companies using Hakeem to build exceptional teams,
              faster.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="hk-btn-primary hk-btn-lg"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial
              </button>
              <button className="hk-btn-outline hk-btn-outline--dark hk-btn-lg">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer className="hk-footer">
        <div className="container">
          <div className="row g-5 mb-5">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="hk-logo-box">H</div>
                <span className="hk-footer-brand">Hakeem</span>
              </div>
              <p className="hk-footer-tagline">
                AI-powered recruitment that's fast, fair, and built for the
                modern hiring team.
              </p>
            </div>

            {footerCols.map((col) => (
              <div key={col.title} className="col-6 col-md-2">
                <div className="hk-footer-col-title">{col.title}</div>
                <ul className="list-unstyled d-flex flex-column gap-2">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hk-footer-link">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <hr className="hk-footer-divider" />

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 pt-3">
            <p className="hk-footer-copy">
              © 2026 Hakeem AI. All rights reserved.
            </p>
            <p className="hk-footer-copy">Made with ♥ for fair hiring</p>
          </div>
        </div>
      </footer>
    </>
  );
}
