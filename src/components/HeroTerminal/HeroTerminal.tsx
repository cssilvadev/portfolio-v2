import { useEffect, useState } from "react";
import "./HeroTerminal.css";

type TerminalLine = {
  type: "command" | "output";
  text: string;
};

const LINES: TerminalLine[] = [
  { type: "command", text: "whoami" },
  { type: "output", text: "christian_silva — firmware & robotics engineer" },
  { type: "command", text: "system --status" },
  { type: "output", text: "[OK] stm32_firmware  [OK] can_bus_network  [OK] fullstack_web" },
  { type: "command", text: "uptime --engineering" },
  { type: "output", text: "shipping embedded systems since 2023" },
];

const TYPE_SPEED_MS = 18;
const LINE_PAUSE_MS = 260;

export default function HeroTerminal() {
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
  // Reduced-motion visitors start with every line already revealed instead
  // of playing the typewriter animation.
  const [lineIndex, setLineIndex] = useState(() => (reducedMotion ? LINES.length : 0));
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || lineIndex >= LINES.length) return;

    const currentLine = LINES[lineIndex];

    if (charIndex < currentLine.text.length) {
      const timer = setTimeout(() => setCharIndex((c) => c + 1), TYPE_SPEED_MS);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setLineIndex((l) => l + 1);
      setCharIndex(0);
    }, LINE_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [lineIndex, charIndex, reducedMotion]);

  const done = lineIndex >= LINES.length;
  const completedLines = LINES.slice(0, lineIndex);
  const typingLine = lineIndex < LINES.length ? LINES[lineIndex] : null;

  return (
    <div className="hero-terminal" aria-hidden="true">
      <div className="hero-terminal-bar">
        <span className="hero-terminal-dot dot-red" />
        <span className="hero-terminal-dot dot-yellow" />
        <span className="hero-terminal-dot dot-green" />
        <span className="hero-terminal-title">engineer@christiansilva:~</span>
      </div>
      <div className="hero-terminal-body">
        {completedLines.map((line, idx) => (
          <div key={idx} className={`terminal-line ${line.type}`}>
            {line.type === "command" ? <span className="terminal-prompt">$</span> : <span className="terminal-prompt">{">"}</span>}
            <span>{line.text}</span>
          </div>
        ))}
        {typingLine && (
          <div className={`terminal-line ${typingLine.type}`}>
            <span className="terminal-prompt">{typingLine.type === "command" ? "$" : ">"}</span>
            <span>{typingLine.text.slice(0, charIndex)}</span>
            <span className="terminal-cursor" />
          </div>
        )}
        {done && (
          <div className="terminal-line command">
            <span className="terminal-prompt">$</span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}
