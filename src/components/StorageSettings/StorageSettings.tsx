import { lazy, Suspense } from "react";
import { useStoragePreferences } from "../../context/StoragePreferencesContext";

const StorageSettingsDialog = lazy(() => import("./StorageSettingsDialog"));

/** Nothing is loaded or shown until the visitor explicitly opens the controls. */
export default function StorageSettings() {
  const { isStoragePanelOpen } = useStoragePreferences();
  return isStoragePanelOpen ? <Suspense fallback={null}><StorageSettingsDialog /></Suspense> : null;
}
