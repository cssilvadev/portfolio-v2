export type Project = {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  stack: string[];
};

export const projects: Project[] = [
  {
    slug: "arm-robot",
    title: "Arm Robot",
    description: "Firmware and desktop interface for a Arm Robot.",
    date: "2024",
    image: "/projects/haptic-chair.png",
    stack: ["STM32", "C", "C#", "WPF", "PWM"],
  },
  {
    slug: "g27-pedal-adapter",
    title: "G27 Pedal Adapter",
    description: "Custom USB HID Pedal Adapter.",
    date: "2023",
    image: "/projects/steering-wheel.png",
    stack: ["STM32", "C", "USB HID"],
  },
  {
    slug: "humanoid-robot",
    title: "Humanoid Robot",
    description: "Humanoid robot with ESP32 using MAUI to control via Android Phone.",
    date: "2026",
    image: "/projects/humanoid-robot.png",
    stack: ["CAN", "C#", ".NET"],
  },
  {
    slug: "interactive-portfolio",
    title: "Interactive Portfolio",
    description: "Personal portfolio with interactive visuals.",
    date: "2025",
    image: "/projects/portfolio.png",
    stack: ["React", "TypeScript", "CSS"],
  },
  {
    slug: "quadruped-robot",
    title: "Quadruped Robot",
    description: "Quadruped robot with ESP32 using MAUI to control via Android Phone.",
    date: "2026",
    image: "/projects/seatbelt.png",
    stack: ["STM32", "C", "PWM"],
  },
];
