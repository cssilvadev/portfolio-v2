import "./Home.css";

export default function Home() {
  return (
    <section id="home" className="home">
      <div className="hero">
        <div className="hero-left">
          <p className="eyebrow">Software & Firmware Engineer</p>
          <h1>Christian Silva</h1>
          <p className="subtitle">
            Building software, firmware and interactive experiences.
          </p>
        </div>

        <div className="hero-right">
          <div className="placeholder-right"></div>
        </div>
      </div>
    </section>
  );
}
