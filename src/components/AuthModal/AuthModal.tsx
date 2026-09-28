import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FaEnvelope, FaLock, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./AuthModal.css";
import { useDialogAccessibility } from "../../hooks/useDialogAccessibility";
import { captchaSiteKey } from "../../lib/securityConfig";
import { text } from "../../data/editorial";
import { getAssetUrl } from "../../utils/assets";

const Captcha = lazy(() => import("../Captcha/Captcha"));

export default function AuthModal() {
  const { isAuthModalOpen, authMode } = useAuth();
  // Unmount fields on close or mode change: no retained password in hidden state.
  return isAuthModalOpen ? <AuthDialog key={authMode} /> : null;
}

function AuthDialog() {
  const { t, language } = useLanguage();
  const { isAuthModalOpen, authMode, closeAuthModal, openAuthModal, signIn, signUp, resetPassword, updatePassword, authConfigured } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaReset, setCaptchaReset] = useState(0);
  const requestLock = useRef(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(isAuthModalOpen, dialogRef, closeAuthModal);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    firstFieldRef.current?.focus();
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestLock.current) return;
    setError("");
    setMessage("");
    if (!authConfigured) { setError(t.auth.authNotConfigured); return; }
    if ((authMode === "signup" || authMode === "update") && password.length < 12) {
      setError(text("Use at least 12 characters.", "Use pelo menos 12 caracteres.", "Usa al menos 12 caracteres.")[language]); return;
    }
    if (captchaSiteKey && authMode !== "update" && !captchaToken) { setError(t.auth.authFailed); return; }
    if ((authMode === "signup" || authMode === "update") && password !== confirmation) { setError(t.auth.confirmPassword); return; }

    requestLock.current = true; setBusy(true);
    try {
      if (authMode === "login") await signIn(email, password, captchaToken);
      if (authMode === "signup") {
        await signUp(email, password, fullName, captchaToken);
        setMessage(t.auth.checkEmail);
      }
      if (authMode === "reset") {
        await resetPassword(email, captchaToken);
        setMessage(t.auth.checkEmail);
      }
      if (authMode === "update") {
        await updatePassword(password);
        setPassword("");
        setConfirmation("");
        setMessage(t.auth.passwordUpdated);
      }
    } catch {
      setError(t.auth.authFailed);
    } finally {
      setPassword(""); setConfirmation(""); setCaptchaToken(undefined); setCaptchaReset(value => value + 1);
      requestLock.current = false;
      setBusy(false);
    }
  };

  const title = authMode === "login" ? t.auth.signIn : authMode === "signup" ? t.auth.createAccount : authMode === "update" ? t.auth.resetPassword : t.auth.resetPassword;

  return (
    <div className="auth-overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) closeAuthModal(); }}>
      <div ref={dialogRef} tabIndex={-1} className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button type="button" className="auth-close-btn" onClick={closeAuthModal} aria-label={t.auth.close}><FaTimes /></button>
        <h2 id="auth-title">{title}</h2>
        {authMode !== "reset" && authMode !== "update" && (
          <div className="auth-tabs">
            <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => { openAuthModal("login"); setError(""); }}>{t.auth.signIn}</button>
            <button type="button" className={authMode === "signup" ? "active" : ""} onClick={() => { openAuthModal("signup"); setError(""); }}>{t.auth.signUp}</button>
          </div>
        )}

        {error && <p className="auth-message error" role="alert">{error}</p>}
        {message && <p className="auth-message success" role="status">{message}</p>}

        <form method="post" onSubmit={handleSubmit} className="auth-form">
          {authMode === "signup" && (
            <label><span><FaUser /> {t.auth.fullName}</span><input ref={firstFieldRef} value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" maxLength={100} required /></label>
          )}
          {authMode !== "update" && <label><span><FaEnvelope /> {t.auth.email}</span><input ref={authMode === "signup" ? undefined : firstFieldRef} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} required /></label>}
          {authMode !== "reset" && (
            <>
              <label><span><FaLock /> {t.auth.password}</span><input ref={authMode === "update" ? firstFieldRef : undefined} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={authMode === "login" ? 1 : 12} maxLength={128} required /></label>
              {(authMode === "signup" || authMode === "update") && <label><span><FaLock /> {t.auth.confirmPassword}</span><input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} required /></label>}
            </>
          )}
          {captchaSiteKey && authMode !== "update" && <Suspense fallback={<p role="status">…</p>}><Captcha siteKey={captchaSiteKey} resetKey={captchaReset} onToken={setCaptchaToken} /></Suspense>}
          <p className="auth-privacy">{text("Your account uses your name and email. Read how these data are handled.", "Sua conta usa nome e e-mail. Conheça como esses dados são tratados.", "Tu cuenta utiliza nombre y correo. Consulta cómo se tratan estos datos.")[language]}{" "}<a href={getAssetUrl("/privacy/")} target="_blank" rel="noopener noreferrer">{text("Privacy", "Privacidade", "Privacidad")[language]} ↗</a></p>
          <button type="submit" className="auth-submit" disabled={busy || Boolean(captchaSiteKey && authMode !== "update" && !captchaToken)}>
            {busy ? (authMode === "login" ? t.auth.signingIn : authMode === "signup" ? t.auth.signingUp : t.auth.resetting) : authMode === "login" ? t.auth.signIn : authMode === "signup" ? t.auth.createAccount : authMode === "update" ? t.auth.resetPassword : t.auth.sendReset}
          </button>
        </form>

        {authMode === "login" ? (
          <button type="button" className="auth-link" onClick={() => { openAuthModal("reset"); setError(""); }}>{t.auth.forgotPassword}</button>
        ) : authMode === "reset" ? (
          <button type="button" className="auth-link" onClick={() => { openAuthModal("login"); setError(""); }}>{t.auth.backToSignIn}</button>
        ) : null}
      </div>
    </div>
  );
}
