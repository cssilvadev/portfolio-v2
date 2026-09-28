export type Theme = "dark" | "light";
export type StorageChoices = { version: 1; rememberTheme: boolean; rememberLanguage: boolean };
export type PreferenceStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export const storageKeys = { choices: "portfolio_storage_choices", theme: "theme", language: "portfolio_lang" } as const;

export function parseStorageChoices(value: string | null): StorageChoices | undefined {
  try {
    const parsed = JSON.parse(value ?? "null");
    if (parsed?.version === 1 && typeof parsed.rememberTheme === "boolean" && typeof parsed.rememberLanguage === "boolean") {
      return { version: 1, rememberTheme: parsed.rememberTheme, rememberLanguage: parsed.rememberLanguage };
    }
  } catch { /* Invalid local data must never prevent navigation. */ }
  return undefined;
}

export function readStoragePreferences(storage?: PreferenceStorage): { choices: StorageChoices; theme: Theme; storedTheme: Theme | undefined; language: "en" | "pt" | "es" | undefined; available: boolean } {
  const empty = { choices: { version: 1, rememberTheme: false, rememberLanguage: false } as StorageChoices, theme: "dark" as Theme, storedTheme: undefined as Theme | undefined, language: undefined as "en" | "pt" | "es" | undefined, available: false };
  if (!storage) return empty;
  try {
    const savedTheme = storage.getItem(storageKeys.theme);
    const savedLanguage = storage.getItem(storageKeys.language);
    const validTheme = savedTheme === "light" || savedTheme === "dark";
    const validLanguage = savedLanguage === "en" || savedLanguage === "pt" || savedLanguage === "es";
    // Preserve valid existing preferences. New visitors do not save automatically.
    const choices = parseStorageChoices(storage.getItem(storageKeys.choices)) ?? {
      version: 1, rememberTheme: validTheme, rememberLanguage: validLanguage,
    };
    return { choices, theme: choices.rememberTheme && savedTheme === "light" ? "light" as const : "dark" as const, storedTheme: validTheme ? savedTheme : undefined, language: choices.rememberLanguage && validLanguage ? savedLanguage : undefined, available: true };
  } catch { return empty; }
}

export function writeStorageChoices(storage: PreferenceStorage | undefined, choices: StorageChoices, theme: Theme, language: string): boolean {
  if (!storage) return false;
  try {
    // Exact keys only. Never clear storage, Supabase tokens or other applications.
    if (choices.rememberTheme) storage.setItem(storageKeys.theme, theme);
    else storage.removeItem(storageKeys.theme);
    if (choices.rememberLanguage) storage.setItem(storageKeys.language, language);
    else storage.removeItem(storageKeys.language);
    storage.setItem(storageKeys.choices, JSON.stringify(choices));
    return true;
  } catch { return false; }
}

export function persistPreference(storage: PreferenceStorage | undefined, key: "theme" | "language", value: string, enabled: boolean): boolean {
  if (!storage) return false;
  try {
    if (enabled) storage.setItem(storageKeys[key], value);
    else storage.removeItem(storageKeys[key]);
    return true;
  } catch { return false; }
}

export function browserPreferenceStorage(): PreferenceStorage | undefined {
  try { return typeof window === "undefined" ? undefined : window.localStorage; }
  catch { return undefined; }
}
