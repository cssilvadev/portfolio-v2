import { Link } from "react-router-dom";
import { useEffect } from "react";
import Cursor from "../../components/Cursor/Cursor";
import NavBar from "../../components/NavBar/NavBar";
import { useLanguage } from "../../context/LanguageContext";
import "./NotFound.css";

export default function NotFound() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = `404 — ${t.notFoundPage.title}`;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", t.notFoundPage.desc);
  }, [t]);

  return (
    <>
      <Cursor />
      <NavBar />

      <main className="not-found-page">
        <div className="not-found-inner">
          <span className="not-found-code">404</span>
          <h1>{t.notFoundPage.title}</h1>
          <p>{t.notFoundPage.desc}</p>
          <Link to="/" className="not-found-back">
            {t.notFoundPage.backBtn}
          </Link>
        </div>
      </main>
    </>
  );
}
