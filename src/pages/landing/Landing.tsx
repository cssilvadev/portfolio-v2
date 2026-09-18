import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";

import Home from "../home";
import Projects from "../projects";
import Notes from "../notes";
import About from "../about";
import Contact from "../contact";

export default function Landing() {
  const { hash } = useLocation();

  useEffect(() => {
    document.title = "Christian Silva — Full Stack & Firmware Engineer";
    if (!hash) return;
    const el = document.querySelector(hash);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }, [hash]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Cursor />
      <NavBar />

      <main id="main-content">
        <Home />
        <Projects />
        <Notes />
        <About />
        <Contact />
      </main>
    </>
  );
}
