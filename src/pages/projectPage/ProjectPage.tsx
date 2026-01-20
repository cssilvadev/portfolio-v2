import { Link, useParams } from "react-router-dom";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { projects } from "../../data/projects";

import "./ProjectPage.css";

export default function ProjectPage() {
  const { slug } = useParams();

  // protege contra alguém digitar /arm-robot.html
  const raw = (slug ?? "").toLowerCase();
  const normalized = raw.endsWith(".html") ? raw.slice(0, -5) : raw;

  const project = projects.find(
    (p) => p.slug.toLowerCase() === normalized
  );

  return (
    <>
      <Cursor />
      <NavBar />

      <main className="project-page">
        <div className="project-page-inner">
          <Link to="/#projects" className="project-back">
            ← Back to Projects
          </Link>

          {!project ? (
            <div className="project-notfound">
              <h1>Project not found</h1>
              <p>Esse slug não existe.</p>
              <Link to="/">Voltar pro início</Link>
            </div>
          ) : (
            <>
              <header className="project-header">
                <h1>{project.title}</h1>
                <p className="project-desc">{project.description}</p>
              </header>

              <img
                className="project-hero"
                src={project.image}
                alt={project.title}
              />

              <section className="project-meta">
                <span className="project-date">{project.date}</span>
                <ul className="project-stack">
                  {project.stack.map((t) => (
                    <li key={`${project.slug}-${t}`}>{t}</li>
                  ))}
                </ul>
              </section>

              <section className="project-body">
                <h2>Overview</h2>
                <p>
                  Aqui você coloca um texto mais completo: objetivo, desafios,
                  arquitetura, firmware (STM32), interface (WPF), etc.
                </p>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}
