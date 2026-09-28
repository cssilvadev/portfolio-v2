import { useEffect } from "react";
import { Link } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Cursor from "../../components/Cursor/Cursor";
import PedalLab from "../../components/PedalLab/PedalLab";
import { useLanguage } from "../../context/LanguageContext";
import { editorial, text } from "../../data/editorial";
import "../../components/ProjectStory/ProjectStory.css";
import "../profile/Profile.css";

export default function Lab() {
  const { language } = useLanguage();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  return <><Cursor /><NavBar /><main id="main-content" tabIndex={-1} className="editorial-page">
    <header className="editorial-page-header"><p className="story-eyebrow">LAB / 001</p>
      <h1>{text("Small input. Different response.", "Um pequeno ajuste. Outra resposta.", "Un pequeño ajuste. Otra respuesta.")[language]}</h1>
      <p>{text("Explore pedal calibration without installing anything. A small, keyboard-accessible experiment about the boundary between hardware and software.", "Explore a calibração de pedais sem instalar nada. Um experimento leve e acessível por teclado sobre a fronteira entre hardware e software.", "Explora la calibración de pedales sin instalar nada. Un experimento ligero, accesible con teclado, sobre hardware y software.")[language]}</p>
    </header>
    <PedalLab />
    <nav className="case-related-links" aria-label={editorial.related[language]}><Link to="/projects/g27-pedal-adapter">G27 · USB HID ↗</Link><Link to="/notes/pedal-response-bench-note">{editorial["bench-note"][language]} · ADC → HID ↗</Link></nav>
  </main></>;
}
