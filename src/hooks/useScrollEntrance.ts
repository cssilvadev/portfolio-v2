import { useEffect, type RefObject } from "react";

/** Scroll-driven entrances on untransformed anchors; CSS animates their children. */
export function useScrollEntrance(rootRef: RefObject<HTMLElement | null>, contentKey = "") {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const targets = [...root.querySelectorAll<HTMLElement>("[data-scroll-enter]")];
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};

    const configure = () => {
      dispose();
      if (motionPreference.matches) return;
      let frame = 0;
      const active = new Set<HTMLElement>();
      const previous = new Map<HTMLElement, number>();
      const update = (elements: Iterable<HTMLElement>) => {
        // Batch layout reads before writes. Offscreen sections don't animate.
        const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
        const measurements = [...elements].map((element) => {
          const bounds = element.getBoundingClientRect();
          const fullyVisible = bounds.top >= 0 && bounds.bottom <= window.innerHeight;
          const raw = fullyVisible || (atPageEnd && bounds.top < window.innerHeight) ? 1 : Math.max(0, Math.min(1,
            (window.innerHeight - bounds.top) / (window.innerHeight * 0.7),
          ));
          return { element, progress: Number((raw * raw * (3 - 2 * raw)).toFixed(4)) };
        });
        for (const { element, progress } of measurements) {
          if (previous.get(element) === progress) continue;
          previous.set(element, progress);
          element.style.setProperty("--enter", String(progress));
        }
      };
      const schedule = () => {
        if (!frame && active.size) frame = requestAnimationFrame(() => {
          frame = 0;
          update(active);
        });
      };
      const onResize = () => update(targets);
      update(targets);
      targets.forEach((element) => element.setAttribute("data-scroll-ready", ""));
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(element);
          else active.delete(element);
          // Handle anchors jumped past by navigation or fast scrolling, too.
          update([element]);
        }
      }, { rootMargin: "10% 0px 10% 0px" });
      targets.forEach((element) => observer.observe(element));
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", onResize);
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", onResize);
        targets.forEach((element) => {
          element.removeAttribute("data-scroll-ready");
          element.style.removeProperty("--enter");
        });
      };
    };
    configure();
    motionPreference.addEventListener("change", configure);
    return () => {
      motionPreference.removeEventListener("change", configure);
      dispose();
    };
  }, [rootRef, contentKey]);
}
