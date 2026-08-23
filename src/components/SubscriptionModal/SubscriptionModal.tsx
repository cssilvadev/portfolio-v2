import { useState } from "react";
import { FaCrown, FaCheck, FaTimes, FaShieldAlt, FaTerminal, FaCode, FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./SubscriptionModal.css";

export default function SubscriptionModal() {
  const {
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    subscriptionTier,
    user,
    openAuthModal,
  } = useAuth();
  const { t, language } = useLanguage();

  const [billingInterval, setBillingInterval] = useState<"monthly" | "annual">("annual");
  if (!isSubscriptionModalOpen) return null;

  const subT = t.subscription;

  const getCheckoutUrl = (): string | undefined => {
    const suffix = billingInterval === "annual" ? "_ANNUAL" : "_MONTHLY";

    if (language === "pt") {
      return (
        import.meta.env[`VITE_CHECKOUT_URL_BRL${suffix}`] ||
        import.meta.env.VITE_STRIPE_CHECKOUT_URL_BRL ||
        import.meta.env.VITE_STRIPE_CHECKOUT_URL
      );
    } else if (language === "es") {
      return (
        import.meta.env[`VITE_CHECKOUT_URL_EUR${suffix}`] ||
        import.meta.env.VITE_STRIPE_CHECKOUT_URL_EUR ||
        import.meta.env.VITE_STRIPE_CHECKOUT_URL
      );
    } else {
      return (
        import.meta.env[`VITE_CHECKOUT_URL_USD${suffix}`] ||
        import.meta.env.VITE_STRIPE_CHECKOUT_URL_USD ||
        import.meta.env.VITE_STRIPE_CHECKOUT_URL
      );
    }
  };

  const handleSubscribe = () => {
    if (!user) {
      closeSubscriptionModal();
      openAuthModal("signup");
      return;
    }

    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) {
      try {
        const destination = new URL(checkoutUrl);
        if (destination.protocol !== "https:" && destination.protocol !== "http:") {
          throw new Error("Checkout URL must use HTTP(S).");
        }
        destination.searchParams.set("prefilled_email", user.email || "");
        window.location.assign(destination.toString());
      } catch {
        alert("The checkout link is invalid. Please contact the site owner.");
      }
    } else {
      alert(
        "Checkout is not configured yet. Add a public checkout URL to the deployment environment."
      );
    }
  };

  return (
    <div className="sub-overlay" onClick={closeSubscriptionModal}>
      <div className="sub-card" role="dialog" aria-modal="true" aria-labelledby="subscription-title" onClick={(e) => e.stopPropagation()}>
        {/* CLOSE BUTTON */}
        <button className="sub-close-btn" onClick={closeSubscriptionModal} aria-label="Close">
          <FaTimes />
        </button>

        {/* TOP BADGE */}
        <div className="sub-top-pill">
          <FaCrown className="pill-icon" />
          <span>CS.DEV PRO</span>
        </div>

        {/* HEADER */}
        <div className="sub-header">
          <h2 id="subscription-title">{subT.modalTitle}</h2>
          <p className="sub-subtitle">{subT.subtitle}</p>
        </div>

        {/* MENSAL / ANUAL TOGGLE */}
        <div className="billing-toggle-wrapper">
          <div className="billing-toggle">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`toggle-option ${billingInterval === "monthly" ? "selected" : ""}`}
            >
              {subT.monthlyTab}
            </button>
            <button
              onClick={() => setBillingInterval("annual")}
              className={`toggle-option ${billingInterval === "annual" ? "selected" : ""}`}
            >
              <span>{subT.annualTab}</span>
              <span className="save-tag">{subT.discountBadge}</span>
            </button>
          </div>
        </div>

        {/* PRICING DISPLAY CARD */}
        <div className="sub-pricing-box">
          <div className="price-header">
            <span className="price-tier-label">PRO SUBSCRIBER</span>
            <span className="payment-support-tag">PIX · Credit Card · Boleto · PayPal</span>
          </div>

          <div className="price-display">
            <span className="price-value">
              {billingInterval === "annual"
                ? subT.priceAmountAnnual
                : subT.priceAmountMonthly}
            </span>
            <span className="price-duration">
              {billingInterval === "annual"
                ? subT.pricePeriodAnnual
                : subT.pricePeriodMonthly}
            </span>
          </div>

          <p className="price-terms">{subT.priceDesc}</p>

          <button
            onClick={handleSubscribe}
            className={`checkout-btn ${subscriptionTier === "pro" ? "pro-active" : ""}`}
            disabled={subscriptionTier === "pro"}
          >
            {subscriptionTier === "pro" ? (
              <>
                <FaCheck /> <span>{subT.activeSub}</span>
              </>
            ) : (
              <>
                <span>{user ? subT.subscribeBtn : subT.signInToSub}</span>
                <FaArrowRight className="btn-arrow" />
              </>
            )}
          </button>
        </div>

        {/* FEATURES MINIMAL LIST */}
        <div className="sub-features-list">
          <div className="feature-row">
            <FaCode className="f-icon" />
            <div>
              <strong>{subT.feature1Title}</strong>
              <span>{subT.feature1Desc}</span>
            </div>
          </div>

          <div className="feature-row">
            <FaTerminal className="f-icon" />
            <div>
              <strong>{subT.feature2Title}</strong>
              <span>{subT.feature2Desc}</span>
            </div>
          </div>

          <div className="feature-row">
            <FaShieldAlt className="f-icon" />
            <div>
              <strong>{subT.feature3Title}</strong>
              <span>{subT.feature3Desc}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
