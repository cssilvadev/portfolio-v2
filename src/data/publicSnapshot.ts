import type { Note } from "./notes";
import type { Project } from "./projects";

export type PublicSnapshot = { projects: Project[]; notes: Note[] };
export function readPublicSnapshot(): PublicSnapshot | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const source = document.getElementById("published-content")?.textContent;
    if (!source) return undefined;
    const parsed = JSON.parse(source) as PublicSnapshot;
    if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.notes)) return undefined;
    return parsed;
  } catch { return undefined; }
}
