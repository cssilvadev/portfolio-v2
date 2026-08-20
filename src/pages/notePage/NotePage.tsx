import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaClock, FaCalendarAlt, FaTag, FaArrowLeft, FaShareAlt, FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import MarkdownRenderer from "../../components/MarkdownRenderer/MarkdownRenderer";
import { notes, getNoteBySlug } from "../../data/notes";
import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import "./NotePage.css";

export default function NotePage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const note = slug ? getNoteBySlug(slug, language) : undefined;

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Find previous and next notes for footer navigation
  const currentIndex = notes.findIndex((n) => n.slug === note?.slug);
  const rawPrevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const rawNextNote = currentIndex !== -1 && currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;

  const prevNote = rawPrevNote ? getNoteBySlug(rawPrevNote.slug, language) : null;
  const nextNote = rawNextNote ? getNoteBySlug(rawNextNote.slug, language) : null;

  const getCategoryLabel = (cat: string): string => {
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
    <>
      <Cursor />
      <NavBar />

      {/* Reading Progress Bar */}
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      <main className="note-page">
        <div className="note-page-inner">
          <div className="note-page-nav">
            <Link to="/#notes" className="note-back-link">
              <FaArrowLeft className="nav-arrow" />
              <span>{t.notes.backNotes}</span>
            </Link>

            {note && (
              <button onClick={handleShare} className="note-share-btn">
                {copiedLink ? (
                  <>
                    <FaCheck className="share-icon" />
                    <span>{t.notes.copied}</span>
                  </>
                ) : (
                  <>
                    <FaShareAlt className="share-icon" />
                    <span>{t.notes.share}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {!note ? (
            <div className="note-notfound">
              <h1>{t.notes.notFound}</h1>
              <p>{t.notes.notFoundDesc}</p>
              <Link to="/#notes" className="return-btn">
                {t.notes.returnBtn}
              </Link>
            </div>
          ) : (
            <>
              {/* NOTE HEADER */}
              <header className="note-article-header">
                <div className="note-meta-badges">
                  <span className="badge category-badge">
                    <FaTag className="badge-icon" />
                    {getCategoryLabel(note.category)}
                  </span>
                  <span className="badge time-badge">
                    <FaClock className="badge-icon" />
                    {note.readingTime.replace("min read", t.notes.readTime)}
                  </span>
                  <span className="badge date-badge">
                    <FaCalendarAlt className="badge-icon" />
                    {note.date}
                  </span>
                </div>

                <h1 className="note-article-title">{note.title}</h1>
                <p className="note-article-excerpt">{note.excerpt}</p>

                <div className="note-article-tags">
                  {note.tags.map((tagItem) => (
                    <span key={tagItem} className="tag-pill">
                      #{tagItem}
                    </span>
                  ))}
                </div>
              </header>

              {/* COVER IMAGE */}
              {note.coverImage && (
                <div className="note-hero-wrapper">
                  <img
                    src={getAssetUrl(note.coverImage)}
                    alt={note.title}
                    className="note-hero-img"
                  />
                </div>
              )}

              {/* NOTE BODY */}
              <article className="note-article-body">
                <MarkdownRenderer content={note.content} />
              </article>

              {/* FOOTER PREV / NEXT NAVIGATION */}
              <nav className="note-footer-nav">
                {prevNote ? (
                  <Link to={`/notes/${prevNote.slug}`} className="nav-card prev-card">
                    <span className="nav-label">
                      <FaChevronLeft /> {t.notes.prevNote}
                    </span>
                    <span className="nav-card-title">{prevNote.title}</span>
                  </Link>
                ) : (
                  <div />
                )}

                {nextNote && (
                  <Link to={`/notes/${nextNote.slug}`} className="nav-card next-card">
                    <span className="nav-label">
                      {t.notes.nextNote} <FaChevronRight />
                    </span>
                    <span className="nav-card-title">{nextNote.title}</span>
                  </Link>
                )}
              </nav>
            </>
          )}
        </div>
      </main>
    </>
  );
}
