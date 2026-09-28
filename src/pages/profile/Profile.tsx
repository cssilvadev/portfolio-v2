import { useEffect } from "react";
import { Link } from "react-router-dom";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { useLanguage } from "../../context/LanguageContext";
import { editorial, text } from "../../data/editorial";
import { getAssetUrl } from "../../utils/assets";
import "../../components/ProjectStory/ProjectStory.css";
import "./Profile.css";

export default function Profile() {
  const { language, t } = useLanguage();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  return <><Cursor /><NavBar /><main id="main-content" tabIndex={-1} className="editorial-page profile-page">
    <header className="editorial-page-header"><p className="story-eyebrow">CHRISTIAN SILVA / {editorial.profile[language]}</p>
      <h1>{editorial.positioning[language]}</h1>
      <p>{t.about.bio}</p>
      <button type="button" className="editorial-button profile-print" onClick={() => window.print()}>{editorial.print[language]} ↗</button>
    </header>
    <section className="profile-details">
      <img className="profile-photo" src={getAssetUrl("/images/me.jpg")} alt="Christian Silva" width="736" height="1408" />
      <div><h2>{text("One system. Multiple layers.", "Um sistema. Várias camadas.", "Un sistema. Varias capas.")[language]}</h2>
        <p>{text("My work connects firmware, desktop tools and web interfaces. This portfolio separates what is documented from what still needs validation, and records decisions alongside the final interface.", "Meu trabalho conecta firmware, ferramentas de desktop e interfaces web. Este portfólio separa o que está documentado do que ainda precisa de validação e registra as decisões junto da interface final.", "Mi trabajo conecta firmware, herramientas de escritorio e interfaces web. Este portafolio distingue lo documentado de lo que requiere validación y registra decisiones junto a la interfaz final.")[language]}</p>
        <h3>{t.about.education}</h3><p><strong>{t.about.csTitle}</strong><br />{t.about.csUniv}<br />{t.about.csDate}</p>
        <h3>{text("Technical focus", "Foco técnico", "Enfoque técnico")[language]}</h3>
        <p>STM32 · ESP32 · C · CAN · USB HID<br />C# · .NET · Python<br />React · TypeScript · interfaces</p>
        <nav className="profile-socials" aria-label={t.nav.contact}>
          <a href="https://github.com/cssilvadev" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href="https://www.linkedin.com/in/christian-silva-a70418236/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <Link to="/#contact">{t.nav.contact} ↗</Link>
        </nav>
      </div>
    </section>
    <section className="case-related"><p className="story-eyebrow">{editorial.related[language]}</p>
      <nav className="case-related-links"><Link to="/projects/jarvis">Jarvis · local-first AI ↗</Link><Link to="/projects">{t.nav.projects} ↗</Link><Link to="/lab">{editorial.lab[language]} ↗</Link></nav>
    </section>
  </main></>;
}
