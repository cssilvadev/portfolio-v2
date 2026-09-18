import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { notes as localNotes, type Note, type NoteCategory } from "../data/notes";
import { projects as localProjects, type Project, type ProjectSpec } from "../data/projects";
import { supabase } from "../lib/supabase";

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

function buildCmsContent(entries: CmsEntryRow[], translations: CmsTranslationRow[]) {
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
  return { projects, notes };
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(localProjects);
  const [notes, setNotes] = useState(localNotes);
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
