import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FaMicrochip, FaCube } from "react-icons/fa";
import type { Application } from "@splinetool/runtime";
import RobotTelemetry from "./RobotTelemetry";
import "./Robot.css";

const Spline = lazy(() => import("@splinetool/react-spline"));

// Heuristic for devices likely to struggle with a full WebGL scene: few CPU
// cores, low RAM, or the user has asked the OS for reduced motion. These
// visitors get a static preview with an opt-in button instead of the 3D
// model loading automatically.
function isLikelyLowPowerDevice(): boolean {
  if (typeof window === "undefined") return false;

  const prefersReducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return true;

  const cores = navigator.hardwareConcurrency;
  if (typeof cores === "number" && cores <= 4) return true;

  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memory === "number" && memory <= 4) return true;

  return false;
}

export default function Robot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  const [inView, setInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [userWantsScene, setUserWantsScene] = useState(false);
  const [lowPowerDevice] = useState(isLikelyLowPowerDevice);

  const wantsScene = !lowPowerDevice || userWantsScene;

  // 1. Intersection Observer: only mount near the viewport, and pause/resume
  // the running scene as it scrolls in and out afterwards (with a margin so
  // it doesn't thrash right at the edge).
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "200px 0px" }
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // 2. Defer WebGL initialization 300ms so React DOM & fonts paint first without lag
  useEffect(() => {
    if (!inView || !wantsScene || shouldLoad) return;

    const timer = setTimeout(() => setShouldLoad(true), 300);
    return () => clearTimeout(timer);
  }, [inView, wantsScene, shouldLoad]);

  // 3. Once loaded, stop/play the Spline render loop as it leaves and
  // re-enters the viewport instead of unmounting it. Unmounting would dispose
  // the whole WASM/WebGL context and force a full network reload + shader
  // recompile every time the user scrolls past it, which is what was causing
  // the stutter on lower-end machines.
  useEffect(() => {
    if (!isSceneReady || !appRef.current) return;
    if (inView) appRef.current.play();
    else appRef.current.stop();
  }, [inView, isSceneReady]);

  // 4. Also pause while the browser tab itself isn't visible.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!appRef.current) return;
      if (document.hidden) appRef.current.stop();
      else if (inView) appRef.current.play();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [inView]);

  const handleSplineLoad = (app: Application) => {
    appRef.current = app;
    setIsSceneReady(true);
  };

  const showScene = shouldLoad && wantsScene;
  const showOptIn = lowPowerDevice && !userWantsScene && !isSceneReady;

  // Spline's free-tier "Built with Spline" badge isn't always a plain child
  // of our container — it can be appended straight to <body> with its own
  // inline styles, which plain CSS can't reliably override. Actively remove
  // it (and anything else it re-injects) instead of just trying to hide it.
  useEffect(() => {
    if (!showScene) return;

    const removeWatermark = () => {
      document.querySelectorAll('a[href*="spline.design"]').forEach((el) => el.remove());
    };

    removeWatermark();
    const observer = new MutationObserver(removeWatermark);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [showScene]);

  return (
    <div ref={containerRef} className="robot-wrapper">
      {/* SKELETON TECH LOADER / LOW-POWER OPT-IN */}
      {(!showScene || !isSceneReady) && (
        <div className={`robot-skeleton ${showOptIn ? "interactive" : ""}`}>
          <div className="skeleton-glow-circle"></div>
          {showOptIn ? (
            <button
              type="button"
              className="skeleton-badge skeleton-action"
              onClick={() => setUserWantsScene(true)}
            >
              <FaCube className="spin-icon" />
              <span>Load interactive 3D model</span>
            </button>
          ) : (
            <div className="skeleton-badge">
              <FaMicrochip className="spin-icon" />
              <span>Loading 3D Robot...</span>
            </div>
          )}
        </div>
      )}

      <RobotTelemetry animate={!lowPowerDevice} />

      {/* REAL 3D SPLINE MODEL */}
      {showScene && (
        <Suspense fallback={null}>
          <div className={`spline-container ${isSceneReady ? "loaded" : "hidden"}`}>
            <Spline
              scene="https://prod.spline.design/9EqSRfq6MrauJORq/scene.splinecode"
              onLoad={handleSplineLoad}
            />
          </div>
          {/* Physical fallback: blocks the watermark's corner even if it's
              rendered somewhere CSS/JS removal can't reach (e.g. baked into
              the WebGL canvas itself instead of a removable DOM node). Kept
              as a sibling, not a child, of spline-container so it isn't
              caught by the ".spline-container > div" positioning rule. */}
          {isSceneReady && <div className="spline-watermark-cover" />}
        </Suspense>
      )}
    </div>
  );
}
