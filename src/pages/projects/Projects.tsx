import { Link } from "react-router-dom";
import { getAllLocalizedProjects } from "../../data/projects";
import { useLanguage } from "../../context/LanguageContext";
import { useContent } from "../../context/ContentContext";
import { getAssetUrl } from "../../utils/assets";
import "./Projects.css";

type ProjectCardData = ReturnType<typeof getAllLocalizedProjects>[number];

function ProjectCard({ project }: { project: ProjectCardData }) {
  const { t } = useLanguage();

  return (
    <article className="project-card">
      <div className="project-image-frame">
        <img
          src={getAssetUrl(project.image)}
          alt={project.title}
          className="project-image-top"
          onError={(event) => event.currentTarget.parentElement?.classList.add("image-error")}
        />
      </div>
      <div className="project-main">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
      <div className="project-footer">
        <span className="project-date">{project.date}</span>
        <div className="project-footer-right">
          <ul className="project-stack">
            {project.stack.map((tech) => <li key={`${project.slug}-${tech}`}>{tech}</li>)}
          </ul>
          <Link to={`/projects/${project.slug}`} className="project-view">{t.projects.viewBtn}</Link>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const { t, language } = useLanguage();
  const { projects } = useContent();
  const localizedProjects = getAllLocalizedProjects(language, projects);

  return (
    <section id="projects" className="section">
      <div className="projects-header">
        <h2>{t.projects.title}</h2>
        <div className="projects-header-line" />
      </div>

      <div className="section-inner projects">
        <div className="projects-marquee" aria-label={t.projects.title}>
          <div className="projects-marquee-set">
            {localizedProjects.map((project) => <ProjectCard key={project.slug} project={project} />)}
          </div>
          <div className="projects-marquee-set projects-marquee-clone" aria-hidden="true" inert>
            {localizedProjects.map((project) => <ProjectCard key={`${project.slug}-clone`} project={project} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
