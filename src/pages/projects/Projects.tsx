import "./Projects.css";

const projects = [
  {
     slug: "arm-robot",
    title: "Arm Robot ",
    description:
      "Firmware and desktop interface for a Arm Robot.",
    date: "2024",
    image: "/projects/haptic-chair.png",
    stack: ["STM32", "C", "C#", "WPF", "PWM"],
  },
  {
    slug: "g27-pedal-adapter",
    title: "G27 Pedal Adapter",
    description:
      "Custom USB HID Pedal Adapter.",
    date: "2023",
    image: "/projects/steering-wheel.png",
    stack: ["STM32", "C", "USB HID"],
  },
  {
    slug: "can-telemetry-monitor",
    title: "CAN Telemetry Monitor",
    description:
      "Real-time CAN bus analyzer with desktop interface.",
    date: "2023",
    image: "/projects/can-monitor.png",
    stack: ["CAN", "C#", ".NET"],
  },
  {
    slug: "interactive-portfolio",
    title: "Interactive Portfolio",
    description:
      "Personal portfolio with interactive visuals.",
    date: "2025",
    image: "/projects/portfolio.png",
    stack: ["React", "TypeScript", "CSS"],
  },
  {
    slug: "quadruped-robot",
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

<a href="./projects/arm-robot.html" className="project-view">
  View
</a>



                </div>
              </div>

            </article>
          ))}

        </div>
      </div>

    </section>
  );
}
