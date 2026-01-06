import "./Projects.css";

const projects = [
  {
    title: "Arm Robot ",
    description:
      "Firmware and desktop interface for a Arm Robot.",
    date: "2024",
    image: "/projects/haptic-chair.png",
    stack: ["STM32", "C", "C#", "WPF", "PWM"],
  },
  {
    title: "G27 Pedal Adapter",
    description:
      "Custom USB HID Pedal Adapter.",
    date: "2023",
    image: "/projects/steering-wheel.png",
    stack: ["STM32", "C", "USB HID"],
  },
  {
    title: "CAN Telemetry Monitor",
    description:
      "Real-time CAN bus analyzer with desktop interface.",
    date: "2023",
    image: "/projects/can-monitor.png",
    stack: ["CAN", "C#", ".NET"],
  },
  {
    title: "Interactive Portfolio",
    description:
      "Personal portfolio with interactive visuals.",
    date: "2025",
    image: "/projects/portfolio.png",
    stack: ["React", "TypeScript", "CSS"],
  },
  {
    title: "Quadruped Robot",
    description:
      "Quadruped robot with ESP32 using MAUI to control via Android Phone.",
    date: "2026",
    image: "/projects/seatbelt.png",
    stack: ["STM32", "C", "PWM"],
  },
];

export default function Projects() {
  return (
    <section id="projects" className="section">

      {/* TITLE */}
      <div className="projects-header">
        <h2>PROJECTS</h2>
        <div className="projects-header-line"></div>
      </div>

      {/* CONTENT */}
      <div className="section-inner projects">
        <div className="projects-marquee">

          {[...projects, ...projects].map((project, index) => (
            <article key={index} className="project-card">

              {/* AOBVE IMAGE */}
              <img
                src={project.image}
                alt={project.title}
                className="project-image-top"
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

                  <button className="project-view">View</button>
                </div>
              </div>

            </article>
          ))}

        </div>
      </div>

    </section>
  );
}
