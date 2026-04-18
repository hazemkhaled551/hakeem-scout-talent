import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  CreditCard,
  Lock,
  CheckCircle,
  Shield,
  AlertCircle,
  ArrowRight,
  Zap,
  Star,
} from "lucide-react";
import "./Plans.css";

/* ════════════════════════════════════════════════════════════
   PLAN DATA (mirrors Plans.tsx)
════════════════════════════════════════════════════════════ */
const PLAN_DATA: Record<
  string,
  { name: string; monthly: number; annual: number; features: string[] }
> = {
  pro: {
    name: "Pro Plan",
    monthly: 49,
    annual: 39,
    features: [
      "Unlimited job posts",
      "AI candidate matching",
      "Advanced analytics",
      "Priority support",
    ],
  },
};

/* ════════════════════════════════════════════════════════════
   CARD NUMBER FORMATTER
════════════════════════════════════════════════════════════ */
function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return digits;
}

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n)) return "mc";
  if (/^3[47]/.test(n)) return "amex";
  return "";
}

/* ════════════════════════════════════════════════════════════
   LUHN CHECK (basic card validation)
════════════════════════════════════════════════════════════ */
function luhn(num: string) {
  const digits = num.replace(/\s/g, "").split("").reverse().map(Number);
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 !== 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function Payment() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const planId = params.get("plan") ?? "pro";
  const billing = params.get("billing") ?? "monthly";
  const isAnnual = billing === "annual";

  const plan = PLAN_DATA[planId] ?? PLAN_DATA.pro;
  const price = isAnnual ? plan.annual : plan.monthly;
  const total = isAnnual ? plan.annual * 12 : plan.monthly;

  const [scrolled, setScrolled] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /* form fields */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [touched, setTouched] = useState(false);
  const [apiErr, setApiErr] = useState("");

  const brand = detectBrand(cardNum);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Validation ─────────────────────────────────────────── */
  const errors = {
    name: !name.trim() ? "Name is required." : "",
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email."
      : "",
    cardNum:
      cardNum.replace(/\s/g, "").length < 16
        ? "Enter a 16-digit card number."
        : !luhn(cardNum)
          ? "Card number is invalid."
          : "",
    expiry: (() => {
      const parts = expiry.replace(/\s/g, "").split("/");
      if (expiry.replace(/\D/g, "").length < 4) return "Enter MM/YY.";
      const mm = parseInt(parts[0]),
        yy = parseInt(parts[1]) + 2000;
      const now = new Date();
      if (mm < 1 || mm > 12) return "Invalid month.";
      if (
        yy < now.getFullYear() ||
        (yy === now.getFullYear() && mm < now.getMonth() + 1)
      )
        return "Card is expired.";
      return "";
    })(),
    cvv: cvv.length < 3 ? "Enter 3-digit CVV." : "",
  };

  const isValid = !Object.values(errors).some(Boolean);

  /* ── Submit ─────────────────────────────────────────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setApiErr("");
    if (!isValid) return;

    setLoading(true);
    try {
      // 🔥 Replace with your real API call:
      // await subscribeCompany({ planId, billing, cardNumber: cardNum.replace(/\s/g,""), expiry, cvv, name, email });
      await new Promise((r) => setTimeout(r, 2000));
      setSuccess(true);
    } catch (err: any) {
      setApiErr(
        err?.response?.data?.message ??
          "Payment failed. Please check your card details.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ── Success screen ─────────────────────────────────────── */
  if (success) {
    return (
      <div className="py-page">
        <header className={`py-header ${scrolled ? "scrolled" : ""}`}>
          <div className="container-xl">
            <div className="d-flex align-items-center gap-2 py-3">
              <div className="pl-logo-box">H</div>
              <span className="pl-brand">Hakeem</span>
            </div>
          </div>
        </header>
        <div
          className="py-main d-flex align-items-center justify-content-center"
          style={{ minHeight: "70vh" }}
        >
          <div className="py-success pl-si">
            <div className="py-success-icon">
              <CheckCircle size={42} color="var(--success)" strokeWidth={1.8} />
            </div>
            <h2
              style={{
                fontFamily: "Syne",
                fontWeight: 800,
                fontSize: "1.5rem",
                marginBottom: ".5rem",
              }}
            >
              Payment Successful!
            </h2>
            <p
              style={{
                fontSize: ".9rem",
                color: "var(--muted)",
                lineHeight: 1.65,
                maxWidth: 380,
                margin: "0 auto 1.5rem",
              }}
            >
              Welcome to <strong>Hakeem {plan.name}</strong>. Your subscription
              is now active. A receipt has been sent to <strong>{email}</strong>
              .
            </p>
            <div
              style={{
                background: "rgba(16,185,129,.07)",
                border: "1px solid rgba(16,185,129,.2)",
                borderRadius: 13,
                padding: "1rem 1.3rem",
                maxWidth: 360,
                margin: "0 auto 1.5rem",
                textAlign: "left",
              }}
            >
              {plan.features.map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: ".5rem",
                    fontSize: ".84rem",
                    color: "#065f46",
                    marginBottom: ".35rem",
                  }}
                >
                  <CheckCircle size={13} /> {f}
                </div>
              ))}
            </div>
            <button
              className="pl-btn pl-btn--primary"
              onClick={() => navigate("/company")}
            >
              Go to Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main form ──────────────────────────────────────────── */
  return (
    <div className="py-page">
      {/* Header */}
      <header className={`py-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-2">
              <div className="pl-logo-box">H</div>
              <span className="pl-brand">Hakeem</span>
            </div>
            <button
              className="pl-btn pl-btn--ghost pl-btn--sm"
              onClick={() => navigate("/company/plans")}
            >
              <ChevronLeft size={14} /> Back to Plans
            </button>
          </div>
        </div>
      </header>

      <main className="py-main">
        {/* Page title */}
        <div className="mb-4 pl-au">
          <h1
            style={{
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: "clamp(1.4rem,3vw,1.8rem)",
              letterSpacing: "-.03em",
              marginBottom: ".3rem",
            }}
          >
            Complete Your Purchase
          </h1>
          <p style={{ fontSize: ".88rem", color: "var(--muted)" }}>
            Secure checkout — your payment info is encrypted and never stored.
          </p>
        </div>

        <div className="row g-4">
          {/* ── LEFT: Form ──────────────────────────────── */}
          <div className="col-12 col-lg-7">
            <form onSubmit={handleSubmit} noValidate>
              {/* ── 1. Account info ── */}
              <div className="py-form-card mb-3 pl-au pl-d1">
                <div className="py-section-title">
                  <div className="py-step-num">1</div> Account Info
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="py-field">
                      <label className="py-label">Full Name</label>
                      <input
                        className={`py-input ${touched && errors.name ? "py-input--error" : ""}`}
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {touched && errors.name && (
                        <span className="py-error">
                          <AlertCircle size={12} />
                          {errors.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="py-field">
                      <label className="py-label">Email Address</label>
                      <input
                        className={`py-input ${touched && errors.email ? "py-input--error" : ""}`}
                        type="email"
                        placeholder="john@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {touched && errors.email && (
                        <span className="py-error">
                          <AlertCircle size={12} />
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. Card details ── */}
              <div className="py-form-card mb-3 pl-au pl-d2">
                <div className="py-section-title">
                  <div className="py-step-num">2</div> Card Details
                </div>

                {/* Card brands */}
                <div className="py-card-brands">
                  <div
                    className={`py-card-brand py-card-brand--visa`}
                    style={{ opacity: brand === "visa" || !brand ? 1 : 0.35 }}
                  >
                    VISA
                  </div>
                  <div
                    className={`py-card-brand py-card-brand--mc`}
                    style={{ opacity: brand === "mc" || !brand ? 1 : 0.35 }}
                  >
                    MC
                  </div>
                  <div
                    className={`py-card-brand py-card-brand--amex`}
                    style={{ opacity: brand === "amex" || !brand ? 1 : 0.35 }}
                  >
                    AMEX
                  </div>
                </div>

                <div className="py-field">
                  <label className="py-label">Card Number</label>
                  <div className="py-input-wrap">
                    <input
                      className={`py-input ${touched && errors.cardNum ? "py-input--error" : ""}`}
                      placeholder="1234 5678 9012 3456"
                      value={cardNum}
                      onChange={(e) =>
                        setCardNum(formatCardNumber(e.target.value))
                      }
                      maxLength={19}
                      inputMode="numeric"
                    />
                    <span className="py-input-icon">
                      <CreditCard size={16} />
                    </span>
                  </div>
                  {touched && errors.cardNum && (
                    <span className="py-error">
                      <AlertCircle size={12} />
                      {errors.cardNum}
                    </span>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-7">
                    <div className="py-field">
                      <label className="py-label">Expiry Date</label>
                      <input
                        className={`py-input ${touched && errors.expiry ? "py-input--error" : ""}`}
                        placeholder="MM / YY"
                        value={expiry}
                        onChange={(e) =>
                          setExpiry(formatExpiry(e.target.value))
                        }
                        maxLength={7}
                        inputMode="numeric"
                      />
                      {touched && errors.expiry && (
                        <span className="py-error">
                          <AlertCircle size={12} />
                          {errors.expiry}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-5">
                    <div className="py-field">
                      <label className="py-label">CVV</label>
                      <input
                        className={`py-input ${touched && errors.cvv ? "py-input--error" : ""}`}
                        placeholder="•••"
                        type="password"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        maxLength={4}
                        inputMode="numeric"
                      />
                      {touched && errors.cvv && (
                        <span className="py-error">
                          <AlertCircle size={12} />
                          {errors.cvv}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* API error */}
              {apiErr && (
                <div
                  style={{
                    background: "rgba(239,68,68,.07)",
                    border: "1px solid rgba(239,68,68,.2)",
                    borderRadius: 12,
                    padding: ".85rem 1rem",
                    fontSize: ".84rem",
                    color: "#991b1b",
                    display: "flex",
                    alignItems: "center",
                    gap: ".45rem",
                    marginBottom: "1rem",
                  }}
                >
                  <AlertCircle size={14} /> {apiErr}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="pl-btn pl-btn--primary pl-btn--full"
                disabled={loading}
                style={{
                  padding: ".82rem 1.4rem",
                  fontSize: ".95rem",
                  borderRadius: 14,
                }}
              >
                {loading ? (
                  <>
                    <div className="py-spinner" /> Processing…
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Pay ${isAnnual ? total : price}{" "}
                    {isAnnual ? "(annual)" : "/month"}
                  </>
                )}
              </button>

              {/* Security note */}
              <div
                className="py-secure"
                style={{ justifyContent: "center", marginTop: "1rem" }}
              >
                <Shield size={12} />
                256-bit SSL encryption · PCI DSS compliant · Never stored on our
                servers
              </div>
            </form>
          </div>

          {/* ── RIGHT: Summary ──────────────────────────── */}
          <div className="col-12 col-lg-5 pl-au pl-d2">
            <div className="py-summary">
              <div className="py-plan-chip">
                {planId === "pro" ? <Zap size={11} /> : <Star size={11} />}
                {plan.name}
              </div>

              <div className="py-amount">${price}</div>
              <div className="py-amount-period">
                per month {isAnnual ? "(billed annually)" : "(billed monthly)"}
              </div>

              <div style={{ margin: "1.2rem 0" }}>
                {plan.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      fontSize: ".83rem",
                      color: "var(--muted)",
                      marginBottom: ".45rem",
                    }}
                  >
                    <CheckCircle
                      size={13}
                      style={{ color: "var(--success)", flexShrink: 0 }}
                    />{" "}
                    {f}
                  </div>
                ))}
              </div>

              <div
                style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "1.1rem 0",
                }}
              />

              {/* Line items */}
              <div>
                <div className="py-line">
                  <span className="py-line-label">{plan.name}</span>
                  <span className="py-line-val">${price}/mo</span>
                </div>
                {isAnnual && (
                  <div className="py-line">
                    <span className="py-line-label">Annual billing (×12)</span>
                    <span className="py-line-val">${total}</span>
                  </div>
                )}
                <div className="py-line">
                  <span className="py-line-label">Tax</span>
                  <span className="py-line-val">$0.00</span>
                </div>
                <div className="py-line py-total">
                  <span
                    className="py-line-label"
                    style={{ fontWeight: 700, color: "var(--text)" }}
                  >
                    Total due today
                  </span>
                  <span className="py-line-val">
                    ${isAnnual ? total : price}
                  </span>
                </div>
              </div>

              <div className="py-secure" style={{ marginTop: "1.1rem" }}>
                <Shield size={12} /> Secured by 256-bit SSL
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
