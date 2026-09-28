import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { browserPreferenceStorage, persistPreference, readStoragePreferences, writeStorageChoices, type StorageChoices, type Theme } from "../utils/storagePreferences";
import { storageKeys } from "../utils/storagePreferences";

type StoragePreferencesValue = {
  choices: StorageChoices;
  theme: Theme;
  storageAvailable: boolean;
  setTheme: (theme: Theme) => void;
  updateChoices: (choices: StorageChoices, language: string) => boolean;
  saveLanguage: (language: string) => void;
  isStoragePanelOpen: boolean;
  openStorageSettings: () => void;
  closeStorageSettings: () => void;
};
const StoragePreferencesContext = createContext<StoragePreferencesValue | undefined>(undefined);

export function StoragePreferencesProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => readStoragePreferences(browserPreferenceStorage()));
  const [choices, setChoices] = useState(initial.choices);
  const [theme, setThemeState] = useState<Theme>(initial.theme);
  const [storageAvailable, setStorageAvailable] = useState(initial.available);
  const [isStoragePanelOpen, setStoragePanelOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme === "light" ? "only light" : "dark");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f7f7f7" : "#000000");
    // No automatic persistence on mounting, route changes or StrictMode effects.
  }, [theme]);

  useEffect(() => {
    function syncChoices(event: StorageEvent) {
      if (event.storageArea !== browserPreferenceStorage() || (event.key !== null && !Object.values(storageKeys).some(key => key === event.key))) return;
      const snapshot = readStoragePreferences(browserPreferenceStorage());
      setChoices(snapshot.choices);
      setStorageAvailable(snapshot.available);
      // Revoking remembering must not unexpectedly change this tab's appearance.
      if (snapshot.choices.rememberTheme && snapshot.storedTheme) setThemeState(snapshot.storedTheme);
    }
    window.addEventListener("storage", syncChoices);
    return () => window.removeEventListener("storage", syncChoices);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    setStorageAvailable(persistPreference(browserPreferenceStorage(), "theme", next, choices.rememberTheme));
  }
  function saveLanguage(language: string) {
    setStorageAvailable(persistPreference(browserPreferenceStorage(), "language", language, choices.rememberLanguage));
  }
  function updateChoices(next: StorageChoices, language: string) {
    setChoices(next);
    const saved = writeStorageChoices(browserPreferenceStorage(), next, theme, language);
    setStorageAvailable(saved);
    return saved;
  }
  return <StoragePreferencesContext.Provider value={{ choices, theme, storageAvailable, setTheme, saveLanguage, updateChoices, isStoragePanelOpen, openStorageSettings: () => setStoragePanelOpen(true), closeStorageSettings: () => setStoragePanelOpen(false) }}>{children}</StoragePreferencesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStoragePreferences() {
  const value = useContext(StoragePreferencesContext);
  if (!value) throw new Error("Storage preferences require their provider.");
  return value;
}
