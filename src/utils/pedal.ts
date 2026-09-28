/** Normalized educational model, not measurements of a physical G27. */
export function pedalResponse(input: number, deadzone: number, gamma: number): number {
  const x = Math.min(1, Math.max(0, input));
  const d = Math.min(.95, Math.max(0, deadzone));
  const normalized = Math.max(0, (x - d) / (1 - d));
  return Math.pow(normalized, Math.min(4, Math.max(.25, gamma)));
}
