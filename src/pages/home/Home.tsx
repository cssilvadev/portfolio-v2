import Robot from "../../components/Robot/Robot";
import { useLanguage } from "../../context/LanguageContext";
import "./Home.css";

export default function Home() {
  const { t } = useLanguage();

  return (
    <section className="home">
      <div className="hero">

        <div className="hero-left">
          <p className="eyebrow">{t.home.eyebrow}</p>
          <h1>{t.home.name}</h1>
          <p className="subtitle">
            {t.home.subtitle}
          </p>
        </div>

        <div className="hero-right">
          <Robot />
        </div>

      </div>
    </section>
  );
}
