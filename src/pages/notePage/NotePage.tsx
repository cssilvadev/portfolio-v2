import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { FaClock, FaCalendarAlt, FaTag, FaArrowLeft, FaShareAlt, FaCheck, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import MarkdownRenderer from "../../components/MarkdownRenderer/MarkdownRenderer";
import { getNoteBySlug, loadNoteBySlug, formatNoteDate, type LocalizedNote } from "../../data/notes";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";
import { getAssetUrl } from "../../utils/assets";
import "./NotePage.css";

export default function NotePage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { notes } = useContent();
  type ShareStatus = "idle" | "copying" | "copied" | "error";
  const [shareResult, setShareResult] = useState<{ key: string; status: ShareStatus }>({ key: "", status: "idle" });
  const shareTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shareRequest = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const [note, setNote] = useState<LocalizedNote>();
  const noteKey = `${slug ?? ""}:${language}`;
  const shareStatus = shareResult.key === noteKey ? shareResult.status : "idle";
  const setShareStatus = (status: ShareStatus) => setShareResult({ key: noteKey, status });
  const [loadedNoteKey, setLoadedNoteKey] = useState("");
  const isLoading = loadedNoteKey !== noteKey;

  useEffect(() => {
    let active = true;
    void loadNoteBySlug(slug ?? "", language, notes).then((loadedNote) => {
      if (!active) return;
      setNote(loadedNote);
      setLoadedNoteKey(noteKey);
    });
    return () => { active = false; };
  }, [language, noteKey, notes, slug]);

  useEffect(() => {
    document.title = `${isLoading ? t.notes.loading : note?.title ?? t.notes.notFound} — Christian Silva`;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    description?.setAttribute("content", note?.excerpt ?? t.notes.notFoundDesc);
  }, [isLoading, note, t]);

  // Track reading progress
  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const article = articleRef.current;
      const bounds = article?.getBoundingClientRect();
      // Start when the article enters view and finish at its final line.
      const progress = !isLoading && bounds
        ? Math.min(1, Math.max(0, (window.innerHeight - bounds.top) / Math.max(1, bounds.height)))
        : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    if (articleRef.current) observer.observe(articleRef.current);
    updateProgress();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isLoading, note]);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    return () => {
      shareRequest.current += 1;
      clearTimeout(shareTimer.current);
    };
  }, [noteKey]);

  const handleShare = async () => {
    if (shareStatus === "copying") return;
    const request = ++shareRequest.current;
    clearTimeout(shareTimer.current);
    setShareStatus("copying");
    try {
      await navigator.clipboard.writeText(window.location.href);
      if (request !== shareRequest.current) return;
      setShareStatus("copied");
      shareTimer.current = setTimeout(() => setShareStatus("idle"), 2500);
    } catch {
      if (request === shareRequest.current) setShareStatus("error");
    }
  };

  // Find previous and next notes for footer navigation
  const currentIndex = notes.findIndex((n) => n.slug === note?.slug);
  const rawPrevNote = currentIndex > 0 ? notes[currentIndex - 1] : null;
  const rawNextNote = currentIndex !== -1 && currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null;

  const prevNote = rawPrevNote ? getNoteBySlug(rawPrevNote.slug, language, notes) : null;
  const nextNote = rawNextNote ? getNoteBySlug(rawNextNote.slug, language, notes) : null;

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
        ref={progressRef}
        className="reading-progress-bar"
        aria-hidden="true"
      />

      <main id="main-content" tabIndex={-1} className="note-page">
        <div className="note-page-inner">
          <div className="note-page-nav">
            <Link to="/notes" className="note-back-link">
              <FaArrowLeft className="nav-arrow" aria-hidden="true" />
              <span>{t.notes.backNotes}</span>
            </Link>

            {note && (
              <button type="button" onClick={() => void handleShare()} className="note-share-btn" disabled={shareStatus === "copying"}>
                {shareStatus === "copied" ? (
                  <>
                    <FaCheck className="share-icon" aria-hidden="true" />
                    <span>{t.notes.copied}</span>
                  </>
                ) : (
                  <>
                    <FaShareAlt className="share-icon" aria-hidden="true" />
                    <span>{t.notes.share}</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className={shareStatus === "error" ? "note-share-error" : "sr-only"} role="status">
            {shareStatus === "copied" ? t.notes.copied : shareStatus === "error" ? t.notes.copyError : ""}
          </p>

          {isLoading ? (
            <div className="note-notfound" role="status">{t.notes.loading}</div>
          ) : !note ? (
            <div className="note-notfound">
              <h1>{t.notes.notFound}</h1>
              <p>{t.notes.notFoundDesc}</p>
              <Link to="/notes" className="return-btn">
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
                    {note.readingTime} {t.notes.readTime}
                  </span>
                  <span className="badge date-badge">
                    <FaCalendarAlt className="badge-icon" />
                    {formatNoteDate(note.date, language)}
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
              <article ref={articleRef} className="note-article-body">
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
