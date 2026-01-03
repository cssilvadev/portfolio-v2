import "./Projects.css";

const projects = [
  {
    title: "Haptic Chair Controller",
    description:
      "Firmware and desktop interface for a multi-channel haptic feedback chair.",
    stack: ["STM32", "C", "C#", "WPF", "PWM"],
  },
  {
    title: "Force Feedback Steering Wheel",
    description:
      "Custom USB HID steering wheel with force feedback.",
    stack: ["STM32", "C", "USB HID"],
  },
  {
    title: "CAN Telemetry Monitor",
    description:
      "Real-time CAN bus analyzer with desktop interface.",
    stack: ["CAN", "C#", ".NET"],
  },
  {
    title: "Interactive Portfolio",
    description:
      "Personal portfolio with interactive visuals.",
    stack: ["React", "TypeScript", "CSS"],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="section">

      {/* TÍTULO DA SEÇÃO */}
      <div className="projects-header">
        <h2>PROJECTS</h2>
        <div className="projects-header-line"></div>
      </div>

      {/* CONTEÚDO */}
      <div className="section-inner projects">
        <div className="projects-grid">
          {projects.map((project, index) => (
            <article key={index} className="project-card">
              <h3>{project.title}</h3>
              <p>{project.description}</p>

              <ul className="project-stack">
                {project.stack.map((tech, i) => (
                  <li key={i}>{tech}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

    </section>
  );
}
