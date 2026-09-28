import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import type { Language } from "../../i18n/translations";
import { editorial, projectStories } from "../../data/editorial";
import { getAssetUrl } from "../../utils/assets";
import "./ProjectStory.css";

const PedalLab = lazy(() => import("../PedalLab/PedalLab"));

export default function ProjectStory({ slug, language }: { slug: string; language: Language }) {
  const story = projectStories[slug];
  const [experimentOpen, setExperimentOpen] = useState(false);
  if (!story) return null;
  return <div className="case-study">
    <section className="case-chapter" data-scroll-enter>
      <p className="story-eyebrow">01 / {editorial.problem[language]}</p>
      <h2>{story.problem[language]}</h2>
    </section>
    <section className="case-chapter" data-scroll-enter>
      <p className="story-eyebrow">02 / {editorial.architecture[language]}</p>
      <ol className="case-flow">{story.flow.map((node, index) => <li key={node}>
        <span className="case-step">{String(index + 1).padStart(2, "0")}</span><strong>{node}</strong>
        {index < story.flow.length - 1 && <span className="case-flow-arrow" aria-hidden="true">→</span>}
      </li>)}</ol>
      {slug === "jarvis" && <p className="case-caption">{language === "pt" ? "Fluxo simplificado de voz. A visão é um serviço independente; o núcleo C# define as permissões." : language === "es" ? "Flujo de voz simplificado. La visión es independiente; el núcleo C# define los permisos." : "Simplified voice flow. Vision is independent; the C# core defines permissions."}</p>}
    </section>
    {story.chapters && <section className="case-chapter" data-scroll-enter>
      <p className="story-eyebrow">03 / {editorial.decisions[language]}</p>
      <div className="case-decisions">{story.chapters.map((chapter, index) => <article key={chapter.title.en}>
        <span className="case-step">{String(index + 1).padStart(2, "0")}</span>
        <h3>{chapter.title[language]}</h3><p>{chapter.body[language]}</p>
      </article>)}</div>
    </section>}
    {story.gallery && <section className="case-chapter case-gallery">
      <p className="story-eyebrow">{editorial.evidence[language]}</p>
      {story.gallery.map((item) => <figure key={item.image} data-scroll-enter>
        <a href={getAssetUrl(item.image)} target="_blank" rel="noopener noreferrer" aria-label={item.caption[language]}>
          <img src={getAssetUrl(item.image)} alt={item.caption[language]} loading="lazy" decoding="async" width={item.width} height={item.height} />
        </a><figcaption>{item.caption[language]}</figcaption>
      </figure>)}
    </section>}
    {slug === "g27-pedal-adapter" && <section className="case-chapter case-experiment">
      <p className="story-eyebrow">{editorial.lab[language]}</p>
      <h2>{language === "pt" ? "Sinta a curva antes de ligar o hardware." : language === "es" ? "Prueba la curva antes de conectar el hardware." : "Feel the curve before connecting hardware."}</h2>
      <p className="case-caption">{editorial.simulation[language]}</p>
      <button className="editorial-button" type="button" aria-expanded={experimentOpen} onClick={() => setExperimentOpen(!experimentOpen)}>
        {experimentOpen ? (language === "pt" ? "Fechar experimento" : language === "es" ? "Cerrar experimento" : "Close experiment") : editorial.start[language]} <span aria-hidden="true">↗</span>
      </button>
      {experimentOpen && <Suspense fallback={<p role="status">…</p>}><PedalLab /></Suspense>}
      <Link className="editorial-inline-link" to="/lab">{editorial.lab[language]} ↗</Link>
    </section>}
    <section className="case-chapter case-limits" data-scroll-enter>
      <p className="story-eyebrow">{editorial.limits[language]}</p>
      <p>{(story.limits ?? editorial.validation)[language]}</p>
    </section>
  </div>;
}
