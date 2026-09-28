import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { text } from "../../data/editorial";

type TurnstileApi = {
  render: (target: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: TurnstileApi } }
let scriptPromise: Promise<TurnstileApi> | undefined;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else { script.remove(); scriptPromise = undefined; reject(new Error("Challenge unavailable")); }
    };
    script.onerror = () => { script.remove(); scriptPromise = undefined; reject(new Error("Challenge unavailable")); };
    document.head.append(script);
  });
  return scriptPromise;
}

/** Loads only inside an auth dialog when the owner supplies a public site key. */
export default function Captcha({ siteKey, resetKey, onToken }: { siteKey: string; resetKey: number; onToken: (token: string | undefined) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const { language } = useLanguage();
  useEffect(() => {
    let active = true;
    let widget: string | undefined;
    let api: TurnstileApi | undefined;
    onToken(undefined);
    void loadTurnstile().then(loaded => {
      if (!active || !container.current) return;
      api = loaded;
      widget = api.render(container.current, {
        sitekey: siteKey, size: "flexible", theme: "auto", language,
        callback: (token: string) => { if (active) { setFailed(false); onToken(token); } },
        "expired-callback": () => { if (active) onToken(undefined); },
        "error-callback": () => { if (active) { setFailed(true); onToken(undefined); } },
      });
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (api && widget) api.remove(widget); };
  }, [siteKey, resetKey, onToken, language]);
  return <div className="auth-captcha"><div ref={container} />{failed && <p role="alert">{text("The security challenge is unavailable. Close and reopen this dialog to retry.", "A verificação de segurança está indisponível. Feche e reabra esta janela para tentar novamente.", "La verificación de seguridad no está disponible. Cierra y vuelve a abrir esta ventana.")[language]}</p>}</div>;
}
