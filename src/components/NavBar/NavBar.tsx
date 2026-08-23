import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun, FaUser, FaSignOutAlt, FaCrown } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { FlagIcon, FlagBR, FlagUS, FlagES } from "../Flags/Flags";
import type { Language } from "../../i18n/translations";
import "./NavBar.css";

type Theme = "dark" | "light";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, subscriptionTier, openAuthModal, openSubscriptionModal, signOut } = useAuth();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  const userDisplayName = profile?.full_name || user?.email?.split("@")[0] || "User";

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

      {/* RIGHT CONTROLS: AUTH, LANGUAGE & THEME */}
      <div className="nav-controls">
        {/* USER AUTH STATUS */}
        {user ? (
          <div className="user-menu-wrapper">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="user-btn"
              title="Account Settings"
            >
              <div className="user-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={userDisplayName} />
                ) : (
                  <FaUser />
                )}
              </div>
              <span className="user-name-abbr">{userDisplayName}</span>
              <span className={`tier-pill ${subscriptionTier}`}>
                {subscriptionTier === "pro" ? <FaCrown className="tier-icon" /> : null}
                {subscriptionTier.toUpperCase()}
              </span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <strong>{userDisplayName}</strong>
                  <small>{user.email}</small>
                  <div className="user-tier-info">
                    <span>Plan: </span>
                    <strong className={`tier-badge ${subscriptionTier}`}>
                      {subscriptionTier === "pro" ? "PRO SUBSCRIBER" : "FREE MEMBER"}
                    </strong>
                  </div>
                </div>
                <div className="user-dropdown-divider"></div>
                {subscriptionTier === "free" && (
                  <button
                    onClick={() => {
                      openSubscriptionModal();
                      setShowUserMenu(false);
                    }}
                    className="user-upgrade-btn"
                  >
                    <FaCrown className="upgrade-icon" />
                    <span>Upgrade to PRO</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setShowUserMenu(false);
                  }}
                  className="user-logout-btn"
                >
                  <FaSignOutAlt />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="nav-auth-btn"
          >
            <FaUser className="auth-btn-icon" />
            <span>Sign In</span>
          </button>
        )}

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
