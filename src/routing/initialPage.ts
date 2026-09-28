import type { ComponentType } from "react";

export type InitialPage = { key: string; component: ComponentType };
/** Resolve the first lazy page before replacing its pre-rendered document. */
export async function loadInitialPage(): Promise<InitialPage | undefined> {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.slice(base.length).replace(/\/$/, "") || "/";
  if (path === "/") return undefined;
  const key = path.startsWith("/projects/") ? "project" : path.startsWith("/notes/") ? "note" : path.slice(1);
  const loaders = {
    projects: () => import("../pages/projectIndex/ProjectIndex"),
    project: () => import("../pages/projectPage/ProjectPage"),
    notes: () => import("../pages/notes/NotesIndex"),
    note: () => import("../pages/notePage/NotePage"),
    lab: () => import("../pages/lab/Lab"),
    profile: () => import("../pages/profile/Profile"),
    admin: () => import("../pages/admin/Admin"),
  };
  if (key === "studio" && import.meta.env.DEV) return undefined;
  const module = await (loaders[key as keyof typeof loaders] ?? (() => import("../pages/notFound/NotFound")))();
  return { key: key in loaders ? key : "notfound", component: module.default };
}
