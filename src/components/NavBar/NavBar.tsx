import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { FlagIcon, FlagBR, FlagUS, FlagES } from "../Flags/Flags";
import type { Language } from "../../i18n/translations";
import "./NavBar.css";

type Theme = "dark" | "light";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const languages: { code: Language; label: string; full: string; flag: React.ReactNode }[] = [
    { code: "pt", label: "PT-BR", full: "Português", flag: <FlagBR /> },
    { code: "en", label: "EN", full: "English", flag: <FlagUS /> },
    { code: "es", label: "ES", full: "Español", flag: <FlagES /> },
  ];

  const currentLangDisplay = language === "pt" ? "PT-BR" : language.toUpperCase();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        CS
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/">{t.nav.home}</Link>
        </li>
        <li>
          <Link to="/#projects">{t.nav.projects}</Link>
        </li>
        <li>
          <Link to="/#notes">{t.nav.notes}</Link>
        </li>
        <li>
          <Link to="/#about">{t.nav.about}</Link>
        </li>
        <li>
          <Link to="/#contact">{t.nav.contact}</Link>
        </li>
      </ul>

      {/* RIGHT CONTROLS: LANGUAGE & THEME */}
      <div className="nav-controls">
        {/* Language Selector */}
        <div className="lang-switcher">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="lang-current-btn"
            title="Change language"
          >
            <FlagIcon lang={language} />
            <span>{currentLangDisplay}</span>
          </button>

          {showLangMenu && (
            <div className="lang-dropdown">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                  className={`lang-option ${language === l.code ? "active" : ""}`}
                >
                  <div className="lang-option-left">
                    {l.flag}
                    <span>{l.label}</span>
                  </div>
                  <small>{l.full}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="theme-toggle-btn"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FaMoon /> : <FaSun />}
        </button>
      </div>
    </nav>
  );
}
