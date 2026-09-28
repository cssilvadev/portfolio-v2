/** Public browser configuration is never allowed to contain a privileged key. */
export function isBrowserSupabaseKey(value: string | undefined): boolean {
  if (!value) return false;
  if (/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(value)) return true;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  try {
    const claims = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    // This is a configuration guard, not JWT signature verification.
    return claims.role === "anon";
  } catch { return false; }
}

function unsafeUrlCharacters(value: string) {
  return value.includes("\\") || Array.from(value).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);
}

/** Supabase receives credentials: reject ambiguous/path-bearing backend URLs. */
export function isSafeSupabaseUrl(value: string | undefined, allowLocalhost = false): boolean {
  if (!value || unsafeUrlCharacters(value)) return false;
  try {
    const url = new URL(value);
    const transport = url.protocol === "https:" || (allowLocalhost && url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname));
    return transport && !url.username && !url.password && !url.search && !url.hash && url.pathname === "/";
  } catch { return false; }
}

/** Explicit protocol allowlist for authored links; raw HTML is never rendered. */
export function safeContentHref(value: string): string | undefined {
  if (unsafeUrlCharacters(value)) return undefined;
  const href = value.trim();
  if (!href || href.startsWith("//")) return undefined;
  if (/^(https:|mailto:)/i.test(href)) {
    try {
      const url = new URL(href);
      return !url.username && !url.password ? url.href : undefined;
    } catch { return undefined; }
  }
  if (/^[^/?#]*:/.test(href)) return undefined;
  return href;
}

/** Contact only sends to the explicitly supported processor, never arbitrary URLs. */
export function contactEndpoint(value: string | undefined): string | undefined {
  if (!value || unsafeUrlCharacters(value)) return undefined;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname !== "formspree.io" || url.port ||
      url.username || url.password || url.search || url.hash || !/^\/f\/[A-Za-z0-9]{6,64}$/.test(url.pathname)) return undefined;
    return url.href;
  } catch { return undefined; }
}

export const contactLimits = { name: 100, email: 254, message: 5000 } as const;

export function validContactFields(fields: { firstName: string; lastName: string; email: string; message: string }) {
  return fields.firstName.trim().length > 0 && fields.firstName.length <= contactLimits.name &&
    fields.lastName.trim().length > 0 && fields.lastName.length <= contactLimits.name &&
    fields.email.length <= contactLimits.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
    fields.message.trim().length > 0 && fields.message.length <= contactLimits.message;
}
