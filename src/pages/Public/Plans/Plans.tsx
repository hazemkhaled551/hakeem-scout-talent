import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  X,
  Zap,
  Building2,
  Shield,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./Plans.css";

/* ════════════════════════════════════════════════════════════
   PLAN CONFIG
════════════════════════════════════════════════════════════ */
interface Feature {
  text: string;
  included: boolean;
  highlight?: boolean;
}
interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  desc: string;
  monthlyPrice: number;
  annualPrice: number;
  icon: React.ReactNode;
  features: Feature[];
  cta: string;
  popular?: boolean;
  current?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    desc: "Perfect for small teams just getting started with hiring.",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: <Building2 size={20} />,
    cta: "Current Plan",
    current: true,
    features: [
      { text: "Up to 3 active job posts", included: true },
      { text: "Up to 15 applications per job", included: true },
      { text: "Basic candidate pipeline", included: true },
      { text: "Email notifications", included: true },
      { text: "AI candidate matching", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Interview scheduling", included: false },
      { text: "Offer management", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    desc: "For growing companies that need smarter, faster hiring.",
    monthlyPrice: 49,
    annualPrice: 39,
    icon: <Zap size={20} />,
    cta: "Upgrade to Pro",
    popular: true,
    features: [
      { text: "Unlimited active job posts", included: true, highlight: true },
      { text: "Unlimited applications", included: true, highlight: true },
      { text: "Full candidate pipeline + Kanban", included: true },
      {
        text: "AI candidate matching & scoring",
        included: true,
        highlight: true,
      },
      { text: "Interview scheduling & reminders", included: true },
      { text: "Offer management", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Email + SMS notifications", included: true },
      { text: "Priority email support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    desc: "Custom solutions for large teams and complex hiring at scale.",
    monthlyPrice: -1,
    annualPrice: -1,
    icon: <Shield size={20} />,
    cta: "Contact Sales",
    features: [
      { text: "Everything in Pro", included: true, highlight: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom AI model training", included: true, highlight: true },
      { text: "SSO & advanced security", included: true },
      { text: "Custom integrations & API access", included: true },
      { text: "SLA guarantee", included: true },
      { text: "Onboarding & training sessions", included: true },
      { text: "Custom branding", included: true },
      { text: "24/7 dedicated support", included: true },
    ],
  },
];

const FAQS = [
  {
    q: "Can I upgrade or downgrade at any time?",
    a: "Yes — you can change your plan at any time. Upgrades take effect immediately, downgrades apply at the end of your billing cycle.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex). Enterprise customers can pay via invoice.",
  },
  {
    q: "Is there a free trial for the Pro plan?",
    a: "Yes, new accounts get a 14-day free trial of Pro with no credit card required.",
  },
  {
    q: "What happens to my data if I downgrade?",
    a: "Your data is always safe. If you downgrade to Free, you can still access everything you created, but posting new jobs above the free limit will be paused.",
  },
  {
    q: "How does the annual billing discount work?",
    a: "Annual billing gives you 2 months free (you pay for 10, get 12). The discount is applied automatically when you switch to annual.",
  },
];

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function Plans() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function handleCta(plan: Plan) {
    if (plan.current) return;
    if (plan.id === "enterprise") {
      window.open(
        "mailto:sales@hakeem.io?subject=Enterprise Plan Inquiry",
        "_blank",
      );
      return;
    }
    navigate(
      `/company/payment?plan=${plan.id}&billing=${annual ? "annual" : "monthly"}`,
    );
  }

  return (
    <div className="pl-page">
      {/* Header */}
      <header className={`pl-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="pl-logo-box">H</div>
              <span className="pl-brand">Hakeem</span>
            </div>
            <button
              className="pl-btn pl-btn--ghost pl-btn--sm"
              onClick={() => navigate("/company")}
            >
              <ChevronLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="pl-main">
        {/* Hero */}
        <div className="pl-hero pl-au">
          <div className="pl-hero-eyebrow">
            <Star size={11} /> Hakeem Plans
          </div>
          <h1 className="pl-hero-title">Simple, transparent pricing</h1>
          <p className="pl-hero-sub">
            Choose the plan that fits your team. Upgrade, downgrade, or cancel
            anytime.
          </p>

          {/* Billing toggle */}
          <div className="d-flex align-items-center justify-content-center gap-3">
            <div className="pl-toggle">
              <button
                className={`pl-toggle-opt ${!annual ? "pl-toggle-opt--active" : ""}`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`pl-toggle-opt ${annual ? "pl-toggle-opt--active" : ""}`}
                onClick={() => setAnnual(true)}
              >
                Annual
              </button>
            </div>
            {annual && <span className="pl-save-badge">Save 20%</span>}
          </div>
        </div>

        {/* Plan grid */}
        <div className="pl-grid">
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`pl-card pl-si ${plan.popular ? "pl-card--popular" : ""} ${plan.id === "enterprise" ? "pl-card--enterprise" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {plan.popular && (
                <div className="pl-popular-badge">
                  <Star size={10} fill="currentColor" /> Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`pl-card-icon pl-card-icon--${plan.id}`}>
                {plan.icon}
              </div>

              {/* Name + desc */}
              <div className="pl-card-name">{plan.name}</div>
              <div className="pl-card-desc">{plan.desc}</div>

              {/* Price */}
              {plan.monthlyPrice === -1 ? (
                <div className="pl-price" style={{ marginBottom: ".35rem" }}>
                  <span
                    className="pl-price-amount"
                    style={{
                      fontSize: "1.6rem",
                      color: plan.id === "enterprise" ? "#fff" : "var(--text)",
                    }}
                  >
                    Custom
                  </span>
                </div>
              ) : (
                <>
                  <div className="pl-price">
                    <span className="pl-price-currency">$</span>
                    <span className="pl-price-amount">
                      {annual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                  </div>
                  <div className="pl-price-period">
                    /month {annual ? "(billed annually)" : "(billed monthly)"}
                  </div>
                  {annual && plan.annualPrice > 0 && (
                    <div className="pl-price-annual">
                      You save ${(plan.monthlyPrice - plan.annualPrice) * 12}
                      /year
                    </div>
                  )}
                </>
              )}

              <div className="pl-divider" />

              {/* Features */}
              <div className="pl-features">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="pl-feature">
                    <div
                      className={`pl-feature-icon pl-feature-icon--${f.included ? "check" : "cross"}`}
                    >
                      {f.included ? <Check size={10} /> : <X size={10} />}
                    </div>
                    <span
                      className={`pl-feature-text ${f.highlight ? "pl-feature-text--strong" : ""}`}
                    >
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {plan.current ? (
                <div className="pl-current">
                  <Check size={14} /> Current Plan
                </div>
              ) : (
                <button
                  className={`pl-btn pl-btn--full ${
                    plan.popular
                      ? "pl-btn--primary"
                      : plan.id === "enterprise"
                        ? "pl-btn--plan-enterprise"
                        : "pl-btn--plan-free"
                  }`}
                  onClick={() => handleCta(plan)}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div
          className="pl-au pl-d3"
          style={{
            textAlign: "center",
            marginTop: "2.5rem",
            color: "var(--muted)",
            fontSize: ".84rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: ".5rem",
          }}
        >
          <Users size={14} /> Trusted by{" "}
          <strong style={{ color: "var(--text)" }}>2,400+</strong> companies —
          from startups to enterprises
        </div>

        {/* FAQ */}
        <div className="pl-faq pl-au pl-d4">
          <div className="pl-faq-title">Frequently Asked Questions</div>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="pl-faq-item"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="pl-faq-q">
                {faq.q}
                {openFaq === i ? (
                  <ChevronUp
                    size={16}
                    style={{ color: "var(--primary)", flexShrink: 0 }}
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    style={{ color: "var(--muted)", flexShrink: 0 }}
                  />
                )}
              </div>
              {openFaq === i && <div className="pl-faq-a">{faq.a}</div>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
