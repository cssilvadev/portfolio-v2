import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

// Explicit diagnostics only. No cookies, persistence, analytics or network send.
export function startPerformanceDiagnostics() {
  const panel = document.createElement("details");
  panel.className = "performance-diagnostics";
  const summary = document.createElement("summary");
  summary.textContent = "Web Vitals · local diagnostics";
  panel.append(summary);
  const note = document.createElement("p");
  note.textContent = "Single page-load session, not a field percentile. Interact to measure INP. Values stay on this device.";
  panel.append(note);
  const values = new Map<string, HTMLOutputElement>();
  for (const name of ["LCP", "INP", "CLS"]) {
    const row = document.createElement("p");
    const output = document.createElement("output");
    output.textContent = "pending / unsupported";
    row.append(`${name}: `, output);
    panel.append(row);
    values.set(name, output);
  }
  document.body.append(panel);
  const report = (metric: Metric) => {
    const output = values.get(metric.name);
    if (output) output.textContent = `${metric.name === "CLS" ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`} · ${metric.rating}`;
  };
  onCLS(report, { reportAllChanges: true });
  onINP(report, { reportAllChanges: true });
  onLCP(report, { reportAllChanges: true });
}
