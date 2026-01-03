import "./About.css";

export default function About() {
  return (
    <section id="about" className="section">

      {/* SECTION TITLE */}
      <div className="section-title">
        <h2>ABOUT</h2>
        <div className="section-title-line"></div>
      </div>

      {/* CONTENT */}
      <div className="section-inner about">

        <div className="about-grid">

          {/* PHOTO */}
          <div className="about-photo">
            <img src="/profile.jpg" alt="Profile" />
          </div>

          {/* TEXT */}
          <div className="about-content">
            <h3>
              Christian <span>Silva</span>
            </h3>

            <div className="about-tags">
              <span>Brazil</span>
              <span>Software</span>
              <span>Firmware</span>
              <span>Embedded</span>
            </div>

            <p>
              Software & Firmware Engineer focused on embedded systems, STM32,
              CAN networks and hardware-oriented development. I enjoy bridging
              low-level firmware with high-level software and UI.
            </p>

            {/* EDUCATION */}
            <div className="about-education">
              <h4>Education</h4>

              <ul className="education-list">
                <li>
                  <span className="dot"></span>
                  <div>
                    <strong>Computer Science</strong>
                    <p>Universidade UCS</p>
                    <small>2024 — Present</small>
                  </div>
                </li>

                <li>
                  <span className="dot"></span>
                  <div>
                    <strong>Embedded Systems & Firmware</strong>
                    <p>STM32 · C · CAN · HID</p>
                    <small>2023 — 2024</small>
                  </div>
                </li>

                <li>
                  <span className="dot"></span>
                  <div>
                    <strong>High School</strong>
                    <p>Technical Focus</p>
                    <small>2022 — 2023</small>
                  </div>
                </li>
              </ul>
            </div>

            <a className="about-cv" href="/cv.pdf" target="_blank">
              View my CV
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
