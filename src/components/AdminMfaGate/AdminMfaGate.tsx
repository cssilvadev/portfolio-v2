import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { supabase } from "../../lib/supabase";
import { text } from "../../data/editorial";
import "./AdminMfaGate.css";

type Factor = { id: string; friendly_name?: string };
type Enrollment = { id: string; qr: string; secret: string };
type AccessState = "checking" | "enroll" | "challenge" | "verified" | "error";

/** UI gate complements the SQL migration's AAL2 rule; it is not authorization. */
export default function AdminMfaGate({ children }: { children: ReactNode }) {
  const { session, signOut } = useAuth();
  const { language } = useLanguage();
  const [access, setAccess] = useState<AccessState>("checking");
  const [factors, setFactors] = useState<Factor[]>([]);
  const [factorId, setFactorId] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const requestLock = useRef(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    if (!supabase) return;
    void (async () => {
      const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!active) return;
      if (assuranceError || !assurance) { setAccess("error"); return; }
      if (assurance.currentLevel === "aal2") { setEnrollment(null); setCode(""); setAccess("verified"); return; }
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (factorError) { setAccess("error"); return; }
      const verified = data.totp.filter(factor => factor.status === "verified");
      setFactors(verified);
      setFactorId(verified[0]?.id ?? "");
      setAccess(verified.length ? "challenge" : "enroll");
    })().catch(() => { if (active) setAccess("error"); });
    return () => { active = false; };
  }, [session?.access_token, retry]);

  async function run(operation: () => Promise<void>) {
    if (requestLock.current) return;
    requestLock.current = true; setBusy(true); setError(false);
    try { await operation(); } catch { setError(true); }
    finally { requestLock.current = false; setBusy(false); }
  }
  function enroll() {
    void run(async () => {
      if (!supabase) throw new Error("Unavailable");
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Portfolio admin ${Date.now()}` });
      if (enrollError) throw enrollError;
      // Secrets stay in component memory, never logs, storage or URLs outside this image.
      const qr = data.totp.qr_code.startsWith("data:image/svg+xml")
        ? data.totp.qr_code : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data.totp.qr_code)}`;
      setEnrollment({ id: data.id, qr, secret: data.totp.secret });
      setCode("");
    });
  }
  function verify(event: React.FormEvent) {
    event.preventDefault();
    void run(async () => {
      if (!supabase || !/^\d{6}$/.test(code)) throw new Error("Invalid code");
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollment?.id ?? factorId, code });
      if (verifyError) throw verifyError;
      const { data, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (assuranceError || data?.currentLevel !== "aal2") throw new Error("Verification required");
      setCode(""); setEnrollment(null); setAccess("verified");
    });
  }
  function cancelEnrollment() {
    void run(async () => {
      if (!supabase || !enrollment) return;
      // Only the newly-created unverified factor, never an existing credential.
      const { error: cancelError } = await supabase.auth.mfa.unenroll({ factorId: enrollment.id });
      if (cancelError) throw cancelError;
      setEnrollment(null); setCode("");
    });
  }

  if (access === "verified") return children;
  const label = (en: string, pt: string, es: string) => text(en, pt, es)[language];
  return <main id="main-content" className="mfa-page"><section className="mfa-card" aria-busy={busy}>
    <p className="story-eyebrow">ADMIN / MFA</p>
    <h1>{label("An extra layer of protection.", "Uma camada extra de proteção.", "Una capa extra de protección.")}</h1>
    <p>{label("Content administration requires a verified authenticator session. Never share your QR code, secret or one-time code.", "A administração exige uma sessão verificada com autenticador. Nunca compartilhe o QR code, a chave ou o código de uso único.", "La administración requiere una sesión verificada con autenticador. Nunca compartas el QR, la clave ni el código de un solo uso.")}</p>
    {access === "checking" && <p role="status">{label("Checking session…", "Verificando sessão…", "Verificando sesión…")}</p>}
    {access === "error" && <><p role="alert">{label("The session could not be verified. Access remains blocked.", "Não foi possível verificar a sessão. O acesso permanece bloqueado.", "No se pudo verificar la sesión. El acceso permanece bloqueado.")}</p><button type="button" onClick={() => { setAccess("checking"); setRetry(value => value + 1); }}>{label("Try again", "Tentar novamente", "Reintentar")}</button></>}
    {access === "enroll" && !enrollment && <button type="button" disabled={busy} onClick={enroll}>{label("Set up authenticator", "Configurar autenticador", "Configurar autenticador")}</button>}
    {enrollment && <div className="mfa-enrollment"><img src={enrollment.qr} width="240" height="240" alt={label("Private authenticator setup QR code", "QR code privado de configuração do autenticador", "QR privado para configurar el autenticador")} />
      <details><summary>{label("Enter the key manually", "Inserir a chave manualmente", "Introducir la clave manualmente")}</summary><code>{enrollment.secret}</code></details>
    </div>}
    {(access === "challenge" || enrollment) && <form onSubmit={verify} className="mfa-form">
      {!enrollment && factors.length > 1 && <label>{label("Authenticator", "Autenticador", "Autenticador")}<select value={factorId} onChange={event => setFactorId(event.target.value)}>{factors.map((factor, index) => <option key={factor.id} value={factor.id}>{factor.friendly_name ?? `TOTP ${index + 1}`}</option>)}</select></label>}
      <label htmlFor="mfa-code">{label("Six-digit code", "Código de seis dígitos", "Código de seis dígitos")}</label>
      <input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="[0-9]{6}" minLength={6} maxLength={6} required />
      <button type="submit" disabled={busy || code.length !== 6}>{busy ? "…" : label("Verify and continue", "Verificar e continuar", "Verificar y continuar")}</button>
      {enrollment && <button type="button" disabled={busy} onClick={cancelEnrollment}>{label("Cancel setup", "Cancelar configuração", "Cancelar configuración")}</button>}
    </form>}
    {error && <p role="alert">{label("Verification failed. Check your code and try again.", "A verificação falhou. Confira o código e tente novamente.", "La verificación falló. Comprueba el código y reintenta.")}</p>}
    <button type="button" className="mfa-signout" disabled={busy} onClick={() => { void run(signOut); }}>{label("Sign out", "Sair", "Cerrar sesión")}</button>
  </section></main>;
}
