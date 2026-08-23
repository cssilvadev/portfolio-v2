import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { FaMicrochip } from "react-icons/fa";
import "./Robot.css";

const Spline = lazy(() => import("@splinetool/react-spline"));

export default function Robot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);

  // 1. Intersection Observer: Only load / render when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 2. Defer WebGL initialization 300ms so React DOM & fonts paint first without lag
  useEffect(() => {
    if (!inView) return;

    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [inView]);

  const handleSplineLoad = () => {
    setIsSceneReady(true);
  };

  return (
    <div ref={containerRef} className="robot-wrapper">
      {/* SKELETON TECH LOADER DURING SHADER COMPILATION */}
      {(!shouldLoad || !isSceneReady) && (
        <div className="robot-skeleton">
          <div className="skeleton-glow-circle"></div>
          <div className="skeleton-badge">
            <FaMicrochip className="spin-icon" />
            <span>Loading 3D Robot...</span>
          </div>
        </div>
      )}

      {/* REAL 3D SPLINE MODEL */}
      {inView && shouldLoad && (
        <Suspense fallback={null}>
          <div className={`spline-container ${isSceneReady ? "loaded" : "hidden"}`}>
            <Spline
              scene="https://prod.spline.design/9EqSRfq6MrauJORq/scene.splinecode"
              onLoad={handleSplineLoad}
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
