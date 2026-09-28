import { useEffect } from "react";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { useLanguage } from "../../context/LanguageContext";
import Notes from "./Notes";

export default function NotesIndex() {
  const { t } = useLanguage();
  useEffect(() => {
    document.title = `${t.notes.title} — Christian Silva`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", t.notes.tagline);
  }, [t]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  return (
    <>
      <Cursor />
      <NavBar />
      <main id="main-content" tabIndex={-1} className="notes-index">
        <Notes standalone />
      </main>
    </>
  );
}
