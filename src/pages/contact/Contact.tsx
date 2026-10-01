import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Contact.css";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";
import { Link } from "react-router-dom";
import { captchaSiteKey, contactFormEnabled } from "../../lib/securityConfig";
import { supabase } from "../../lib/supabase";
import { contactLimits, validContactFields } from "../../utils/security";
const Captcha = lazy(() => import("../../components/Captcha/Captcha"));

type FormState = "idle" | "sending" | "success" | "error" | "rateLimited";

export default function Contact() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollEntrance(sectionRef);
  const [formState, setFormState] = useState<FormState>("idle");
  const [formError, setFormError] = useState<"captcha" | "unavailable" | "delivery">("delivery");
  const [emailCopyState, setEmailCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [captchaToken, setCaptchaToken] = useState<string>();
  const [captchaReset, setCaptchaReset] = useState(0);
  const requestLock = useRef(false);
  const handleCaptchaToken = useCallback((token: string | undefined) => setCaptchaToken(token), []);
  const copy = {
    pt: { email: "Vamos conversar por e-mail.", detail: "O formulário pelo site ainda não está ativo. Você pode abrir seu aplicativo de e-mail ou copiar o endereço.", button: "Escrever um e-mail", copyButton: "Copiar e-mail", copied: "E-mail copiado.", copyError: "Não foi possível copiar automaticamente. Selecione o endereço acima e copie manualmente.", privacy: "Como seus dados são tratados", processor: "Seus dados serão encaminhados pelo Supabase e Brevo para entregar a mensagem. O conteúdo não será salvo no banco do portfólio.", captchaRequired: "Conclua a verificação de segurança para enviar.", captchaNotConfigured: "A verificação de segurança ainda não foi configurada. Escreva diretamente por e-mail enquanto isso.", captchaUnavailable: "A verificação não carregou. Atualize a página ou escreva diretamente por e-mail.", rateLimited: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
    en: { email: "Let’s talk by email.", detail: "The website form is not active yet. You can open your email app or copy the address.", button: "Write an email", copyButton: "Copy email", copied: "Email copied.", copyError: "Could not copy automatically. Select the address above and copy it manually.", privacy: "How your data is handled", processor: "Your details will be relayed through Supabase and Brevo to deliver the message. The portfolio database will not store its contents.", captchaRequired: "Complete the security check before sending.", captchaNotConfigured: "The security check is not configured yet. Email me directly in the meantime.", captchaUnavailable: "The security check could not load. Refresh the page or email me directly.", rateLimited: "Too many attempts. Wait a few minutes and try again." },
    es: { email: "Hablemos por correo.", detail: "El formulario del sitio aún no está activo. Puedes abrir tu aplicación de correo o copiar la dirección.", button: "Escribir un correo", copyButton: "Copiar correo", copied: "Correo copiado.", copyError: "No se pudo copiar automáticamente. Selecciona la dirección de arriba y cópiala manualmente.", privacy: "Cómo se tratan tus datos", processor: "Tus datos se enviarán mediante Supabase y Brevo para entregar el mensaje. El contenido no se guardará en la base de datos del portafolio.", captchaRequired: "Completa la verificación de seguridad antes de enviar.", captchaNotConfigured: "La verificación de seguridad aún no está configurada. Escríbeme por correo mientras tanto.", captchaUnavailable: "No se pudo cargar la verificación. Actualiza la página o escríbeme por correo.", rateLimited: "Demasiados intentos. Espera unos minutos y vuelve a intentarlo." },
  }[language];

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("christiansilva.dev@outlook.com");
      setEmailCopyState("copied");
    } catch {
      setEmailCopyState("error");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestLock.current) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("website")) return;
    const fields = Object.fromEntries(["firstName", "lastName", "email", "message"].map(key => [key, String(formData.get(key) ?? "").trim()])) as { firstName: string; lastName: string; email: string; message: string };
    if (!validContactFields(fields)) { setFormError("delivery"); setFormState("error"); return; }
    if (!supabase || !captchaSiteKey) { setFormError("unavailable"); setFormState("error"); return; }
    if (!captchaToken) { setFormError("captcha"); setFormState("error"); return; }

    requestLock.current = true;
    setFormState("sending");
    try {
      const { error } = await supabase.functions.invoke("send-contact-message", {
        body: { ...fields, website: String(formData.get("website") ?? ""), turnstileToken: captchaToken },
      });
      if (error) {
        const status = (error as { context?: Response }).context?.status;
        if (status === 429) { setFormState("rateLimited"); return; }
        throw new Error("Contact delivery failed");
      }
      form.reset();
      setFormState("success");
    } catch {
      setFormError("delivery");
      setFormState("error");
    } finally {
      requestLock.current = false;
      setCaptchaToken(undefined);
      setCaptchaReset(value => value + 1);
    }
  };

  return (
    <section id="contact" ref={sectionRef} className="section contact-story">
      <div className="contact-stage">
        <div className="contact-left" data-scroll-enter>
          <p className="story-eyebrow">04 / {t.contact.title}</p>
          <h2>{t.contact.title}</h2>
          <p className="contact-name">Christian Silva</p>
          <p className="contact-role">{t.contact.role}</p>
          <div className="contact-socials">
            <a href="https://github.com/cssilvadev" target="_blank" rel="noopener noreferrer" className="social-link github">
              <FaGithub className="social-icon" /> <span>GitHub</span>
            </a>
            <a href="https://www.linkedin.com/in/christian-silva-a70418236/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
              <FaLinkedin className="social-icon" /> <span>LinkedIn</span>
            </a>
            <a href="mailto:christiansilva.dev@outlook.com" className="social-link email">
              <FaEnvelope className="social-icon" /> <span>Email</span>
            </a>
          </div>
        </div>

        <div className="contact-form-reveal" data-scroll-enter>
        <div className="contact-right" data-contact-mode={contactFormEnabled ? "form" : "email"}>
          <h3 className="contact-form-title">{contactFormEnabled ? t.contact.formTitle : copy.email}</h3>
          {contactFormEnabled ? <>
          <form className="contact-form" method="post" onSubmit={handleSubmit} aria-busy={formState === "sending"}
            onChange={() => { if (formState !== "sending") setFormState("idle"); }}>
            <div className="contact-field">
              <label htmlFor="contact-first-name">{t.contact.firstName}</label>
              <input id="contact-first-name" name="firstName" autoComplete="given-name" maxLength={contactLimits.name} placeholder={t.contact.firstName} required />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-last-name">{t.contact.lastName}</label>
              <input id="contact-last-name" name="lastName" autoComplete="family-name" maxLength={contactLimits.name} placeholder={t.contact.lastName} required />
            </div>
            <div className="contact-field contact-field-full">
              <label htmlFor="contact-email">{t.contact.email}</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={contactLimits.email} placeholder={t.contact.email} required />
            </div>
            <div className="contact-field contact-field-full">
              <label htmlFor="contact-message">{t.contact.message}</label>
              <textarea id="contact-message" name="message" autoComplete="off" maxLength={contactLimits.message} placeholder={t.contact.message} rows={4} required />
            </div>
            <div className="contact-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            {captchaSiteKey ? <div className="contact-captcha"><Suspense fallback={<p role="status">…</p>}><Captcha siteKey={captchaSiteKey} resetKey={captchaReset} onToken={handleCaptchaToken} action="contact" /></Suspense></div> : <p className="contact-captcha-message" role="status">{copy.captchaNotConfigured}</p>}
            <button type="submit" disabled={formState === "sending" || !captchaSiteKey || !captchaToken || !supabase || typeof window === "undefined"}>
              {formState === "sending" ? t.contact.sending : t.contact.sendBtn}
              {formState !== "sending" && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <div className={`contact-status ${formState}`} role={formState === "error" ? "alert" : "status"}>
            {formState === "success" && t.contact.sentSuccess}
            {formState === "rateLimited" && copy.rateLimited}
            {formState === "error" && (
              <>
                {formError === "unavailable" ? copy.captchaUnavailable : formError === "captcha" ? copy.captchaRequired : t.contact.sendError}{" "}
                <a href="mailto:christiansilva.dev@outlook.com">{t.contact.emailFallback}</a>
              </>
            )}
          </div>
          <p className="contact-privacy">{copy.processor}</p>
          <a className="contact-email-address" href="mailto:christiansilva.dev@outlook.com">christiansilva.dev@outlook.com</a>
          <button className="contact-copy-email" type="button" onClick={() => void copyEmail()}>{copy.copyButton}</button>
          <p className={`contact-copy-status ${emailCopyState}`} role="status" aria-live="polite">
            {emailCopyState === "copied" ? copy.copied : emailCopyState === "error" ? copy.copyError : ""}
          </p>
          <Link className="contact-privacy" to="/privacy">{copy.privacy} ↗</Link>
          </> : <div className="contact-email-mode">
            <p>{copy.detail}</p>
            <a className="contact-email-cta" href="mailto:christiansilva.dev@outlook.com">{copy.button} <span aria-hidden="true">↗</span></a>
            <a className="contact-email-address" href="mailto:christiansilva.dev@outlook.com">christiansilva.dev@outlook.com</a>
            <button className="contact-copy-email" type="button" onClick={() => void copyEmail()}>{copy.copyButton}</button>
            <p className={`contact-copy-status ${emailCopyState}`} role="status" aria-live="polite">
              {emailCopyState === "copied" ? copy.copied : emailCopyState === "error" ? copy.copyError : ""}
            </p>
            <Link className="contact-privacy" to="/privacy">{copy.privacy} ↗</Link>
          </div>}
        </div>
        </div>
      </div>
    </section>
  );
}
