import "./Home.css";
import TechSlider from "../../components/TechSlider/TechSlider";

export default function Home() {
  return (
    <section className="home">
      <div className="hero">
        <div className="hero-left">
          <p className="eyebrow">Software & Firmware Engineer</p>

          <h1>Christian Silva</h1>

          <p className="subtitle">
            Building software, firmware and interactive experiences.
          </p>

          {/* Tech Stack Section */}
          <div className="tech-stack">
            <div className="tech-stack-header">
              <h2>MY TECH STACK</h2>
              <span className="line" />
            </div>

            <p className="tech-stack-subtitle">
              The tools and technologies I use to bring ideas to life.
            </p>

            <TechSlider />
          </div>
        </div>

        <div className="hero-right"></div>
      </div>
    </section>
  );
}
