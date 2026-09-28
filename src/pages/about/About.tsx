import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import "./About.css";
import { useRef } from "react";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";
import { Link } from "react-router-dom";
import { editorial } from "../../data/editorial";

const cvAssets = import.meta.glob("/public/cv.pdf", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;
const cvUrl = cvAssets["/public/cv.pdf"];

export default function About() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollEntrance(sectionRef);

  return (
    <section id="about" ref={sectionRef} className="section about-story">
      <div className="section-inner about">

        <div className="about-grid">

          <div className="about-portrait" data-scroll-enter>
            <div className="about-photo">
              <img src={getAssetUrl("/images/me.jpg")} alt="Christian Silva" loading="lazy" decoding="async" />
            </div>
          </div>

          <div className="about-content" data-scroll-enter>
            <p className="story-eyebrow">03 / {t.about.title}</p>
            <h2>
              Christian <span>Silva</span>
            </h2>

            <div className="about-tags">
              <span>{t.about.tags.brazil}</span>
              <span>{t.about.tags.software}</span>
              <span>{t.about.tags.firmware}</span>
              <span>{t.about.tags.embedded}</span>
            </div>

            <p>
              {t.about.bio}
            </p>

            <div className="about-education">
              <h3>{t.about.education}</h3>

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

            <Link className="about-cv" to="/profile">{editorial.profile[language]} ↗</Link>
            {cvUrl && (
              <a className="about-cv" href={cvUrl} target="_blank" rel="noopener noreferrer">
                {t.about.cvBtn}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
