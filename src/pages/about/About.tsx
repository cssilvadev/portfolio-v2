import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import "./About.css";

export default function About() {
  const { t } = useLanguage();

  return (
    <section id="about" className="section">

      {/* SECTION TITLE */}
      <div className="section-title">
        <h2>{t.about.title}</h2>
        <div className="section-title-line"></div>
      </div>

      {/* CONTENT */}
      <div className="section-inner about">

        <div className="about-grid">

          {/* PHOTO */}
          <div className="about-photo">
            <img src={getAssetUrl("/images/me.jpg")} alt="Christian Silva" />
          </div>

          {/* TEXT */}
          <div className="about-content">
            <h3>
              Christian <span>Silva</span>
            </h3>

            <div className="about-tags">
              <span>{t.about.tags.brazil}</span>
              <span>{t.about.tags.software}</span>
              <span>{t.about.tags.firmware}</span>
              <span>{t.about.tags.embedded}</span>
            </div>

            <p>
              {t.about.bio}
            </p>

            {/* EDUCATION */}
            <div className="about-education">
              <h4>{t.about.education}</h4>

              <ul className="education-list">
                <li>
                  <span className="dot"></span>
                  <div>
                    <strong>{t.about.csTitle}</strong>
                    <p>{t.about.csUniv}</p>
                    <small>{t.about.csDate}</small>
                  </div>
                </li>

                <li>
                  <span className="dot"></span>
                  <div>
                    <strong>{t.about.embedTitle}</strong>
                    <p>{t.about.embedDesc}</p>
                    <small>{t.about.embedDate}</small>
                  </div>
                </li>
              </ul>
            </div>

            <a className="about-cv" href={getAssetUrl("/cv.pdf")} target="_blank" rel="noopener noreferrer">
              {t.about.cvBtn}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
