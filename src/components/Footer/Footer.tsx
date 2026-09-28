import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { text } from "../../data/editorial";
import { getAssetUrl } from "../../utils/assets";
import "./Footer.css";
import { useStoragePreferences } from "../../context/StoragePreferencesContext";

export default function Footer() {
  const { language } = useLanguage();
  const { openStorageSettings } = useStoragePreferences();
  return <footer className="site-footer"><span>Christian Silva</span><nav aria-label={text("Site information", "Informações do site", "Información del sitio")[language]}>
    <Link to="/privacy">{text("Privacy", "Privacidade", "Privacidad")[language]}</Link>
    <button type="button" onClick={openStorageSettings}>{text("Storage settings", "Preferências de armazenamento", "Preferencias de almacenamiento")[language]}</button>
    <a href={getAssetUrl("/feed.xml")}>RSS</a>
  </nav></footer>;
}
