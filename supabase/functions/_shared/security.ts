/** Bound decoded bytes even when Content-Length is absent or misleading. */
export async function readLimitedBody(request: Request, maxBytes: number): Promise<string> {
  if (Number(request.headers.get("content-length")) > maxBytes) throw new RangeError("Payload too large");
  const reader = request.body?.getReader();
  if (!reader) return "";
  let length = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) { await reader.cancel(); throw new RangeError("Payload too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/** This checkout supports one recurring price, not mixed subscription periods. */
export function subscriptionPeriod(items: { current_period_start: number; current_period_end: number }[]) {
  if (items.length !== 1) throw new Error("Unsupported subscription items");
  const { current_period_start: start, current_period_end: end } = items[0];
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start <= 0 || end <= start || !Number.isFinite(new Date(end * 1000).getTime())) throw new Error("Invalid billing period");
  return { start: new Date(start * 1000).toISOString(), end: new Date(end * 1000).toISOString() };
}

export function billingUrls(originValue: string, appValue: string): { origin: string; app: string } | undefined {
  try {
    const origin = new URL(originValue);
    const app = new URL(appValue);
    if (origin.protocol !== "https:" || app.origin !== origin.origin || origin.pathname !== "/" ||
      origin.username || origin.password || origin.search || origin.hash || app.username || app.password || app.search || app.hash) return undefined;
    return { origin: origin.origin, app: app.href.replace(/\/$/, "") };
  } catch { return undefined; }
}
