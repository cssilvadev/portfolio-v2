import { useRef, useState } from "react";
import { useStoragePreferences } from "../../context/StoragePreferencesContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import { text } from "../../data/editorial";
import { getAssetUrl } from "../../utils/assets";
import "./StorageSettings.css";

export default function StorageSettingsDialog() {
  const { choices, updateChoices, storageAvailable, closeStorageSettings } = useStoragePreferences();
  const { language } = useLanguage();
  const { user, loading, signOutThisBrowser } = useAuth();
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestLock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"saved" | "cleared" | "signedOut" | "error" | null>(null);
  useDialogAccessibility(true, dialogRef, closeStorageSettings);
  const label = (en: string, pt: string, es: string) => text(en, pt, es)[language];

  function changePreference(key: "rememberTheme" | "rememberLanguage", checked: boolean) {
    const saved = updateChoices({ ...choices, [key]: checked }, language);
    setStatus(saved ? "saved" : null);
  }
  function clearPreferences() {
    const cleared = updateChoices({ version: 1, rememberTheme: false, rememberLanguage: false }, language);
    setStatus(cleared ? "cleared" : null);
  }
  async function endSession() {
    if (requestLock.current || !user) return;
    requestLock.current = true; setBusy(true); setStatus(null);
    try { await signOutThisBrowser(); setStatus("signedOut"); }
    catch { setStatus("error"); }
    finally { requestLock.current = false; setBusy(false); }
  }

  return <div className="storage-overlay" onMouseDown={event => { if (event.target === event.currentTarget) closeStorageSettings(); }}>
    <div ref={dialogRef} tabIndex={-1} className="storage-dialog" role="dialog" aria-modal="true" aria-labelledby="storage-title" aria-describedby="storage-intro">
      <button type="button" className="storage-close" onClick={closeStorageSettings} aria-label={label("Close", "Fechar", "Cerrar")}>×</button>
      <p className="storage-eyebrow">{label("YOUR BROWSER. YOUR CHOICE.", "SEU NAVEGADOR. SUA ESCOLHA.", "TU NAVEGADOR. TU ELECCIÓN.")}</p>
      <h2 id="storage-title">{label("Privacy & storage", "Privacidade e armazenamento", "Privacidad y almacenamiento")}</h2>
      <p id="storage-intro" className="storage-intro">{label("No advertising or analytics trackers are installed by this application. These controls manage local preferences, not consent to tracking.", "Esta aplicação não instala rastreadores de publicidade ou analytics. Estes controles gerenciam preferências locais, não consentimento para rastreamento.", "Esta aplicación no instala rastreadores publicitarios ni de analytics. Estos controles gestionan preferencias locales, no consentimiento al rastreo.")}</p>

      <fieldset className="storage-preferences"><legend>{label("Remember on this browser", "Lembrar neste navegador", "Recordar en este navegador")}</legend>
        <label className="storage-choice" htmlFor="storage-theme"><span><strong id="storage-theme-label">{label("Remember theme", "Lembrar tema", "Recordar tema")}</strong><span id="storage-theme-help">{label("Save light or dark mode for future visits.", "Salvar o modo claro ou escuro para futuras visitas.", "Guardar el modo claro u oscuro para futuras visitas.")}</span></span><input id="storage-theme" type="checkbox" role="switch" checked={choices.rememberTheme} onChange={event => changePreference("rememberTheme", event.target.checked)} aria-labelledby="storage-theme-label" aria-describedby="storage-theme-help" /></label>
        <label className="storage-choice" htmlFor="storage-language"><span><strong id="storage-language-label">{label("Remember language", "Lembrar idioma", "Recordar idioma")}</strong><span id="storage-language-help">{label("Save your selected language for future visits.", "Salvar o idioma escolhido para futuras visitas.", "Guardar tu idioma elegido para futuras visitas.")}</span></span><input id="storage-language" type="checkbox" role="switch" checked={choices.rememberLanguage} onChange={event => changePreference("rememberLanguage", event.target.checked)} aria-labelledby="storage-language-label" aria-describedby="storage-language-help" /></label>
      </fieldset>
      <p className="storage-caption">{label("Turning off remembering removes the saved value without changing this visit. A minimal record keeps your choices on this browser.", "Desativar remove o valor salvo sem alterar esta visita. Um registro mínimo mantém suas escolhas neste navegador.", "Desactivar elimina el valor guardado sin cambiar esta visita. Un registro mínimo conserva tus elecciones en este navegador.")}</p>
      <button type="button" className="storage-action" onClick={clearPreferences}>{label("Clear saved preferences", "Limpar preferências salvas", "Borrar preferencias guardadas")}</button>

      <section className="storage-session" aria-busy={busy}><h3>{label("Account session", "Sessão da conta", "Sesión de la cuenta")}</h3>
        <p>{label("Login is separate from preferences. Sign-out ends this session without deleting your account or signing out other devices. Issued access tokens may remain valid until expiry.", "O login é separado das preferências. Sair encerra esta sessão sem excluir a conta ou sair de outros dispositivos. Tokens de acesso emitidos podem permanecer válidos até expirar.", "El inicio de sesión es independiente. Cerrar esta sesión no elimina la cuenta ni cierra otros dispositivos. Los tokens emitidos pueden ser válidos hasta caducar.")}</p>
        <button type="button" className="storage-action" disabled={!user || busy || loading} onClick={() => { void endSession(); }}>{busy ? "…" : label("Sign out of this browser", "Sair deste navegador", "Cerrar sesión en este navegador")}</button>
        {!user && !loading && <span className="storage-caption">{label("You are not signed in.", "Você não está conectado.", "No has iniciado sesión.")}</span>}
      </section>

      {!storageAvailable && <p className="storage-warning" role="alert">{label("Browser storage is unavailable. Choices work for this visit, but saving or removal could not be confirmed. You can also manage site data in your browser settings.", "O armazenamento do navegador está indisponível. As escolhas valem nesta visita, mas não foi possível confirmar a gravação ou remoção. Você também pode gerenciar os dados do site nas configurações do navegador.", "El almacenamiento no está disponible. Las elecciones funcionan en esta visita, pero no se pudo confirmar el guardado o borrado. También puedes gestionar los datos del sitio en tu navegador.")}</p>}
      <p className={`storage-status ${status === "error" ? "storage-warning" : ""}`} role={status === "error" ? "alert" : "status"}>
        {status === "saved" && label("Preference updated on this browser.", "Preferência atualizada neste navegador.", "Preferencia actualizada en este navegador.")}
        {status === "cleared" && label("Saved theme and language removed. Remembering is off; your choices record remains.", "Tema e idioma salvos removidos. A memorização está desativada; o registro das escolhas permanece.", "Tema e idioma guardados eliminados. Recordar está desactivado; el registro de elecciones permanece.")}
        {status === "signedOut" && label("Signed out of this session. Your account was not deleted.", "Sessão encerrada. Sua conta não foi excluída.", "Sesión cerrada. Tu cuenta no fue eliminada.")}
        {status === "error" && label("Sign-out could not be completed. Try again before leaving a shared device.", "Não foi possível concluir o logout. Tente novamente antes de deixar um dispositivo compartilhado.", "No se pudo cerrar la sesión. Reintenta antes de dejar un dispositivo compartido.")}
      </p>
      <div className="storage-bottom"><a href={getAssetUrl("/privacy/")} target="_blank" rel="noopener noreferrer">{label("Read the privacy notice", "Ler o aviso de privacidade", "Leer el aviso de privacidad")} ↗</a><button type="button" onClick={closeStorageSettings}>{label("Done", "Concluir", "Listo")}</button></div>
    </div>
  </div>;
}
