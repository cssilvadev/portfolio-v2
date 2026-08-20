import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaClock, FaTag, FaPlus } from "react-icons/fa";
import { getAllLocalizedNotes, type NoteCategory } from "../../data/notes";
import { useLanguage } from "../../context/LanguageContext";
import "./Notes.css";

export default function Notes() {
  const { t, language } = useLanguage();
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("all");

  const categoryOptions: { key: string; label: string; category?: NoteCategory }[] = [
    { key: "all", label: t.notes.categories.all },
    { key: "firmware", label: t.notes.categories.firmware, category: "Firmware & Embedded" },
    { key: "ai", label: t.notes.categories.ai, category: "AI & Workflows" },
    { key: "robotics", label: t.notes.categories.robotics, category: "Robotics" },
  ];

  const currentOption = categoryOptions.find((c) => c.key === selectedCategoryKey);
  const localizedNotes = getAllLocalizedNotes(language);
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
    <section id="notes" className="section">
      {/* SECTION TITLE */}
      <div className="notes-header">
        <h2>{t.notes.title}</h2>
        <div className="notes-header-line"></div>
      </div>

      <div className="section-inner notes-section">
        {/* SUBTITLE & CATEGORY FILTER */}
        <div className="notes-intro">
          <p className="notes-tagline">
            {t.notes.tagline}
          </p>

          <div className="notes-filter-bar">
            <div className="category-pills">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  className={`category-pill ${selectedCategoryKey === cat.key ? "active" : ""}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Studio Button is strictly only visible in Development mode */}
            {import.meta.env.DEV && (
              <Link to="/studio" className="studio-btn" title="Open Note Studio (Admin/Dev)">
                <FaPlus className="studio-icon" />
                <span>{t.notes.noteStudio}</span>
              </Link>
            )}
          </div>
        </div>

        {/* NOTES GRID */}
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article key={note.slug} className="note-card">
              <div className="note-card-top">
                <span className="note-category-badge">
                  <FaTag className="badge-icon" />
                  {getCategoryLabel(note.category)}
                </span>
                <span className="note-read-time">
                  <FaClock className="badge-icon" />
                  {note.readingTime}
                </span>
              </div>

              <div className="note-card-body">
                <h3 className="note-title">
                  <Link to={`/notes/${note.slug}`}>{note.title}</Link>
                </h3>
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
                  <span className="note-date">{note.date}</span>
                  <Link to={`/notes/${note.slug}`} className="note-read-btn">
                    <FaBookOpen className="read-icon" />
                    {t.notes.readBtn}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
