import type { Language } from "../../i18n/translations";
import "./Flags.css";

export function FlagBR() {
  return (
    <svg
      className="flag-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 504"
      width="18"
      height="13"
    >
      <rect width="720" height="504" fill="#009c3b" rx="40" />
      <polygon points="360,54 666,252 360,450 54,252" fill="#ffdf00" />
      <circle cx="360" cy="252" r="126" fill="#002776" />
      <path
        d="M 235 265 Q 360 215 485 265"
        stroke="#ffffff"
        strokeWidth="14"
        fill="none"
      />
    </svg>
  );
}

export function FlagUS() {
  return (
    <svg
      className="flag-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 741 390"
      width="18"
      height="13"
    >
      <rect width="741" height="390" fill="#b22234" rx="40" />
      <path
        d="M0,45h741M0,105h741M0,165h741M0,225h741M0,285h741M0,345h741"
        stroke="#ffffff"
        strokeWidth="30"
      />
      <rect width="296" height="210" fill="#3c3b6e" rx="20" />
      {/* Star dots representation */}
      <g fill="#ffffff" transform="scale(0.8) translate(15, 12)">
        <circle cx="40" cy="35" r="8" />
        <circle cx="90" cy="35" r="8" />
        <circle cx="140" cy="35" r="8" />
        <circle cx="190" cy="35" r="8" />
        <circle cx="240" cy="35" r="8" />
        <circle cx="65" cy="70" r="8" />
        <circle cx="115" cy="70" r="8" />
        <circle cx="165" cy="70" r="8" />
        <circle cx="215" cy="70" r="8" />
        <circle cx="40" cy="105" r="8" />
        <circle cx="90" cy="105" r="8" />
        <circle cx="140" cy="105" r="8" />
        <circle cx="190" cy="105" r="8" />
        <circle cx="240" cy="105" r="8" />
        <circle cx="65" cy="140" r="8" />
        <circle cx="115" cy="140" r="8" />
        <circle cx="165" cy="140" r="8" />
        <circle cx="215" cy="140" r="8" />
        <circle cx="40" cy="175" r="8" />
        <circle cx="90" cy="175" r="8" />
        <circle cx="140" cy="175" r="8" />
        <circle cx="190" cy="175" r="8" />
        <circle cx="240" cy="175" r="8" />
      </g>
    </svg>
  );
}

export function FlagES() {
  return (
    <svg
      className="flag-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 750 500"
      width="18"
      height="13"
    >
      <rect width="750" height="500" fill="#aa151b" rx="40" />
      <rect y="125" width="750" height="250" fill="#f1bf00" />
      {/* Coat of arms emblem */}
      <g transform="translate(180, 185) scale(1.1)">
        <rect x="0" y="0" width="40" height="55" rx="10" fill="#aa151b" stroke="#781116" strokeWidth="3" />
        <circle cx="20" cy="10" r="6" fill="#f1bf00" />
        <rect x="10" y="20" width="20" height="25" fill="#f1bf00" />
      </g>
    </svg>
  );
}

export function FlagIcon({ lang }: { lang: Language }) {
  switch (lang) {
    case "pt":
      return <FlagBR />;
    case "es":
      return <FlagES />;
    case "en":
    default:
      return <FlagUS />;
  }
}
