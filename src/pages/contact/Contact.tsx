import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Contact.css";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="section">

      {/* TÍTULO DA SEÇÃO */}
      <div className="contact-header">
        <h2>{t.contact.title}</h2>
        <div className="contact-header-line"></div>
      </div>

      {/* CONTEÚDO ESQUERDA / DIREITA */}
      <div className="section-inner contact">

        {/* LEFT */}
        <div className="contact-left">
          <div className="contact-top">
            <img src={getAssetUrl("/images/me.jpg")} alt="Christian Silva" className="contact-photo" />
            <h3 className="contact-name">Christian Silva</h3>
          </div>

          <div className="contact-bottom">
            <p className="muted">{t.contact.role}</p>

            <div className="contact-socials">
              <a href="https://github.com/cssilvadev" target="_blank" rel="noopener noreferrer" className="social-link github">
                <FaGithub className="social-icon" />
                <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/christian-silva-a70418236/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                <FaLinkedin className="social-icon" />
                <span>LinkedIn</span>
              </a>
              <a href="mailto:christiansilva.dev@outlook.com" className="social-link email">
                <FaEnvelope className="social-icon" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="contact-right">
          <h3 className="contact-form-title">{t.contact.formTitle}</h3>
          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert(t.contact.sentSuccess); }}>
            <input placeholder={t.contact.firstName} required />
            <input placeholder={t.contact.lastName} required />
            <input type="email" placeholder={t.contact.email} required />
            <textarea placeholder={t.contact.message} rows={4} required />
            <button type="submit">{t.contact.sendBtn}</button>
          </form>
        </div>

      </div>
    </section>
  );
}
