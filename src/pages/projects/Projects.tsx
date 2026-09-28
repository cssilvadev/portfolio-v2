import { Link } from "react-router-dom";
import { getAllLocalizedProjects } from "../../data/projects";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";
import { getAssetUrl } from "../../utils/assets";
import "./Projects.css";
import { useRef } from "react";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";

type ProjectCardData = ReturnType<typeof getAllLocalizedProjects>[number];

function ProjectPanel({ project, index, total }: { project: ProjectCardData; index: number; total: number }) {
  const { t } = useLanguage();

  return (
    <article className="project-panel" data-scroll-enter style={{ zIndex: index + 1 }}>
      <div className="project-panel-inner">
        <div className="project-panel-copy">
          <p className="project-panel-index">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} — {project.date}</p>
          <h3>{project.title}</h3>
          <p className="project-panel-description">{project.description}</p>
          <ul className="project-panel-stack">
            {project.stack.map((tech) => <li key={`${project.slug}-${tech}`}>{tech}</li>)}
          </ul>
          <Link to={`/projects/${project.slug}`} className="project-panel-link" aria-label={`${t.projects.viewBtn}: ${project.title}`}>{t.projects.viewBtn} <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="project-panel-visual">
          <img src={getAssetUrl(project.image)} alt={project.title} loading="lazy" decoding="async" />
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const { t, language } = useLanguage();
  const { projects } = useContent();
  const sectionRef = useRef<HTMLElement>(null);
  const localizedProjects = getAllLocalizedProjects(language, projects);
  const featuredProjects = [...localizedProjects]
    .sort((a, b) => Number(b.date) - Number(a.date))
    .slice(0, 3);
  useScrollEntrance(sectionRef, featuredProjects.map((project) => project.slug).join(":"));

  return (
    <section id="projects" ref={sectionRef} className="section projects-story">
      <div className="projects-intro">
        <p className="story-eyebrow">01 / {t.projects.title}</p>
        <h2>{t.projects.featured}</h2>
        <Link to="/projects" className="projects-all-link">{t.projects.allProjects} <span aria-hidden="true">↗</span></Link>
        <span className="projects-intro-count">{String(featuredProjects.length).padStart(2, "0")}</span>
      </div>
      <div className="projects-showcase">
        {featuredProjects.map((project, index) => (
          <ProjectPanel key={project.slug} project={project} index={index} total={featuredProjects.length} />
        ))}
      </div>
      <div className="projects-outro">
        <p className="story-eyebrow">{t.projects.title} / {String(localizedProjects.length).padStart(2, "0")}</p>
        <Link to="/projects" className="projects-outro-link">{t.projects.allProjects} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
