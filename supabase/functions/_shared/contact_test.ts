import { contactEmailText, parseContactPayload } from "./contact.ts";
function assertEquals(actual: unknown, expected: unknown) {
  if (actual !== expected) throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
}

Deno.test("contact payload trims fields and normalizes names and line endings", () => {
  const parsed = parseContactPayload({
    firstName: "  Ana   Maria ", lastName: " Silva ", email: " ana@example.com ",
    message: " Olá\r\nMundo ", turnstileToken: "token",
  });
  assertEquals(parsed.kind, "message");
  if (parsed.kind !== "message") return;
  assertEquals(parsed.value.firstName, "Ana Maria");
  assertEquals(parsed.value.lastName, "Silva");
  assertEquals(parsed.value.message, "Olá\nMundo");
  assertEquals(contactEmailText(parsed.value), "New message from the portfolio contact form\n\nName: Ana Maria Silva\nReply to: ana@example.com\n\nOlá\nMundo");
});

Deno.test("contact payload rejects invalid email, oversized content, and absent CAPTCHA", () => {
  const base = { firstName: "A", lastName: "B", email: "a@example.com", message: "Hello", turnstileToken: "token" };
  assertEquals(parseContactPayload({ ...base, email: "not-an-email" }).kind, "invalid");
  assertEquals(parseContactPayload({ ...base, message: "x".repeat(5001) }).kind, "invalid");
  assertEquals(parseContactPayload({ ...base, turnstileToken: "" }).kind, "invalid");
  assertEquals(parseContactPayload({ ...base, firstName: "x".repeat(101) }).kind, "invalid");
});

Deno.test("honeypot payload is silently classified before delivery", () => {
  assertEquals(parseContactPayload({ website: "https://spam.example" }).kind, "honeypot");
});
