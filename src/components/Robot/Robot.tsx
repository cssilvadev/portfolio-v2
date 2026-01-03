import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./Robot.css";

const Spline = lazy(() => import("@splinetool/react-spline"));

export default function Robot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="robot-wrapper">
      {visible && (
        <Suspense fallback={null}>
          <Spline scene="https://prod.spline.design/9EqSRfq6MrauJORq/scene.splinecode" />
          
        </Suspense>
      )}
    </div>
  );
}
