import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaClock, FaTag } from "react-icons/fa";
import { getAllLocalizedNotes, formatNoteDate, type NoteCategory } from "../../data/notes";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";
import "./Notes.css";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";
import { editorial, type NoteFormat } from "../../data/editorial";

export default function Notes({ standalone = false }: { standalone?: boolean }) {
  const { t, language } = useLanguage();
  const { notes } = useContent();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<NoteFormat | "all">("all");
  const sectionRef = useRef<HTMLElement>(null);
  useScrollEntrance(sectionRef, `${selectedCategoryKey}:${query}:${format}:${language}:${notes.map((note) => note.slug).join(",")}`);
  const Title = standalone ? "h1" : "h2";
  const NoteTitle = standalone ? "h2" : "h3";

  const categoryOptions: { key: string; label: string; category?: NoteCategory }[] = [
    { key: "all", label: t.notes.categories.all },
    { key: "firmware", label: t.notes.categories.firmware, category: "Firmware & Embedded" },
    { key: "ai", label: t.notes.categories.ai, category: "AI & Workflows" },
    { key: "robotics", label: t.notes.categories.robotics, category: "Robotics" },
    { key: "software", label: t.notes.categories.software, category: "Software Engineering" },
  ];

  const currentOption = categoryOptions.find((c) => c.key === selectedCategoryKey);
  const localizedNotes = getAllLocalizedNotes(language, notes);
  const categoryNotes =
    !currentOption || currentOption.key === "all"
      ? localizedNotes
      : localizedNotes.filter((n) => n.category === currentOption.category);
  const matchingNotes = categoryNotes.filter(note => (!standalone || (format === "all" || note.format === format)) &&
    (!standalone || `${note.title} ${note.excerpt} ${note.tags.join(" ")}`.toLocaleLowerCase(language).includes(query.trim().toLocaleLowerCase(language))));
  const filteredNotes = standalone ? matchingNotes : [...matchingNotes].sort((a, b) =>
    Number(b.slug === "jarvis-local-ai-hud") - Number(a.slug === "jarvis-local-ai-hud") || Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.date.localeCompare(a.date),
  ).slice(0, 3);

  // Helper to translate category badge
  const getCategoryLabel = (cat: NoteCategory): string => {
    switch (cat) {
      case "Firmware & Embedded":
        return t.notes.categories.firmware;
      case "AI & Workflows":
        return t.notes.categories.ai;
      case "Robotics":
        return t.notes.categories.robotics;
      case "Software Engineering":
        return t.notes.categories.software;
      default:
        return cat;
    }
  };

  return (
    <section id="notes" ref={sectionRef} className="section notes-story">
      <div className="notes-layout">
        <div className="notes-intro">
          <p className="story-eyebrow">02 / {t.notes.title}</p>
          <Title>{t.notes.title}</Title>
          <p className="notes-tagline">
            {t.notes.tagline}
          </p>

          <div className="notes-filter-bar">
            {standalone && <div className="notes-editorial-tools">
              <label className="sr-only" htmlFor="notes-search">{editorial.search[language]}</label>
              <input id="notes-search" type="search" value={query} placeholder={editorial.search[language]} onChange={event => setQuery(event.target.value)} />
              <label className="sr-only" htmlFor="notes-format">{editorial.allFormats[language]}</label>
              <select id="notes-format" value={format} onChange={event => setFormat(event.target.value as NoteFormat | "all")}>
                <option value="all">{editorial.allFormats[language]}</option>
                {(["article", "build-log", "bench-note"] as const).map(value => <option key={value} value={value}>{editorial[value][language]}</option>)}
              </select>
              <div className="notes-editorial-links"><Link to="/lab">{editorial.lab[language]} ↗</Link><a href={`${import.meta.env.BASE_URL}feed.xml`}>RSS ↗</a></div>
              <p role="status" className="notes-search-count">{filteredNotes.length} / {localizedNotes.length}</p>
            </div>}
            <div className="category-pills">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className={`category-pill ${selectedCategoryKey === cat.key ? "active" : ""}`}
                  aria-pressed={selectedCategoryKey === cat.key}
                >
                  {cat.label}
                </button>
              ))}
            </div>

          </div>
          {!standalone && <div className="notes-editorial-links"><Link to="/notes">{editorial.browseNotes[language]} ↗</Link></div>}
        </div>

        <div className="notes-grid">
          {filteredNotes.length === 0 && (
            <div className="notes-empty" role="status">
              <p>{standalone ? editorial.noResults[language] : t.notes.emptyCategory}</p>
              <button type="button" className="category-pill" onClick={() => { setSelectedCategoryKey("all"); setQuery(""); setFormat("all"); }}>
                {standalone ? editorial.clearFilters[language] : t.notes.categories.all}
              </button>
            </div>
          )}
          {filteredNotes.map((note, index) => (
            <div key={note.slug} className="note-entrance" data-scroll-enter={standalone ? "" : undefined}>
            <article className="note-card">
              <div className="note-card-top">
                {standalone && <span className="note-format">{editorial[note.format][language]}</span>}
                <span className="note-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="note-category-badge">
                  <FaTag className="badge-icon" aria-hidden="true" />
                  {getCategoryLabel(note.category)}
                </span>
                <span className="note-read-time">
                  <FaClock className="badge-icon" aria-hidden="true" />
                  {note.readingTime} {t.notes.readTime}
                </span>
              </div>

              <div className="note-card-body">
                <NoteTitle className="note-title">
                  <Link to={`/notes/${note.slug}`}>{note.title}</Link>
                </NoteTitle>
                <p className="note-excerpt">{note.excerpt}</p>
              </div>

              <div className="note-card-footer">
                <div className="note-tags">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-item">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="note-footer-action">
                  <span className="note-date">{formatNoteDate(note.date, language)}</span>
                  <Link to={`/notes/${note.slug}`} className="note-read-btn" aria-label={`${t.notes.readBtn}: ${note.title}`}>
                    <FaBookOpen className="read-icon" aria-hidden="true" />
                    {t.notes.readBtn}
                  </Link>
                </div>
              </div>
            </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
