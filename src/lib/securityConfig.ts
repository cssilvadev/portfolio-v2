import { contactEndpoint } from "../utils/security";

export const activeContactEndpoint = contactEndpoint(import.meta.env.VITE_CONTACT_FORM_ENDPOINT);
export const captchaSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || undefined;
// Billing is optional, not ready for activation just because code exists.
export const billingEnabled = import.meta.env.VITE_ENABLE_BILLING === "true";
