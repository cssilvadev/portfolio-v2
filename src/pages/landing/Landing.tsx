import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";

import Home from "../home";
import Projects from "../projects";
import Notes from "../notes";
import About from "../about";
import Contact from "../contact";
import "./Landing.css";
import { useLanguage } from "../../context/LanguageContext";

export default function Landing() {
  const { hash } = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    document.title = "Christian Silva — Full Stack & Firmware Engineer";
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", t.home.subtitle);
  }, [t]);

  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, behavior: "instant" }); return; }
    let id: string;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const el = document.getElementById(id);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [hash]);

  return (
    <>
      <Cursor />
      <NavBar />

      <main id="main-content" tabIndex={-1}>
        <Home />
        <Projects />
        <Notes />
        <About />
        <Contact />
      </main>
    </>
  );
}
