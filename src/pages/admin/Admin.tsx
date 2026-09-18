import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaSave, FaTrash, FaUpload, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { useAuth } from "../../context/AuthContext";
import { useContent } from "../../context/ContentContext";
import { loadNoteBySlug, notes as localNotes } from "../../data/notes";
import { projects as localProjects } from "../../data/projects";
import { supabase } from "../../lib/supabase";
import "./Admin.css";

type CmsKind = "article" | "project" | "page";
type CmsLanguage = "en" | "pt" | "es";
type TranslationDraft = { title: string; excerpt: string; overview: string; body: string };
type Draft = {
  id?: string;
  kind: CmsKind;
  slug: string;
  dateLabel: string;
  category: string;
  coverImage: string;
  tags: string;
  stack: string;
  specs: string;
  featured: boolean;
  published: boolean;
  translations: Record<CmsLanguage, TranslationDraft>;
};
type CmsEntry = Omit<Draft, "translations" | "id" | "tags" | "stack" | "specs"> & {
  id: string;
  tags: string[];
  stack: string[];
  specs: Array<{ key: string; value: string }>;
  translations: Record<CmsLanguage, TranslationDraft>;
};
type CmsEntryRow = {
  id: string;
  kind: CmsKind;
  slug: string;
  date_label: string;
  category: string | null;
  cover_image: string | null;
  tags: string[];
  stack: string[];
  specs: unknown;
  featured: boolean;
  published: boolean;
};

const languages: CmsLanguage[] = ["en", "pt", "es"];

function emptyTranslation(): TranslationDraft {
  return { title: "", excerpt: "", overview: "", body: "" };
}

function emptyDraft(): Draft {
  return {
    kind: "article",
    slug: "",
    dateLabel: new Date().toISOString().slice(0, 7),
    category: "Firmware & Embedded",
    coverImage: "",
    tags: "",
    stack: "",
    specs: "",
    featured: false,
    published: false,
    translations: { en: emptyTranslation(), pt: emptyTranslation(), es: emptyTranslation() },
  };
}

function listFromText(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 32);
}

function specsFromText(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const separator = line.indexOf(":");
    return separator === -1
      ? { key: line, value: "" }
      : { key: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() };
  }).filter((item) => item.key && item.value).slice(0, 32);
}

function entryToDraft(entry: CmsEntry): Draft {
  return {
    id: entry.id,
    kind: entry.kind,
    slug: entry.slug,
    dateLabel: entry.dateLabel,
    category: entry.category,
    coverImage: entry.coverImage,
    tags: entry.tags.join(", "),
    stack: entry.stack.join(", "),
    specs: entry.specs.map((spec) => `${spec.key}: ${spec.value}`).join("\n"),
    featured: entry.featured,
    published: entry.published,
    translations: entry.translations,
  };
}

