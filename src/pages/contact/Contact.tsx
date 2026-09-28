import { useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Contact.css";
import { useScrollEntrance } from "../../hooks/useScrollEntrance";
import { Link } from "react-router-dom";
import { activeContactEndpoint as endpoint } from "../../lib/securityConfig";
import { contactLimits, validContactFields } from "../../utils/security";

type FormState = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const { t, language } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  useScrollEntrance(sectionRef);
  const [formState, setFormState] = useState<FormState>("idle");
  const requestLock = useRef(false);
  const copy = {
    pt: { email: "Vamos conversar por e-mail.", detail: "O formulário ainda não está ativo. Este botão abre seu aplicativo de e-mail; nenhuma mensagem é enviada pelo site.", button: "Escrever um e-mail", privacy: "Como seus dados são tratados", processor: "Ao enviar, nome, e-mail e mensagem serão encaminhados pelo Formspree para responder ao seu contato." },
    en: { email: "Let’s talk by email.", detail: "The form is not active yet. This button opens your email app; the site does not send a message.", button: "Write an email", privacy: "How your data is handled", processor: "Sending forwards your name, email and message through Formspree to respond to your inquiry." },
    es: { email: "Hablemos por correo.", detail: "El formulario aún no está activo. Este botón abre tu aplicación de correo; el sitio no envía ningún mensaje.", button: "Escribir un correo", privacy: "Cómo se tratan tus datos", processor: "Al enviar, tu nombre, correo y mensaje se transmitirán mediante Formspree para responder a tu consulta." },
  }[language];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (requestLock.current) return;
    if (!endpoint) {
      setFormState("error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("website")) return;
    const fields = Object.fromEntries(["firstName", "lastName", "email", "message"].map(key => [key, String(formData.get(key) ?? "").trim()])) as { firstName: string; lastName: string; email: string; message: string };
    if (!validContactFields(fields)) { setFormState("error"); return; }
    const payload = new FormData();
    Object.entries(fields).forEach(([key, value]) => payload.set(key, value));

    requestLock.current = true;
    setFormState("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) throw new Error("Contact form request failed");
      form.reset();
      setFormState("success");
    } catch {
      setFormState("error");
    } finally {
      requestLock.current = false;
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
        <div className="contact-right" data-contact-mode={endpoint ? "form" : "email"}>
          <h3 className="contact-form-title">{endpoint ? t.contact.formTitle : copy.email}</h3>
          {!endpoint ? <div className="contact-email-mode">
            <p>{copy.detail}</p>
            <a className="contact-email-cta" href="mailto:christiansilva.dev@outlook.com">{copy.button} <span aria-hidden="true">↗</span></a>
            <span className="contact-email-address">christiansilva.dev@outlook.com</span>
          </div> : <>
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
            <button type="submit" disabled={formState === "sending" || typeof window === "undefined"}>
              {formState === "sending" ? t.contact.sending : t.contact.sendBtn}
              {formState !== "sending" && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <div className={`contact-status ${formState}`} role={formState === "error" ? "alert" : "status"}>
            {formState === "success" && t.contact.sentSuccess}
            {formState === "error" && (
              <>
                {endpoint ? t.contact.sendError : t.contact.endpointMissing}{" "}
                <a href="mailto:christiansilva.dev@outlook.com">{t.contact.emailFallback}</a>
              </>
            )}
          </div>
          <p className="contact-privacy">{copy.processor}</p>
          </>}
          <Link className="contact-privacy" to="/privacy">{copy.privacy} ↗</Link>
        </div>
        </div>
      </div>
    </section>
  );
}
