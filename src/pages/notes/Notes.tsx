import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaClock, FaTag } from "react-icons/fa";
import { getAllLocalizedNotes, formatNoteDate, type NoteCategory } from "../../data/notes";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";
import "./Notes.css";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";

export default function Notes({ standalone = false }: { standalone?: boolean }) {
  const { t, language } = useLanguage();
  const { notes } = useContent();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("all");
  const sectionRef = useRef<HTMLElement>(null);
  useScrollEntrance(sectionRef, `${selectedCategoryKey}:${language}:${notes.map((note) => note.slug).join(",")}`);
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
  const filteredNotes =
    !currentOption || currentOption.key === "all"
      ? localizedNotes
      : localizedNotes.filter((n) => n.category === currentOption.category);

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
        </div>

        <div className="notes-grid">
          {filteredNotes.length === 0 && (
            <div className="notes-empty" role="status">
              <p>{t.notes.emptyCategory}</p>
              <button type="button" className="category-pill" onClick={() => setSelectedCategoryKey("all")}>
                {t.notes.categories.all}
              </button>
            </div>
          )}
          {filteredNotes.map((note, index) => (
            <div key={note.slug} className="note-entrance" data-scroll-enter={standalone ? "" : undefined}>
            <article className="note-card">
              <div className="note-card-top">
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
