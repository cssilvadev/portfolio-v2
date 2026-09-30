export const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || undefined;
export const contactFormEnabled = import.meta.env.VITE_CONTACT_FORM_ENABLED === "true";
// Billing is optional, not ready for activation just because code exists.
export const billingEnabled = import.meta.env.VITE_ENABLE_BILLING === "true";
