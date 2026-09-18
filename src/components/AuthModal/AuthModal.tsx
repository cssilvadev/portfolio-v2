import { useEffect, useRef, useState } from "react";
import { FaEnvelope, FaLock, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import "./AuthModal.css";

export default function AuthModal() {
  const { t } = useLanguage();
  const { isAuthModalOpen, authMode, closeAuthModal, openAuthModal, signIn, signUp, resetPassword, updatePassword, authConfigured } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    firstFieldRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeAuthModal(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeAuthModal, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!authConfigured) { setError(t.auth.authNotConfigured); return; }
    if (authMode !== "reset" && password.length < 8) { setError(t.auth.passwordMin); return; }
    if ((authMode === "signup" || authMode === "update") && password !== confirmation) { setError(t.auth.confirmPassword); return; }

    setBusy(true);
    try {
      if (authMode === "login") await signIn(email, password);
      if (authMode === "signup") {
        await signUp(email, password, fullName);
        setMessage(t.auth.checkEmail);
      }
      if (authMode === "reset") {
        await resetPassword(email);
        setMessage(t.auth.checkEmail);
      }
      if (authMode === "update") {
        await updatePassword(password);
        setPassword("");
        setConfirmation("");
        setMessage(t.auth.passwordUpdated);
      }
    } catch (caught) {
      console.warn("Authentication request failed", caught);
      setError(t.auth.authFailed);
    } finally {
      setBusy(false);
    }
  };

  const title = authMode === "login" ? t.auth.signIn : authMode === "signup" ? t.auth.createAccount : authMode === "update" ? t.auth.resetPassword : t.auth.resetPassword;

  return (
    <div className="auth-overlay" onMouseDown={(event) => { if (event.currentTarget === event.target) closeAuthModal(); }}>
      <div className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
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

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === "signup" && (
            <label><span><FaUser /> {t.auth.fullName}</span><input ref={firstFieldRef} value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required /></label>
          )}
          {authMode !== "update" && <label><span><FaEnvelope /> {t.auth.email}</span><input ref={authMode === "signup" ? undefined : firstFieldRef} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>}
          {authMode !== "reset" && (
            <>
              <label><span><FaLock /> {t.auth.password}</span><input ref={authMode === "update" ? firstFieldRef : undefined} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>
              {(authMode === "signup" || authMode === "update") && <label><span><FaLock /> {t.auth.confirmPassword}</span><input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={8} required /></label>}
            </>
          )}
          <button type="submit" className="auth-submit" disabled={busy}>
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
