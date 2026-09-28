import { useId, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { editorial, text } from "../../data/editorial";
import { pedalResponse } from "../../utils/pedal";
import "./PedalLab.css";

const copy = {
  input: text("Pedal travel", "Curso do pedal", "Recorrido del pedal"),
  inputAxis: text("INPUT", "ENTRADA", "ENTRADA"),
  outputAxis: text("OUTPUT", "SAÍDA", "SALIDA"),
  response: text("RESPONSE", "RESPOSTA", "RESPUESTA"),
  deadzone: text("Deadzone", "Zona morta", "Zona muerta"),
  curve: text("Response exponent", "Expoente da curva", "Exponente de curva"),
  output: text("HID axis · normalized output", "Eixo HID · saída normalizada", "Eje HID · salida normalizada"),
  reset: text("Reset", "Restaurar", "Restaurar"),
  hint: text("Move the input slider. Then change the deadzone and exponent to see what reaches the game. The chart updates only when you interact; it does not poll sensors or run a background animation.", "Mova o curso do pedal. Depois ajuste a zona morta e o expoente para ver o que chega ao jogo. O gráfico só atualiza quando você interage; não lê sensores nem roda animação em segundo plano.", "Mueve el recorrido del pedal. Ajusta la zona muerta y el exponente para ver lo que llega al juego. El gráfico solo cambia al interactuar; no lee sensores ni anima en segundo plano."),
};

export default function PedalLab() {
  const { language } = useLanguage();
  const id = useId();
  const [input, setInput] = useState(50);
  const [deadzone, setDeadzone] = useState(8);
  const [gamma, setGamma] = useState(1.5);
  const response = pedalResponse(input / 100, deadzone / 100, gamma);
  const points = Array.from({ length: 101 }, (_, x) => `${40 + x * 3.4},${300 - pedalResponse(x / 100, deadzone / 100, gamma) * 250}`).join(" ");
  const sliders = [
    { label: copy.input[language], value: input, min: 0, max: 100, step: 1, unit: "%", change: setInput },
    { label: copy.deadzone[language], value: deadzone, min: 0, max: 30, step: 1, unit: "%", change: setDeadzone },
    { label: copy.curve[language], value: gamma, min: .5, max: 3, step: .1, unit: "×", change: setGamma },
  ];
  return <div className="pedal-lab">
    <div className="pedal-visual">
      <p className="story-eyebrow">{copy.inputAxis[language]} → {copy.response[language]}</p>
      <svg viewBox="0 0 420 350" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
        <title id={`${id}-chart-title`}>{copy.output[language]}</title>
        <desc id={`${id}-chart-desc`}>{`${copy.input[language]} ${input}%; ${copy.deadzone[language]} ${deadzone}%; ${copy.curve[language]} ${gamma}; ${Math.round(response * 100)}%`}</desc>
        {[0, 1, 2, 3, 4].map(n => <g key={n} className="pedal-grid"><line x1="40" x2="380" y1={50 + n * 62.5} y2={50 + n * 62.5} /><line x1={40 + n * 85} x2={40 + n * 85} y1="50" y2="300" /></g>)}
        <line className="pedal-linear" x1="40" y1="300" x2="380" y2="50" />
        <polyline className="pedal-curve" points={points} />
        <line className="pedal-crosshair" x1={40 + input * 3.4} x2={40 + input * 3.4} y1="300" y2={300 - response * 250} />
        <circle className="pedal-point" cx={40 + input * 3.4} cy={300 - response * 250} r="7" />
        <text x="40" y="330">0%</text><text x="340" y="330">100%</text><text x="40" y="32">{copy.outputAxis[language]}</text><text x="280" y="347">{copy.inputAxis[language]}</text>
      </svg>
      <p className="pedal-disclaimer">{editorial.simulation[language]}</p>
    </div>
    <div className="pedal-controls">
      <div className="pedal-readout"><span>{copy.output[language]}</span><output>{Math.round(response * 100)}<small>%</small></output></div>
      {sliders.map((slider, index) => <div className="pedal-control" key={slider.label}>
        <label htmlFor={`${id}-${index}`}>{slider.label}<span>{slider.value}{slider.unit}</span></label>
        <input id={`${id}-${index}`} type="range" min={slider.min} max={slider.max} step={slider.step} value={slider.value} onChange={e => slider.change(Number(e.target.value))} />
      </div>)}
      <p className="pedal-hint">{copy.hint[language]}</p>
      <button className="editorial-button" type="button" onClick={() => { setInput(50); setDeadzone(8); setGamma(1.5); }}>{copy.reset[language]} ↺</button>
      <code className="pedal-formula">output = max(0, (input − deadzone) / (1 − deadzone)) ^ γ</code>
    </div>
  </div>;
}
