import { useEffect, useState } from "react";
import { FaCrown, FaTimes } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { supabase, type BillingPlan } from "../../lib/supabase";
import "./SubscriptionModal.css";

type AvailablePlan = BillingPlan & { active: boolean };

function SubscriptionDialog() {
  const { language, t } = useLanguage();
  const {
    user,
    subscriptionTier,
    openAuthModal,
    closeSubscriptionModal,
  } = useAuth();
  const [plans, setPlans] = useState<AvailablePlan[]>([]);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSubscriptionModal();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeSubscriptionModal]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase
      .from("billing_plans")
      .select("id, slug, name, description, kind, interval, currency, price_cents, active")
      .eq("active", true)
      .order("price_cents", { ascending: true })
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) setError(t.billing.unavailable);
        setPlans((data as AvailablePlan[] | null) ?? []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t.billing.unavailable]);

  const formatPrice = (plan: BillingPlan) => new Intl.NumberFormat(language === "pt" ? "pt-BR" : language, {
    style: "currency",
    currency: plan.currency.toUpperCase(),
  }).format(plan.price_cents / 100);

  const planLabel = (plan: BillingPlan) => {
    if (plan.kind === "lifetime") return t.billing.lifetime;
    return plan.interval === "year" ? t.billing.yearly : t.billing.monthly;
  };

  const startCheckout = async (plan: AvailablePlan) => {
    setError("");
    if (!user) {
      closeSubscriptionModal();
      openAuthModal("login");
      return;
    }
    if (!supabase) {
      setError(t.auth.authNotConfigured);
      return;
    }

    setBusyPlan(plan.slug);
    const { data, error: functionError } = await supabase.functions.invoke("create-checkout-session", {
      body: { planSlug: plan.slug },
    });
    setBusyPlan(null);
    if (functionError || typeof data?.url !== "string" || !data.url.startsWith("https://checkout.stripe.com/")) {
      setError(t.billing.checkoutError);
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <div className="subscription-overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) closeSubscriptionModal(); }}>
      <div className="subscription-card" role="dialog" aria-modal="true" aria-labelledby="subscription-title">
        <button type="button" className="subscription-close" onClick={closeSubscriptionModal} aria-label={t.auth.close}><FaTimes /></button>
        <div className="subscription-heading">
          <FaCrown aria-hidden="true" />
          <div>
            <h2 id="subscription-title">{t.billing.upgrade}</h2>
            <p>{subscriptionTier === "free" ? t.billing.free : `${t.billing.pro} · ${t.billing.active}`}</p>
          </div>
        </div>

        {error && <p className="subscription-message error" role="alert">{error}</p>}
        {!user && <p className="subscription-message">{t.billing.signInRequired}</p>}
        {loading && <p className="subscription-message">…</p>}
        {!loading && plans.length === 0 && <p className="subscription-message">{t.billing.unavailable}</p>}

        <div className="subscription-plans">
          {plans.map((plan) => (
            <article className="subscription-plan" key={plan.id}>
              <div>
                <h3>{plan.name || planLabel(plan)}</h3>
                <p>{plan.description || planLabel(plan)}</p>
              </div>
              <strong>{formatPrice(plan)}</strong>
              <button type="button" onClick={() => void startCheckout(plan)} disabled={busyPlan !== null}>
                {busyPlan === plan.slug ? "…" : subscriptionTier !== "free" ? t.billing.active : t.billing.subscribe}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionModal() {
  const { isSubscriptionModalOpen } = useAuth();
  return isSubscriptionModalOpen ? <SubscriptionDialog /> : null;
}
