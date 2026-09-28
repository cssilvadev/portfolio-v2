import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaCrown, FaMoon, FaSignOutAlt, FaSun, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { FlagIcon, FlagBR, FlagUS, FlagES } from "../Flags/Flags";
import type { Language } from "../../i18n/translations";
import "./NavBar.css";

type Theme = "dark" | "light";

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, openAuthModal, openSubscriptionModal, signOut, subscriptionTier } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() => window.scrollY > 24);
  const [activeSection, setActiveSection] = useState(() => hash.slice(1) || "home");
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    return saved ?? "dark";
  });
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let previousState = window.scrollY > 24;
    const updateScrollState = () => {
      const nextState = window.scrollY > 24;
      if (nextState !== previousState) {
        previousState = nextState;
        setIsScrolled(nextState);
      }
    };
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = ["home", "projects", "notes", "about", "contact"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    const updateActive = () => {
      const checkpoint = window.innerHeight * 0.42;
      const reachedSections = sections.filter((section) => section.getBoundingClientRect().top <= checkpoint);
      const current = reachedSections[reachedSections.length - 1];
      setActiveSection(current?.id ?? "home");
    };
    if (typeof IntersectionObserver === "undefined") {
      window.addEventListener("scroll", updateActive, { passive: true });
      updateActive();
      return () => window.removeEventListener("scroll", updateActive);
    }
    const observer = new IntersectionObserver(updateActive, { rootMargin: "-42% 0px -57% 0px" });
    sections.forEach((section) => observer.observe(section));
    updateActive();
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f7f7f7" : "#000000");
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
        setIsMenuOpen(false);
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

  const handleNavigation = (to: string) => {
    closeMenu();
    if (pathname !== "/") return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    // Re-selecting the current route/hash should still navigate to its section.
    if (to === "/" && !hash) window.scrollTo({ top: 0, behavior });
    if (to.startsWith("/#") && hash === to.slice(1)) {
      document.getElementById(to.slice(2))?.scrollIntoView({ behavior });
    }
  };

  const languages: { code: Language; label: string; full: string; flag: ReactNode }[] = [
    { code: "pt", label: "PT-BR", full: "Português", flag: <FlagBR /> },
    { code: "en", label: "EN", full: "English", flag: <FlagUS /> },
    { code: "es", label: "ES", full: "Español", flag: <FlagES /> },
  ];

  const currentLangDisplay = language === "pt" ? "PT-BR" : language.toUpperCase();
  const navItems = [
    { to: "/", label: t.nav.home, active: pathname === "/" && activeSection === "home" },
    { to: "/projects", label: t.nav.projects, active: pathname.startsWith("/projects") || (pathname === "/" && activeSection === "projects") },
    { to: "/notes", label: t.nav.notes, active: pathname.startsWith("/notes") || (pathname === "/" && activeSection === "notes") },
    { to: "/#about", label: t.nav.about, active: pathname === "/" && activeSection === "about" },
    { to: "/#contact", label: t.nav.contact, active: pathname === "/" && activeSection === "contact" },
  ];

  return (
    <>
    <a className="skip-link" href="#main-content">{t.nav.skipContent}</a>
    <nav ref={navRef} className={`navbar ${isMenuOpen ? "menu-open" : ""} ${isScrolled ? "is-scrolled" : ""}`}>
      <Link to="/" className="logo" onClick={() => handleNavigation("/")}>CS</Link>

      <button
        ref={menuButtonRef}
        type="button"
        className="menu-toggle"
        aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
      </button>

      <div id="primary-navigation" className="nav-drawer">
        <ul className="nav-links">
          {navItems.map(({ to, label, active }) => (
            <li key={to}>
              <Link to={to} onClick={() => handleNavigation(to)} aria-current={active ? "page" : undefined}>{label}</Link>
            </li>
          ))}
        </ul>

        <div className="nav-controls">
          <div className="lang-switcher">
            <button
              type="button"
              onClick={() => { setShowUserMenu(false); setShowLangMenu((open) => !open); }}
              className="lang-current-btn"
              title={t.nav.changeLanguage}
              aria-label={t.nav.changeLanguage}
              aria-expanded={showLangMenu}
            >
              <FlagIcon lang={language} />
              <span>{currentLangDisplay}</span>
            </button>

            {showLangMenu && (
              <div className="lang-dropdown">
                {languages.map((item) => (
                  <button
                    type="button"
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
            aria-label={theme === "dark" ? t.nav.lightTheme : t.nav.darkTheme}
          >
            {theme === "dark" ? <FaMoon aria-hidden="true" /> : <FaSun aria-hidden="true" />}
          </button>

          <div className="user-menu">
            <button
              type="button"
              className="user-menu-btn"
              onClick={() => { setShowLangMenu(false); if (user) setShowUserMenu((open) => !open); else openAuthModal("login"); }}
              aria-label={user ? t.auth.account : t.auth.signIn}
              aria-expanded={user ? showUserMenu : undefined}
            >
              <FaUser aria-hidden="true" />
              <span className="user-menu-label">{user ? (profile?.full_name || user.email?.split("@")[0] || t.auth.account) : t.auth.signIn}</span>
            </button>

            {user && showUserMenu && (
              <div className="user-dropdown">
                <span className="user-email">{user.email}</span>
                <span className="user-tier">{subscriptionTier === "free" ? t.billing.free : t.billing.pro}</span>
                {profile?.role === "admin" && (
                  <Link to="/admin" onClick={closeMenu}>
                    <FaCrown aria-hidden="true" /> {t.auth.admin}
                  </Link>
                )}
                {subscriptionTier === "free" && (
                  <button type="button" onClick={() => { closeMenu(); openSubscriptionModal(); }}>
                    <FaCrown aria-hidden="true" /> {t.billing.upgrade}
                  </button>
                )}
                <button type="button" onClick={() => { closeMenu(); void signOut(); }}>
                  <FaSignOutAlt aria-hidden="true" /> {t.auth.signOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
