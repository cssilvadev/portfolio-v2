import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { useContent } from "../../context/ContentContext";
import { useLanguage } from "../../context/LanguageContext";
import { getAllLocalizedProjects } from "../../data/projects";
import { getAssetUrl } from "../../utils/assets";
import "./ProjectIndex.css";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";
import { editorial, projectStatus } from "../../data/editorial";

export default function ProjectIndex() {
  const { t, language } = useLanguage();
  const { projects } = useContent();
  const [query, setQuery] = useState("");
  const mainRef = useRef<HTMLElement>(null);
  const allProjects = [...getAllLocalizedProjects(language, projects)]
    .sort((a, b) => Number(b.date) - Number(a.date));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleProjects = normalizedQuery
    ? allProjects.filter((project) =>
      [project.title, project.description, project.date, ...project.stack]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery)),
    )
    : allProjects;
  useScrollEntrance(mainRef, `${language}:${visibleProjects.map((project) => project.slug).join(",")}`);

  useEffect(() => {
    document.title = `${t.projects.title} — Christian Silva`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", t.projects.indexIntro);
  }, [t]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  return (
    <>
      <Cursor />
      <NavBar />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="project-index">
        <header className="project-index-hero">
          <div className="project-index-heading">
            <p className="story-eyebrow">01 / {t.projects.title}</p>
            <h1>{t.projects.title}</h1>
          </div>
          <div className="project-index-intro">
            <div>
              <p>{t.projects.indexIntro}</p>
              <Link className="project-editorial-link" to="/notes">{t.nav.notes} <span aria-hidden="true">↗</span></Link>
              <Link className="project-editorial-link" to="/lab">{editorial.lab[language]} <span aria-hidden="true">↗</span></Link>
            </div>
            <span>{String(allProjects.length).padStart(2, "0")}</span>
          </div>
        </header>

        <section className="project-index-catalog" aria-label={t.projects.title}>
          <div className="project-index-toolbar">
            <span role="status">{String(visibleProjects.length).padStart(2, "0")} / {String(allProjects.length).padStart(2, "0")}</span>
            <label className="project-search">
              <span className="sr-only">{t.projects.searchPlaceholder}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.projects.searchPlaceholder}
              />
              <span aria-hidden="true">⌕</span>
            </label>
          </div>
          {visibleProjects.length === 0 ? (
            <p className="project-index-empty">{t.projects.noResults}</p>
          ) : (
            <div className="project-index-grid">
              {visibleProjects.map((project, index) => (
                <article className="project-index-entry" data-scroll-enter key={project.slug}>
                <Link to={`/projects/${project.slug}`} className="project-index-card">
                  <div className="project-index-image">
                    <div className="project-index-artwork">
                    <img src={getAssetUrl(project.image)} alt="" loading="lazy" decoding="async" />
                    </div>
                    <span className="project-index-arrow" aria-hidden="true">↗</span>
                  </div>
                  <div className="project-index-card-meta">
                    <span>{String(index + 1).padStart(2, "0")} / {project.date}</span>
                    <span>{project.stack.slice(0, 3).join(" · ")}</span>
                  </div>
                  <h2>{project.title}</h2>
                  <span className="project-status">{projectStatus(project.slug, language)}</span>
                  <p>{project.description}</p>
                </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
