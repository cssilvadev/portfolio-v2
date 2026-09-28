import { Link, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { getAllLocalizedProjects, getProjectBySlug } from "../../data/projects";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";
import { getAssetUrl } from "../../utils/assets";

import "./ProjectPage.css";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";

export default function ProjectPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const { projects } = useContent();

  const project = slug ? getProjectBySlug(slug, language, projects) : undefined;
  const mainRef = useRef<HTMLElement>(null);
  const orderedProjects = [...getAllLocalizedProjects(language, projects)].sort((a, b) => Number(b.date) - Number(a.date));
  const nextProject = orderedProjects.length > 1
    ? orderedProjects[(orderedProjects.findIndex((item) => item.slug === slug) + 1) % orderedProjects.length]
    : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);
  useScrollEntrance(mainRef, `${slug}:${language}:${project?.specs.length ?? 0}`);

  useEffect(() => {
    document.title = project ? `${project.title} — Christian Silva` : `${t.projects.notFound} — Christian Silva`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
      "content",
      project?.description ?? t.projects.notFoundDesc,
    );
  }, [project, t]);

  return (
    <>
      <Cursor />
      <NavBar />

      <main id="main-content" ref={mainRef} tabIndex={-1} className="project-page" key={slug}>
        <div className="project-page-inner">
          <Link to="/projects" className="project-back">
            {t.projects.backBtn}
          </Link>

          {!project ? (
            <div className="project-notfound">
              <h1>{t.projects.notFound}</h1>
              <p>{t.projects.notFoundDesc}</p>
              <Link to="/">{t.projects.backHome}</Link>
            </div>
          ) : (
            <>
              <header className="project-header">
                <p className="project-kicker">{t.projects.title} / {project.date}</p>
                <h1>{project.title}</h1>
                <p className="project-desc">{project.description}</p>
              </header>

              <div className="project-hero-scene" data-scroll-enter>
              <div className="project-hero-frame">
              <img
                className="project-hero"
                src={getAssetUrl(project.image)}
                alt={project.title}
              />
              </div>
              </div>

              <section className="project-meta">
                <span className="project-date">{t.projects.overview} / {project.date}</span>
                <ul className="project-stack">
                  {project.stack.map((tItem) => (
                    <li key={`${project.slug}-${tItem}`}>{tItem}</li>
                  ))}
                </ul>
              </section>

              <section className="project-body" data-scroll-enter>
                <h2>{t.projects.overview}</h2>
                <p>{project.overview}</p>
              </section>

              {project.specs.length > 0 && (
                <section className="project-specs" data-scroll-enter>
                  <h2>{t.projects.specsTitle}</h2>
                  <dl className="specs-grid">
                    {project.specs.map((spec) => (
                      <div className="spec-row" key={`${project.slug}-${spec.key}`}>
                        <dt>{t.projects.specLabels[spec.key] ?? spec.key}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              <footer className="project-continuation" data-scroll-enter>
                {nextProject && (
                  <Link to={`/projects/${nextProject.slug}`} className="project-next">
                    <div>
                      <span className="project-kicker">{t.projects.nextProject}</span>
                      <h2>{nextProject.title}</h2>
                    </div>
                    <img src={getAssetUrl(nextProject.image)} alt="" loading="lazy" decoding="async" />
                    <span className="project-next-arrow" aria-hidden="true">↗</span>
                  </Link>
                )}
                <div className="project-continuation-links">
                  <Link className="project-editorial-link" to="/projects">{t.projects.allProjects} <span aria-hidden="true">↗</span></Link>
                  <Link className="project-editorial-link" to="/notes">{t.nav.notes} <span aria-hidden="true">↗</span></Link>
                </div>
              </footer>
            </>
          )}
        </div>
      </main>
    </>
  );
}
