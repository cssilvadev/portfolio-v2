import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Contact.css";

type FormState = "idle" | "sending" | "success" | "error";

export default function Contact() {
  const { t } = useLanguage();
  const [formState, setFormState] = useState<FormState>("idle");
  const endpoint = import.meta.env.VITE_CONTACT_FORM_ENDPOINT?.trim();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!endpoint) {
      setFormState("error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("website")) return;

    setFormState("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Contact form request failed");
      form.reset();
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  return (
    <section id="contact" className="section">
      <div className="contact-header">
        <h2>{t.contact.title}</h2>
        <div className="contact-header-line" />
      </div>

      <div className="section-inner contact">
        <div className="contact-left">
          <div className="contact-top">
            <img src={getAssetUrl("/images/me.jpg")} alt="Christian Silva" className="contact-photo" />
            <h3 className="contact-name">Christian Silva</h3>
          </div>

          <div className="contact-bottom">
            <p className="muted">{t.contact.role}</p>
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
        </div>

        <div className="contact-right">
          <h3 className="contact-form-title">{t.contact.formTitle}</h3>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field">
              <label htmlFor="contact-first-name">{t.contact.firstName}</label>
              <input id="contact-first-name" name="firstName" autoComplete="given-name" placeholder={t.contact.firstName} required />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-last-name">{t.contact.lastName}</label>
              <input id="contact-last-name" name="lastName" autoComplete="family-name" placeholder={t.contact.lastName} required />
            </div>
            <div className="contact-field contact-field-full">
              <label htmlFor="contact-email">{t.contact.email}</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" placeholder={t.contact.email} required />
            </div>
            <div className="contact-field contact-field-full">
              <label htmlFor="contact-message">{t.contact.message}</label>
              <textarea id="contact-message" name="message" autoComplete="off" placeholder={t.contact.message} rows={4} required />
            </div>
            <div className="contact-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <button type="submit" disabled={formState === "sending"}>
              {formState === "sending" ? t.contact.sending : t.contact.sendBtn}
            </button>
          </form>

          <div className={`contact-status ${formState}`} role={formState === "error" ? "alert" : "status"} aria-live="polite">
            {formState === "success" && t.contact.sentSuccess}
            {formState === "error" && (
              <>
                {endpoint ? t.contact.sendError : t.contact.endpointMissing}{" "}
                <a href="mailto:christiansilva.dev@outlook.com">{t.contact.emailFallback}</a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
