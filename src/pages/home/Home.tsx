import Robot from "../../components/Robot/Robot";
import "./Home.css";

export default function Home() {
  return (
    <section className="home">
      <div className="hero">

        <div className="hero-left">
          <p className="eyebrow">Full Stack Developer & Firmware Engineer</p>
          <h1>Christian Silva</h1>
          <p className="subtitle">
            Building software, firmware and interactive systems.
          </p>
        </div>

        <div className="hero-right">
          <Robot />
        </div>

      </div>
    </section>
  );
}
