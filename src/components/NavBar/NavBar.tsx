import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaCrown, FaMoon, FaSignOutAlt, FaSun, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { FlagIcon, FlagBR, FlagUS, FlagES } from "../Flags/Flags";
import type { Language } from "../../i18n/translations";
import "./NavBar.css";

type Theme = "dark" | "light";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, openAuthModal, openSubscriptionModal, signOut, subscriptionTier } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowLangMenu(false);
      setShowUserMenu(false);
      if (isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setShowLangMenu(false);
    setShowUserMenu(false);
  };

  const languages: { code: Language; label: string; full: string; flag: ReactNode }[] = [
    { code: "pt", label: "PT-BR", full: "Português", flag: <FlagBR /> },
    { code: "en", label: "EN", full: "English", flag: <FlagUS /> },
    { code: "es", label: "ES", full: "Español", flag: <FlagES /> },
  ];

  const currentLangDisplay = language === "pt" ? "PT-BR" : language.toUpperCase();

  return (
    <nav ref={navRef} className={`navbar ${isMenuOpen ? "menu-open" : ""}`}>
      <Link to="/" className="logo" onClick={closeMenu}>CS</Link>

      <button
        ref={menuButtonRef}
        type="button"
        className="menu-toggle"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
      </button>

      <div id="primary-navigation" className="nav-drawer">
        <ul className="nav-links">
          {[
            ["/", t.nav.home],
            ["/#projects", t.nav.projects],
            ["/#notes", t.nav.notes],
            ["/#about", t.nav.about],
            ["/#contact", t.nav.contact],
          ].map(([to, label]) => (
            <li key={to}>
              <Link to={to} onClick={closeMenu}>{label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-controls">
          <div className="lang-switcher">
            <button
              type="button"
              onClick={() => setShowLangMenu((open) => !open)}
              className="lang-current-btn"
              title="Change language"
              aria-label="Change language"
              aria-haspopup="true"
              aria-expanded={showLangMenu}
            >
              <FlagIcon lang={language} />
              <span>{currentLangDisplay}</span>
            </button>

            {showLangMenu && (
              <div className="lang-dropdown" role="menu">
                {languages.map((item) => (
                  <button
                    type="button"
                    role="menuitem"
                    key={item.code}
                    onClick={() => {
                      setLanguage(item.code);
                      closeMenu();
                    }}
                    className={`lang-option ${language === item.code ? "active" : ""}`}
                  >
                    <span className="lang-option-left">
                      {item.flag}
                      <span>{item.label}</span>
                    </span>
                    <small>{item.full}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="theme-toggle-btn"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
          </button>

          <div className="user-menu">
            <button
              type="button"
              className="user-menu-btn"
              onClick={() => user ? setShowUserMenu((open) => !open) : openAuthModal("login")}
              aria-label={user ? t.auth.account : t.auth.signIn}
              aria-haspopup={user ? "true" : undefined}
              aria-expanded={user ? showUserMenu : undefined}
            >
              {user ? <FaUser aria-hidden="true" /> : <FaUser aria-hidden="true" />}
              <span className="user-menu-label">{user ? (profile?.full_name || user.email?.split("@")[0] || t.auth.account) : t.auth.signIn}</span>
            </button>

            {user && showUserMenu && (
              <div className="user-dropdown" role="menu">
                <span className="user-email">{user.email}</span>
                <span className="user-tier">{subscriptionTier === "free" ? t.billing.free : t.billing.pro}</span>
                {profile?.role === "admin" && (
                  <Link to="/admin" role="menuitem" onClick={closeMenu}>
                    <FaCrown aria-hidden="true" /> {t.auth.admin}
                  </Link>
                )}
                {subscriptionTier === "free" && (
                  <button type="button" role="menuitem" onClick={() => { closeMenu(); openSubscriptionModal(); }}>
                    <FaCrown aria-hidden="true" /> {t.billing.upgrade}
                  </button>
                )}
                <button type="button" role="menuitem" onClick={() => { closeMenu(); void signOut(); }}>
                  <FaSignOutAlt aria-hidden="true" /> {t.auth.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
