import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { notes as localNotes, type Note, type NoteCategory } from "../data/notes";
import { projects as localProjects, type Project, type ProjectSpec } from "../data/projects";
import { supabase } from "../lib/supabase";
import { labNotes } from "../data/labNotes";
import { readPublicSnapshot, type PublicSnapshot } from "../data/publicSnapshot";

type CmsEntryRow = {
  id: string;
  kind: "article" | "project" | "page";
  slug: string;
  date_label: string;
  category: string | null;
  cover_image: string | null;
  tags: string[];
  stack: string[];
  specs: unknown;
  featured: boolean;
};

type CmsTranslationRow = {
  entry_id: string;
  language: "en" | "pt" | "es";
  title: string;
  excerpt: string;
  overview: string;
  body: string;
};

type ContentContextValue = {
  projects: Project[];
  notes: Note[];
  loading: boolean;
  refreshContent: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

const languages = ["en", "pt", "es"] as const;

function safeCategory(value: string | null): NoteCategory {
  if (value === "AI & Workflows" || value === "Robotics" || value === "Software Engineering") return value;
  return "Firmware & Embedded";
}

function safeSpecs(value: unknown): ProjectSpec[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ProjectSpec => (
    typeof item === "object" && item !== null &&
    typeof (item as { key?: unknown }).key === "string" &&
    typeof (item as { value?: unknown }).value === "string"
  )).map((item) => ({ key: item.key, value: item.value }));
}

// Shared by the static publisher; it maps public entries only, never drafts.
// eslint-disable-next-line react-refresh/only-export-components
export function buildCmsContent(entries: CmsEntryRow[], translations: CmsTranslationRow[]) {
  const byEntry = new Map<string, CmsTranslationRow[]>();
  translations.forEach((translation) => {
    const current = byEntry.get(translation.entry_id) ?? [];
    current.push(translation);
    byEntry.set(translation.entry_id, current);
  });

  const projects: Project[] = [];
  const notes: Note[] = [];
  entries.forEach((entry) => {
    if (entry.kind !== "project" && entry.kind !== "article") return;
    const entryTranslations = byEntry.get(entry.id) ?? [];
    const byLanguage = new Map(entryTranslations.map((translation) => [translation.language, translation]));
    const fallback = byLanguage.get("en") ?? entryTranslations[0];
    if (!fallback) return;

    const localized = Object.fromEntries(languages.map((language) => {
      const translation = byLanguage.get(language) ?? fallback;
      return [language, {
        title: translation.title,
        description: translation.excerpt,
        excerpt: translation.excerpt,
        overview: translation.overview,
        content: translation.body,
      }];
    })) as Record<"en" | "pt" | "es", { title: string; description: string; excerpt: string; overview: string; content: string }>;

    if (entry.kind === "project") {
      projects.push({
        slug: entry.slug,
        date: entry.date_label,
        image: entry.cover_image ?? "/projects/portfolio.svg",
        stack: Array.isArray(entry.stack) ? entry.stack : [],
        specs: safeSpecs(entry.specs),
        en: { title: localized.en.title, description: localized.en.description, overview: localized.en.overview },
        pt: { title: localized.pt.title, description: localized.pt.description, overview: localized.pt.overview },
        es: { title: localized.es.title, description: localized.es.description, overview: localized.es.overview },
      });
    } else {
      const readingTime = Math.max(1, Math.ceil(
        localized.en.content.trim().split(/\s+/).filter(Boolean).length / 200,
      ));
      notes.push({
        slug: entry.slug,
        date: entry.date_label,
        readingTime,
        category: safeCategory(entry.category),
        tags: Array.isArray(entry.tags) ? entry.tags : [],
        coverImage: entry.cover_image ?? undefined,
        featured: entry.featured,
        en: { title: localized.en.title, excerpt: localized.en.excerpt, content: localized.en.content },
        pt: { title: localized.pt.title, excerpt: localized.pt.excerpt, content: localized.pt.content },
        es: { title: localized.es.title, excerpt: localized.es.excerpt, content: localized.es.content },
      });
    }
  });
  const slugs = new Set(notes.map(note => note.slug));
  // Correct legacy display claims without writing to the CMS. A USB polling
  // interval is not an end-to-end latency measurement; the live home no longer
  // uses Spline. All other CMS edits remain authoritative.
  projects.forEach(project => {
    if (project.slug === "interactive-portfolio") project.stack = project.stack.map(value => value === "Spline" ? "Supabase" : value);
    if (project.slug !== "g27-pedal-adapter") return;
    project.specs = project.specs.map(spec => spec.key === "latency" && /polling|<\s*1\s*ms|zero/i.test(spec.value)
      ? { ...spec, value: "End-to-end latency: measurement pending" } : spec);
    project.en.overview = project.en.overview.replace(/zero-latency/gi, "USB-scheduled");
    project.pt.overview = project.pt.overview.replace(/de latência zero/gi, "agendado pelo USB");
    project.es.overview = project.es.overview.replace(/con latencia cero/gi, "programado por USB");
  });
  return { projects, notes: [...labNotes.filter(note => !slugs.has(note.slug)), ...notes] };
}

export function ContentProvider({ children, initialContent }: { children: ReactNode; initialContent?: PublicSnapshot }) {
  const [initial] = useState(() => initialContent ?? readPublicSnapshot());
  const [projects, setProjects] = useState(initial?.projects ?? localProjects);
  const [notes, setNotes] = useState(initial?.notes ?? localNotes);
  const [loading, setLoading] = useState(Boolean(supabase));

  const refreshContent = useCallback(async () => {
    if (!supabase) return;
    const { data: entryData, error: entryError } = await supabase
      .from("cms_entries")
      .select("id, kind, slug, date_label, category, cover_image, tags, stack, specs, featured")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (entryError) throw entryError;
    const entries = (entryData as CmsEntryRow[] | null) ?? [];
    if (entries.length === 0) return;
    const { data: translationData, error: translationError } = await supabase
      .from("cms_entry_translations")
      .select("entry_id, language, title, excerpt, overview, body")
      .in("entry_id", entries.map((entry) => entry.id));
    if (translationError) throw translationError;
    const mapped = buildCmsContent(entries, (translationData as CmsTranslationRow[] | null) ?? []);
    if (mapped.projects.length > 0) setProjects(mapped.projects);
    if (mapped.notes.length > 0) setNotes(mapped.notes);
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void refreshContent().catch((error) => {
        if (active) console.warn("CMS content is unavailable; using local fallback.", error);
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [refreshContent]);

  return <ContentContext.Provider value={{ projects, notes, loading, refreshContent }}>{children}</ContentContext.Provider>;
}

// The hook intentionally lives beside its provider so consumers share the
// same context contract; this is safe and does not affect Fast Refresh state.
// eslint-disable-next-line react-refresh/only-export-components
export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within ContentProvider");
  return context;
}
