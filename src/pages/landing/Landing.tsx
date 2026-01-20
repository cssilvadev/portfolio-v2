import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";

import Home from "../home";
import Projects from "../projects";
import About from "../about";
import Contact from "../contact";

export default function Landing() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <Cursor />
      <NavBar />

      <main>
        <Home />
        <Projects />
        <About />
        <Contact />
      </main>
    </>
  );
}
