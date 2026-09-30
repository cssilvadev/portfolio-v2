export const contactLimits = { name: 100, email: 254, message: 5000, token: 4096 } as const;

export type ContactMessage = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  turnstileToken: string;
};

export type ParsedContact = { kind: "honeypot" } | { kind: "message"; value: ContactMessage } | { kind: "invalid" };

export function parseContactPayload(payload: unknown): ParsedContact {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { kind: "invalid" };
  const value = payload as Record<string, unknown>;
  if (typeof value.website === "string" && value.website.trim()) return { kind: "honeypot" };

  const fields = [value.firstName, value.lastName, value.email, value.message, value.turnstileToken];
  if (fields.some((field) => typeof field !== "string")) return { kind: "invalid" };
  const [rawFirstName, rawLastName, rawEmail, rawMessage, rawToken] = fields as string[];
  const firstName = rawFirstName.trim().replace(/\s+/g, " ");
  const lastName = rawLastName.trim().replace(/\s+/g, " ");
  const email = rawEmail.trim();
  const message = rawMessage.replace(/\r\n?/g, "\n").trim();
  const turnstileToken = rawToken.trim();

  if (!firstName || firstName.length > contactLimits.name || !lastName || lastName.length > contactLimits.name ||
    email.length > contactLimits.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !message || message.length > contactLimits.message || !turnstileToken || turnstileToken.length > contactLimits.token) {
    return { kind: "invalid" };
  }
  return { kind: "message", value: { firstName, lastName, email, message, turnstileToken } };
}

export function contactEmailText(message: ContactMessage) {
  return [
    "New message from the portfolio contact form",
    "",
    `Name: ${message.firstName} ${message.lastName}`,
    `Reply to: ${message.email}`,
    "",
    message.message,
  ].join("\n");
}
