import "./TechSlider.css";

import {
  SiC,
  SiCplusplus,
  SiReact,
  SiTypescript,
  SiNodedotjs,
} from "react-icons/si";
import { TbBrandCSharp } from "react-icons/tb";
import { FaMicrochip } from "react-icons/fa";

import "./TechSlider.css";

const techStack = [
  SiC,
  SiCplusplus,
  TbBrandCSharp,
  FaMicrochip, // STM32 / Embedded
  SiReact,
  SiTypescript,
  SiNodedotjs,
];

export default function TechSlider() {
  return (
    <div className="tech-slider">
      <div className="track">
        {[...techStack, ...techStack].map((Icon, index) => (
          <span className="tech-icon" key={index}>
            <Icon />
          </span>
        ))}
      </div>
    </div>
  );
}
