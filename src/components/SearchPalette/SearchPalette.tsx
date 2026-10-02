import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getAllLocalizedNotes } from "../../data/notes";
import { getAllLocalizedProjects } from "../../data/projects";
import { editorial } from "../../data/editorial";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import "./SearchPalette.css";

type SearchItem = {
  id: string;
  kind: "page" | "project" | "note";
  title: string;
  description: string;
  terms: string;
  to: string;
};

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function SearchPalette({ onClose }: { onClose: () => void }) {
  const { language, t } = useLanguage();
  const { projects, notes } = useContent();
  const navigate = useNavigate();
  const location = useLocation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  useDialogAccessibility(true, dialogRef, onClose);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const copy = {
    en: { title: "Find something", placeholder: "Search projects, notes or pages…", close: "Close search", empty: "No results. Try a project, technology or topic.", hint: "Navigate with ↑ ↓ · Enter to open · Esc to close", page: "Page", project: "Project", note: "Note" },
    pt: { title: "Encontre algo", placeholder: "Buscar projetos, notas ou páginas…", close: "Fechar busca", empty: "Nenhum resultado. Tente um projeto, tecnologia ou tema.", hint: "Navegue com ↑ ↓ · Enter para abrir · Esc para fechar", page: "Página", project: "Projeto", note: "Nota" },
    es: { title: "Encuentra algo", placeholder: "Buscar proyectos, notas o páginas…", close: "Cerrar búsqueda", empty: "Sin resultados. Prueba un proyecto, tecnología o tema.", hint: "Navega con ↑ ↓ · Enter para abrir · Esc para cerrar", page: "Página", project: "Proyecto", note: "Nota" },
  }[language];

  const items = useMemo(() => {
    const pages: SearchItem[] = [
      { id: "home", kind: "page", title: t.nav.home, description: t.home.subtitle, terms: "home início inicio portada", to: "/" },
      { id: "projects", kind: "page", title: t.nav.projects, description: t.projects.indexIntro, terms: "projects projetos proyectos work", to: "/projects" },
      { id: "notes", kind: "page", title: t.nav.notes, description: t.notes.tagline, terms: "notes notas blog articles artigos artículos", to: "/notes" },
      { id: "about", kind: "page", title: t.nav.about, description: t.about.bio, terms: "about sobre perfil", to: "/#about" },
      { id: "contact", kind: "page", title: t.nav.contact, description: t.contact.role, terms: "contact contato contacto email", to: "/#contact" },
      { id: "lab", kind: "page", title: editorial.lab[language], description: editorial.simulation[language], terms: "lab laboratório laboratorio simulation simulação simulación", to: "/lab" },
      { id: "profile", kind: "page", title: editorial.profile[language], description: t.about.bio, terms: "profile perfil currículo curriculum résumé cv", to: "/profile" },
      { id: "privacy", kind: "page", title: { en: "Privacy", pt: "Privacidade", es: "Privacidad" }[language], description: { en: "How this site handles your data.", pt: "Como este site trata seus dados.", es: "Cómo trata tus datos este sitio." }[language], terms: "privacy privacidade privacidad dados datos lgpd cookies", to: "/privacy" },
    ];
    const projectItems: SearchItem[] = [...getAllLocalizedProjects(language, projects)]
      .sort((a, b) => Number(b.date) - Number(a.date))
      .map(project => ({
      id: `project-${project.slug}`, kind: "project", title: project.title, description: project.description,
      terms: project.stack.join(" "), to: `/projects/${project.slug}`,
    }));
    const noteItems: SearchItem[] = [...getAllLocalizedNotes(language, notes)]
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.date.localeCompare(a.date))
      .map(note => ({
      id: `note-${note.slug}`, kind: "note", title: note.title, description: note.excerpt,
      terms: `${note.category} ${note.tags.join(" ")}`, to: `/notes/${note.slug}`,
    }));
    return { pages, projectItems, noteItems };
  }, [language, notes, projects, t]);

  const results = useMemo(() => {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return [...items.pages.slice(0, 5), ...items.projectItems.slice(0, 2), ...items.noteItems.slice(0, 2)];
    return [...items.pages, ...items.projectItems, ...items.noteItems]
      .map(item => {
        const title = normalize(item.title);
        const terms = normalize(item.terms);
        const description = normalize(item.description);
        if (!words.every(word => title.includes(word) || terms.includes(word) || description.includes(word))) return { item, score: 0 };
        const score = words.reduce((total, word) => total +
          (title === word ? 100 : title.startsWith(word) ? 60 : title.includes(word) ? 40 : 0) +
          (terms.includes(word) ? 20 : 0) + (description.includes(word) ? 5 : 0), 0);
        return { item, score };
      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, language))
      .slice(0, 9)
      .map(result => result.item);
  }, [items, language, query]);

  const openResult = (item: SearchItem) => {
    onClose();
    if (item.to === "/" && location.pathname === "/" && !location.hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.to.startsWith("/#") && location.pathname === "/" && location.hash === item.to.slice(1)) {
      document.getElementById(item.to.slice(2))?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(item.to);
    }
  };

  const handleKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length) setActiveIndex(index => (index + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length);
    } else if (event.key === "Enter" && results.length) {
      event.preventDefault();
      openResult(results[Math.min(activeIndex, results.length - 1)]);
    }
  };

  return createPortal(
    <div className="search-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title" tabIndex={-1}>
        <div className="search-dialog-heading">
          <h2 id="site-search-title">{copy.title}</h2>
          <button type="button" className="search-close" onClick={onClose} aria-label={copy.close}><FaTimes aria-hidden="true" /></button>
        </div>
        <div className="search-input-wrap">
          <FaSearch aria-hidden="true" />
          <label className="sr-only" htmlFor="site-search-input">{copy.placeholder}</label>
          <input id="site-search-input" ref={inputRef} type="search" autoComplete="off" value={query} onChange={event => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={handleKeys} placeholder={copy.placeholder} aria-controls="site-search-results" />
          <kbd aria-hidden="true">ESC</kbd>
        </div>
        <div id="site-search-results" className="search-results">
          {results.length ? results.map((item, index) => (
            <button key={item.id} type="button" className={`search-result ${index === activeIndex ? "is-active" : ""}`} onClick={() => openResult(item)} onMouseEnter={() => setActiveIndex(index)}>
              <span className="search-result-copy"><span className="search-result-kind">{copy[item.kind]}</span><strong>{item.title}</strong><span className="search-result-description">{item.description}</span></span>
              <span className="search-result-arrow" aria-hidden="true">↗</span>
            </button>
          )) : <p className="search-empty">{copy.empty}</p>}
        </div>
        <p className="search-hint">{copy.hint}</p>
      </div>
    </div>,
    document.body,
  );
}
