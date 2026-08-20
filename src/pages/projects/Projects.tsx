import { Link } from "react-router-dom";
import { getAllLocalizedProjects } from "../../data/projects";
import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import "./Projects.css";

export default function Projects() {
  const { t, language } = useLanguage();
  const localizedProjects = getAllLocalizedProjects(language);

  return (
    <section id="projects" className="section">

      {/* TITLE */}
      <div className="projects-header">
        <h2>{t.projects.title}</h2>
        <div className="projects-header-line"></div>
      </div>

      {/* CONTENT */}
      <div className="section-inner projects">
        <div className="projects-marquee">

          {[...localizedProjects, ...localizedProjects].map((project, index) => (
            <article key={index} className="project-card">

              {/* ABOVE IMAGE */}
              <img
                src={getAssetUrl(project.image)}
                alt={project.title}
                className="project-image-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />

              {/* TEXT */}
              <div className="project-main">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>

              {/* FOOTER */}
              <div className="project-footer">
                <span className="project-date">{project.date}</span>

                <div className="project-footer-right">
                  <ul className="project-stack">
                    {project.stack.map((tech, i) => (
                      <li key={i}>{tech}</li>
                    ))}
                  </ul>

                  <Link to={`/projects/${project.slug}`} className="project-view">
                    {t.projects.viewBtn}
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
