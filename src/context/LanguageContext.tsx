import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Language, type Translations } from "../i18n/translations";
import { useStoragePreferences } from "./StoragePreferencesContext";
import { browserPreferenceStorage, readStoragePreferences } from "../utils/storagePreferences";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) {
  const { saveLanguage } = useStoragePreferences();
  const [language, setLanguageState] = useState<Language>(() => {
    if (initialLanguage) return initialLanguage;
    if (typeof window === "undefined") return "en";
    const saved = readStoragePreferences(browserPreferenceStorage()).language;
    if (saved === "en" || saved === "pt" || saved === "es") {
      return saved;
    }
    // Auto-detect browser language
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    if (browserLang === "pt") return "pt";
    if (browserLang === "es") return "es";
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
    document.documentElement.setAttribute("lang", lang);
  };

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  useEffect(() => {
    function syncLanguage(event: StorageEvent) {
      if (event.storageArea !== browserPreferenceStorage() || ![null, "portfolio_lang", "portfolio_storage_choices"].includes(event.key)) return;
      const saved = readStoragePreferences(browserPreferenceStorage()).language;
      if (saved) setLanguageState(saved);
    }
    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
  }, []);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// The hook intentionally lives beside its provider so consumers share the
// same context contract; this is safe and does not affect Fast Refresh state.
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
