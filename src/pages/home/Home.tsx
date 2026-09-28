import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { getAssetUrl } from "../../utils/assets";
import "./Home.css";

function smoothstep(start: number, end: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

const ROBOT_IMAGE = "/images/robot-transparent.png";
const ASSEMBLY = [
  { name: "leg-left", start: 0.03, end: 0.24, x: -38, y: 105 },
  { name: "leg-right", start: 0.03, end: 0.24, x: 38, y: 105 },
  { name: "torso", start: 0.24, end: 0.43, x: 0, y: -85 },
  { name: "arm-left", start: 0.36, end: 0.58, x: -105, y: -18 },
  { name: "arm-right", start: 0.36, end: 0.58, x: 105, y: -18 },
  { name: "head", start: 0.51, end: 0.68, x: 0, y: -105 },
] as const;

export default function Home() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let lastProgress = -1;
    let displayedProgress = 0;
    let targetProgress = 0;
    let lastTime = 0;

    const render = (progress: number) => {
      if (progress === lastProgress) return;
      lastProgress = progress;

      section.style.setProperty("--hero-progress", progress.toFixed(4));
      const finalOpacity = smoothstep(0.70, 0.76, progress);
      section.style.setProperty("--final-opacity", finalOpacity.toFixed(4));
      for (const part of ASSEMBLY) {
        const t = Math.max(0, Math.min(1, (progress - part.start) / (part.end - part.start)));
        const remaining = (1 - t) ** 3;
        const opacity = smoothstep(part.start, part.start + 0.07, progress) * (1 - finalOpacity);
        section.style.setProperty(`--${part.name}-opacity`, opacity.toFixed(4));
        section.style.setProperty(`--${part.name}-x`, `${(part.x * remaining).toFixed(1)}px`);
        section.style.setProperty(`--${part.name}-y`, `${(part.y * remaining).toFixed(1)}px`);
      }
      const introOpacity = 1 - smoothstep(0.14, 0.30, progress);
      const middleIn = smoothstep(0.24, 0.40, progress);
      const middleOut = smoothstep(0.56, 0.74, progress);
      const endOpacity = smoothstep(0.68, 0.86, progress);
      section.style.setProperty("--intro-opacity", introOpacity.toFixed(4));
      section.style.setProperty("--intro-y", `${(-16 * (1 - introOpacity)).toFixed(2)}px`);
      section.style.setProperty(
        "--middle-opacity",
        (middleIn * (1 - middleOut)).toFixed(4),
      );
      section.style.setProperty("--middle-y", `${(16 * (1 - middleIn) - 16 * middleOut).toFixed(2)}px`);
      section.style.setProperty("--end-opacity", endOpacity.toFixed(4));
      section.style.setProperty("--end-y", `${(16 * (1 - endOpacity)).toFixed(2)}px`);
    };

    const animate = (time: number) => {
      frame = 0;
      // Time-based damping feels the same at 30, 60 or 120 Hz. The loop
      // continues briefly between wheel events, then stops once settled.
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 1000 / 60;
      lastTime = time;
      displayedProgress += (targetProgress - displayedProgress) * (1 - Math.exp(-elapsed / 100));
      if (Math.abs(targetProgress - displayedProgress) < 0.0001) {
        displayedProgress = targetProgress;
      }
      render(displayedProgress);
      if (displayedProgress !== targetProgress) {
        frame = window.requestAnimationFrame(animate);
      } else {
        lastTime = 0;
      }
    };

    const schedule = (snap = false) => {
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      targetProgress = distance > 0 ? Math.max(0, Math.min(1, -rect.top / distance)) : 0;
      if (motionPreference.matches || snap || targetProgress === 0 || targetProgress === 1) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        displayedProgress = targetProgress;
        render(displayedProgress);
        return;
      }
      if (!frame) frame = window.requestAnimationFrame(animate);
    };
    const onScroll = () => schedule();
    const onResize = () => schedule(true);
    const onMotionPreferenceChange = () => schedule(true);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    motionPreference.addEventListener("change", onMotionPreferenceChange);
    schedule(true);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section id="home" ref={sectionRef} className="home" aria-label={t.home.scrollSectionLabel}>
      <div className="hero-stage">
        <div className="hero-stage-inner">
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-robot-frame">
              <img
                className="hero-robot-guide"
                src={getAssetUrl(ROBOT_IMAGE)}
                alt=""
                width="1122"
                height="1402"
                fetchPriority="high"
                decoding="async"
              />
              {ASSEMBLY.map((part) => (
                <img
                  key={part.name}
                  className={`hero-robot-piece hero-robot-piece--${part.name}`}
                  src={getAssetUrl(ROBOT_IMAGE)}
                  alt=""
                  width="1122"
                  height="1402"
                  decoding="async"
                />
              ))}
            </div>
          </div>

          <div className="hero-copy hero-copy-intro">
            <p className="hero-kicker">{t.home.eyebrow}</p>
            <h1>{t.home.name}</h1>
            <p className="hero-description">{t.home.subtitle}</p>
          </div>

          <div className="hero-copy hero-copy-middle">
            <p className="hero-kicker">{t.home.scrollMiddleLabel}</p>
            <h2>{t.home.scrollMiddleTitle}</h2>
            <p className="hero-description">{t.home.scrollMiddleBody}</p>
          </div>

          <div className="hero-copy hero-copy-end">
            <p className="hero-kicker">{t.home.scrollEndLabel}</p>
            <h2>{t.home.scrollEndTitle}</h2>
            <p className="hero-description">{t.home.scrollEndBody}</p>
          </div>

          <div className="hero-scroll-cue" aria-hidden="true">
            <span>{t.home.scrollHint}</span>
            <span className="hero-scroll-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