export default function Admin() {
  const { user, profile, loading: authLoading, openAuthModal } = useAuth();
  const { refreshContent } = useContent();
  const [entries, setEntries] = useState<CmsEntry[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    if (!supabase || !profile || profile.role !== "admin") return;
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("cms_entries")
      .select("id, kind, slug, date_label, category, cover_image, tags, stack, specs, featured, published")
      .order("updated_at", { ascending: false });
    if (queryError) {
      setError("Não foi possível carregar o conteúdo.");
      setLoading(false);
      return;
    }
    const rows = (data as CmsEntryRow[] | null) ?? [];
    const ids = rows.map((row) => row.id);
    const { data: translationData, error: translationError } = ids.length > 0
      ? await supabase.from("cms_entry_translations").select("entry_id, language, title, excerpt, overview, body").in("entry_id", ids)
      : { data: [], error: null };
    if (translationError) {
      setError("Não foi possível carregar as traduções.");
      setLoading(false);
      return;
    }
    const byEntry = new Map<string, Record<CmsLanguage, TranslationDraft>>();
    (translationData as Array<{ entry_id: string; language: CmsLanguage } & TranslationDraft> | null ?? []).forEach((translation) => {
      const translations = byEntry.get(translation.entry_id) ?? { en: emptyTranslation(), pt: emptyTranslation(), es: emptyTranslation() };
      translations[translation.language] = {
        title: translation.title,
        excerpt: translation.excerpt,
        overview: translation.overview,
        body: translation.body,
      };
      byEntry.set(translation.entry_id, translations);
    });
    setEntries(rows.map((row) => ({
      ...row,
      category: row.category ?? "",
      coverImage: row.cover_image ?? "",
      dateLabel: row.date_label,
      tags: row.tags ?? [],
      stack: row.stack ?? [],
      specs: Array.isArray(row.specs) ? row.specs as Array<{ key: string; value: string }> : [],
      translations: byEntry.get(row.id) ?? { en: emptyTranslation(), pt: emptyTranslation(), es: emptyTranslation() },
    })));
    setLoading(false);
  }, [profile]);

  useEffect(() => { void loadEntries(); }, [loadEntries]);

  const sortedEntries = useMemo(() => entries, [entries]);

  if (authLoading) return <div className="admin-state">Carregando sessão…</div>;
  if (!user) {
    return <div className="admin-state"><h1>Área administrativa</h1><p>Entre com sua conta de administrador para continuar.</p><button type="button" onClick={() => openAuthModal("login")}>Entrar</button></div>;
  }
  if (profile?.role !== "admin") {
    return <div className="admin-state"><h1>Acesso negado</h1><p>Esta conta não possui permissão administrativa.</p><Link to="/">Voltar ao portfólio</Link></div>;
  }

  const updateTranslation = (language: CmsLanguage, field: keyof TranslationDraft, value: string) => {
    setDraft((current) => ({
      ...current,
      translations: { ...current.translations, [language]: { ...current.translations[language], [field]: value } },
    }));
  };

  const saveEntry = async () => {
    if (!supabase || !user) return;
    setError("");
    setMessage("");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
      setError("Use um slug com letras minúsculas, números e hífens.");
      return;
    }
    if (!draft.translations.en.title.trim()) {
      setError("O título em inglês é obrigatório.");
      return;
    }
    if (draft.kind === "article" && !draft.translations.en.body.trim()) {
      setError("O conteúdo em inglês é obrigatório para artigos.");
      return;
    }
    if (draft.kind === "project" && !draft.translations.en.overview.trim()) {
      setError("A visão geral em inglês é obrigatória para projetos.");
      return;
    }
    setBusy(true);
    const { data: saved, error: saveError } = await supabase.from("cms_entries").upsert({
      ...(draft.id ? { id: draft.id } : {}),
      kind: draft.kind,
      slug: draft.slug,
      date_label: draft.dateLabel.trim().slice(0, 32),
      category: draft.category.trim() || null,
      cover_image: draft.coverImage.trim() || null,
      tags: listFromText(draft.tags),
      stack: listFromText(draft.stack),
      specs: specsFromText(draft.specs),
      featured: draft.featured,
      published: draft.published,
      created_by: user.id,
    }, { onConflict: "kind,slug" }).select("id").single();
    if (saveError || !saved) {
      setBusy(false);
      setError("Não foi possível salvar este conteúdo.");
      return;
    }
    const { error: translationsError } = await supabase.from("cms_entry_translations").upsert(
      languages.map((language) => ({ entry_id: saved.id, language, ...draft.translations[language] })),
      { onConflict: "entry_id,language" },
    );
    if (translationsError) {
      setBusy(false);
      setError("O conteúdo foi salvo, mas as traduções falharam.");
      return;
    }
    await loadEntries();
    await refreshContent();
    setDraft((current) => ({ ...current, id: saved.id }));
    setMessage("Conteúdo salvo com sucesso.");
    setBusy(false);
  };

  const deleteEntry = async () => {
    if (!supabase || !draft.id || !window.confirm("Excluir este conteúdo?")) return;
    setBusy(true);
    const { error: deleteError } = await supabase.from("cms_entries").delete().eq("id", draft.id);
    if (deleteError) setError("Não foi possível excluir este conteúdo.");
    else { setDraft(emptyDraft()); await loadEntries(); await refreshContent(); setMessage("Conteúdo excluído."); }
    setBusy(false);
  };

  const importLocalContent = async () => {
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    try {
      for (const project of localProjects) {
        const { data: saved, error: saveError } = await supabase.from("cms_entries").upsert({
          kind: "project", slug: project.slug, date_label: project.date, cover_image: project.image,
          stack: project.stack, specs: project.specs, published: true, created_by: user.id,
        }, { onConflict: "kind,slug" }).select("id").single();
        if (saveError || !saved) throw saveError ?? new Error("Project import failed");
        await supabase.from("cms_entry_translations").upsert(languages.map((language) => ({
          entry_id: saved.id, language, title: project[language].title, excerpt: project[language].description,
          overview: project[language].overview, body: "",
        })), { onConflict: "entry_id,language" });
      }
      for (const note of localNotes) {
        const loaded = await Promise.all(languages.map((language) => loadNoteBySlug(note.slug, language)));
        const { data: saved, error: saveError } = await supabase.from("cms_entries").upsert({
          kind: "article", slug: note.slug, date_label: note.date, category: note.category, cover_image: note.coverImage ?? null,
          tags: note.tags, published: true, featured: note.featured ?? false, created_by: user.id,
        }, { onConflict: "kind,slug" }).select("id").single();
        if (saveError || !saved) throw saveError ?? new Error("Article import failed");
        await supabase.from("cms_entry_translations").upsert(languages.map((language, index) => ({
          entry_id: saved.id, language, title: note[language].title, excerpt: note[language].excerpt,
          overview: "", body: loaded[index]?.content ?? "",
        })), { onConflict: "entry_id,language" });
      }
      await loadEntries();
      await refreshContent();
      setMessage("Conteúdo local importado para o CMS.");
    } catch {
      setError("A importação foi interrompida. Verifique as permissões do banco.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Cursor />
      <NavBar />
      <main className="admin-page">
        <div className="admin-container">
          <header className="admin-header">
            <div><Link to="/" className="admin-back"><FaArrowLeft /> Voltar</Link><h1>CMS do portfólio</h1><p>Gerencie artigos, projetos e páginas sem editar código.</p></div>
            <div className="admin-actions"><button type="button" onClick={() => setDraft(emptyDraft())}><FaPlus /> Novo</button><button type="button" onClick={() => void importLocalContent()} disabled={busy}><FaUpload /> Importar conteúdo atual</button></div>
          </header>
          {error && <p className="admin-alert error" role="alert">{error}</p>}
          {message && <p className="admin-alert success" role="status">{message}</p>}
          <div className="admin-layout">
            <aside className="admin-list">
              <h2>Conteúdos {loading && "…"}</h2>
              {sortedEntries.map((entry) => <button type="button" key={entry.id} className={`admin-list-item ${draft.id === entry.id ? "active" : ""}`} onClick={() => setDraft(entryToDraft(entry))}><strong>{entry.translations.en.title || entry.slug}</strong><span>{entry.kind} · {entry.published ? "publicado" : "rascunho"}</span></button>)}
              {sortedEntries.length === 0 && <p>Nenhum conteúdo no banco ainda.</p>}
            </aside>
            <section className="admin-editor">
              <div className="admin-form-grid">
                <label>Tipo<select value={draft.kind} onChange={(event) => setDraft({ ...draft, kind: event.target.value as CmsKind })}><option value="article">Artigo</option><option value="project">Projeto</option><option value="page">Página</option></select></label>
                <label>Slug<input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} placeholder="meu-artigo" /></label>
                <label>Data<input value={draft.dateLabel} onChange={(event) => setDraft({ ...draft, dateLabel: event.target.value })} placeholder="2026-09" /></label>
                <label>Categoria<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Robotics" /></label>
                <label>Imagem<input value={draft.coverImage} onChange={(event) => setDraft({ ...draft, coverImage: event.target.value })} placeholder="/projects/portfolio.svg" /></label>
                <label>Tags<input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="React, TypeScript" /></label>
                <label>Stack<input value={draft.stack} onChange={(event) => setDraft({ ...draft, stack: event.target.value })} placeholder="STM32, C" /></label>
                <label className="admin-checkbox"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Destaque</label>
                <label className="admin-checkbox"><input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} /> Publicado</label>
              </div>
              <label>Especificações — uma por linha, no formato <code>chave: valor</code><textarea value={draft.specs} onChange={(event) => setDraft({ ...draft, specs: event.target.value })} rows={4} /></label>
              <div className="admin-translations">
                {languages.map((language) => <fieldset key={language}><legend>{language.toUpperCase()}</legend><label>Título<input value={draft.translations[language].title} onChange={(event) => updateTranslation(language, "title", event.target.value)} /></label><label>Resumo<input value={draft.translations[language].excerpt} onChange={(event) => updateTranslation(language, "excerpt", event.target.value)} /></label><label>Visão geral<textarea value={draft.translations[language].overview} onChange={(event) => updateTranslation(language, "overview", event.target.value)} rows={4} /></label><label>Conteúdo Markdown<textarea value={draft.translations[language].body} onChange={(event) => updateTranslation(language, "body", event.target.value)} rows={10} /></label></fieldset>)}
              </div>
              <div className="admin-editor-actions"><button type="button" className="primary" onClick={() => void saveEntry()} disabled={busy}><FaSave /> {busy ? "Salvando…" : "Salvar"}</button>{draft.id && <button type="button" className="danger" onClick={() => void deleteEntry()} disabled={busy}><FaTrash /> Excluir</button>}</div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
