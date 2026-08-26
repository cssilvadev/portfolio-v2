import { Link, useParams } from "react-router-dom";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { getProjectBySlug } from "../../data/projects";
import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";

import "./ProjectPage.css";

export default function ProjectPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();

  const project = slug ? getProjectBySlug(slug, language) : undefined;

  return (
    <>
      <Cursor />
      <NavBar />

      <main className="project-page">
        <div className="project-page-inner">
          <Link to="/#projects" className="project-back">
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
                <h1>{project.title}</h1>
                <p className="project-desc">{project.description}</p>
              </header>

              <img
                className="project-hero"
                src={getAssetUrl(project.image)}
                alt={project.title}
              />

              <section className="project-meta">
                <span className="project-date">{project.date}</span>
                <ul className="project-stack">
                  {project.stack.map((tItem) => (
                    <li key={`${project.slug}-${tItem}`}>{tItem}</li>
                  ))}
                </ul>
              </section>

              <section className="project-body">
                <h2>{t.projects.overview}</h2>
                <p>{project.overview}</p>
              </section>

              {project.specs.length > 0 && (
                <section className="project-specs">
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
            </>
          )}
        </div>
      </main>
    </>
  );
}
