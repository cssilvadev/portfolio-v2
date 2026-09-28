import type { Language } from "../i18n/translations";
import type { Note } from "../data/notes";
import type { Project } from "../data/projects";
import { editorial } from "../data/editorial";

export const siteUrl = "https://cssilvadev.github.io/portfolio-v2/";
export function routeMeta(pathname: string, language: Language, projects: Project[], notes: Note[]) {
  const path = pathname.replace(/^\/+|\/+$/g, "");
  const project = path.startsWith("projects/") ? projects.find(item => item.slug === path.slice(9)) : undefined;
  const note = path.startsWith("notes/") ? notes.find(item => item.slug === path.slice(6)) : undefined;
  let title = "Christian Silva — Full Stack & Firmware Engineer";
  let description = editorial.positioning[language];
  let image = "/images/me.jpg";
  let type = "website";
  if (project) { title = `${project[language].title} — Christian Silva`; description = project[language].description; image = project.image; }
  else if (note) { title = `${note[language].title} — Christian Silva`; description = note[language].excerpt; image = note.coverImage ?? image; type = "article"; }
  else if (path === "projects") { title = `${language === "pt" ? "Projetos" : language === "es" ? "Proyectos" : "Projects"} — Christian Silva`; }
  else if (path === "notes") { title = "Notes & Logs — Christian Silva"; }
  else if (path === "lab") { title = `${editorial.lab[language]} — Christian Silva`; description = editorial.simulation[language]; image = "/projects/g27-pedal-adapter.svg"; }
  else if (path === "profile") { title = `${editorial.profile[language]} — Christian Silva`; }
  else if (path === "privacy") { title = `${language === "pt" ? "Privacidade" : language === "es" ? "Privacidad" : "Privacy"} — Christian Silva`; description = language === "pt" ? "Dados, preferências locais, fornecedores e solicitações de privacidade neste portfólio." : language === "es" ? "Datos, preferencias locales, proveedores y solicitudes de privacidad en este portafolio." : "Data, local preferences, providers and privacy requests in this portfolio."; }
  if (/\.svg(?:\?|$)/i.test(image)) image = "/images/me.jpg";
  const indexable = ["", "projects", "notes", "lab", "profile", "privacy"].includes(path) || Boolean(project || note);
  return { title, description, image: image.startsWith("https://") ? image : new URL(image.replace(/^\//, ""), siteUrl).href, canonical: new URL(path ? `${path}/` : "", siteUrl).href, type, indexable };
}
