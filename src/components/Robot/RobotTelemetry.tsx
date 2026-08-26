import { useEffect, useState } from "react";
import "./RobotTelemetry.css";

type TelemetryState = {
  angle: number;
  rpm: number;
  temp: number;
  power: number;
};

const BASELINE: TelemetryState = { angle: 12.4, rpm: 1340, temp: 38.2, power: 4.6 };

function jitter(value: number, spread: number) {
  return value + (Math.random() - 0.5) * spread;
}

function nextReading(prev: TelemetryState): TelemetryState {
  return {
    angle: jitter(BASELINE.angle, 30),
    rpm: Math.round(jitter(BASELINE.rpm, 220)),
    temp: jitter(prev.temp + (BASELINE.temp - prev.temp) * 0.2, 0.6),
    power: jitter(BASELINE.power, 1.4),
  };
}

export default function RobotTelemetry({ animate }: { animate: boolean }) {
  const [reading, setReading] = useState<TelemetryState>(BASELINE);

  useEffect(() => {
    if (!animate) return;

    const interval = setInterval(() => {
      if (document.hidden) return;
      setReading((prev) => nextReading(prev));
    }, 700);
    return () => clearInterval(interval);
  }, [animate]);

  return (
    <div className="robot-telemetry" aria-hidden="true">
      <div className="telemetry-header">
        <span className="telemetry-dot" />
        <span>CAN BUS · OK</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">JOINT.02 ANGLE</span>
        <span className="telemetry-value">{reading.angle.toFixed(1)}°</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">ROTOR RPM</span>
        <span className="telemetry-value">{Math.max(0, reading.rpm)}</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">TEMP</span>
        <span className="telemetry-value">{reading.temp.toFixed(1)}°C</span>
      </div>
      <div className="telemetry-row">
        <span className="telemetry-label">PWR DRAW</span>
        <span className="telemetry-value">{Math.max(0, reading.power).toFixed(1)}W</span>
      </div>
    </div>
  );
}
