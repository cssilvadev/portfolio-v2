import "./About.css";

export default function About() {
  return (
    <section id="about" className="section">
      <div className="section-inner about">
        <h2 className="section-title">About</h2>

        <div className="about-content">
          <p>
            I'm a software and firmware engineer focused on building reliable
            systems, embedded solutions and interactive experiences.
          </p>

          <p className="muted">
            Currently working with C, C#, STM32, CAN networks and frontend
            interfaces.
          </p>
        </div>
      </div>
    </section>
  );
}
