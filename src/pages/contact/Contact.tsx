import "./Contact.css";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

export default function Contact() {
  return (
    <section id="contact" className="section">

      {/* TÍTULO DA SEÇÃO */}
      <div className="contact-header">
        <h2>CONTACT</h2>
        <div className="contact-header-line"></div>
      </div>

      {/* CONTEÚDO ESQUERDA / DIREITA */}
      <div className="section-inner contact">

        {/* LEFT */}
        <div className="contact-left">
          <div className="contact-top">
            <img src="/images/me.jpg" alt="Christian" className="contact-photo" />
            <h3 className="contact-name">Christian Silva</h3>
          </div>

          <div className="contact-bottom">
            <p className="muted">Software & Firmware Engineer</p>

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
          <h3 className="contact-form-title">Send me a message</h3>
          <form className="contact-form">
            <input placeholder="First name" />
            <input placeholder="Last name" />
            <input placeholder="Email" />
            <textarea placeholder="Message" rows={4} />
            <button type="submit">Send</button>
          </form>
        </div>

      </div>
    </section>
  );
}
