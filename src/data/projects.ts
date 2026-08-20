import type { Language } from "../i18n/translations";

export type ProjectContent = {
  title: string;
  description: string;
  overview: string;
};

export type Project = {
  slug: string;
  date: string;
  image: string;
  stack: string[];
  en: ProjectContent;
  pt: ProjectContent;
  es: ProjectContent;
};

export const projects: Project[] = [
  {
    slug: "arm-robot",
    date: "2024",
    image: "/projects/haptic-chair.svg",
    stack: ["STM32", "C", "C#", "WPF", "PWM"],
    en: {
      title: "Arm Robot",
      description: "Firmware and desktop interface for an articulated Robotic Arm.",
      overview:
        "High-precision robotic arm controller powered by an STM32 MCU. Features multi-axis servo PWM generation, kinematic coordinate transformation, and a responsive C# WPF desktop GUI for real-time manual control and automated trajectory recording.",
    },
    pt: {
      title: "Braço Robótico",
      description: "Firmware e interface desktop para controle de Braço Robótico.",
      overview:
        "Controlador de braço robótico de alta precisão com microcontrolador STM32. Inclui geração de PWM para múltiplos servos, transformação cinemática de coordenadas e uma interface desktop em C# WPF para controle manual e gravação de trajetórias.",
    },
    es: {
      title: "Brazo Robótico",
      description: "Firmware e interfaz de escritorio para Brazo Robótico articulado.",
      overview:
        "Controlador de brazo robótico de alta precisión impulsado por STM32. Cuenta con generación PWM multieje, transformación cinemática de coordenadas y una interfaz de escritorio en C# WPF para control manual y grabación de trayectorias.",
    },
  },
  {
    slug: "g27-pedal-adapter",
    date: "2023",
    image: "/projects/steering-wheel.svg",
    stack: ["STM32", "C", "USB HID"],
    en: {
      title: "G27 Pedal Adapter",
      description: "Custom USB HID Pedal Adapter for Logitech hardware.",
      overview:
        "Custom embedded USB HID adapter enabling standalone use of Logitech G27 racing pedals via USB on PC. Implements hardware ADC calibration, deadzone management, and zero-latency USB HID reporting on STM32.",
    },
    pt: {
      title: "Adaptador Pedais G27",
      description: "Adaptador USB HID personalizado para pedais Logitech G27.",
      overview:
        "Adaptador USB HID embarcado que permite usar os pedais de corrida Logitech G27 diretamente no PC via USB. Implementa calibração de ADC em hardware, gerenciamento de zona morta e envio USB HID de latência zero no STM32.",
    },
    es: {
      title: "Adaptador Pedales G27",
      description: "Adaptador USB HID personalizado para pedales Logitech G27.",
      overview:
        "Adaptador USB HID integrado que permite el uso independiente de pedales Logitech G27 en PC vía USB. Implementa calibración ADC por hardware, gestión de zonas muertas y reporte USB HID con latencia cero en STM32.",
    },
  },
  {
    slug: "humanoid-robot",
    date: "2026",
    image: "/projects/humanoid-robot.svg",
    stack: ["CAN", "C#", ".NET", "ESP32", "MAUI"],
    en: {
      title: "Humanoid Robot",
      description: "Bipedal humanoid robot with ESP32 controlled via .NET MAUI mobile app.",
      overview:
        "A bipedal humanoid robotics platform. Features ESP32 microcontroller nodes communicating over a high-speed CAN bus network, orchestrated by a cross-platform .NET MAUI mobile interface with telemetry diagnostics and gait tuning.",
    },
    pt: {
      title: "Robô Humanóide",
      description: "Robô humanóide bípede com ESP32 e aplicativo .NET MAUI.",
      overview:
        "Plataforma robótica humanóide bípede. Possui nós de microcontroladores ESP32 comunicando-se em rede CAN de alta velocidade, orquestrados por aplicativo móvel .NET MAUI com diagnóstico de telemetria e calibração de marcha.",
    },
    es: {
      title: "Robot Humanoide",
      description: "Robot humanoide bípedo con ESP32 y aplicación móvil .NET MAUI.",
      overview:
        "Plataforma de robótica humanoide bípeda. Incorpora nodos ESP32 comunicados mediante red CAN bus de alta velocidad, orquestados por una aplicación móvil .NET MAUI con telemetría en tiempo real y ajuste de marcha.",
    },
  },
  {
    slug: "interactive-portfolio",
    date: "2025",
    image: "/projects/portfolio.svg",
    stack: ["React", "TypeScript", "Three.js", "CSS"],
    en: {
      title: "Interactive Portfolio",
      description: "Personal portfolio with interactive 3D visuals and technical notes hub.",
      overview:
        "Modern developer portfolio built with React 19, TypeScript, and Three.js / Spline 3D interactivity. Includes an engineering notes reader, markdown rendering engine, multi-language internationalization, and an in-app creation studio.",
    },
    pt: {
      title: "Portfólio Interativo",
      description: "Portfólio pessoal com 3D interativo e hub de notas técnicas.",
      overview:
        "Portfólio moderno desenvolvido com React 19, TypeScript e elementos 3D em Three.js / Spline. Inclui leitor de notas de engenharia, motor de renderização markdown, internacionalização multilíngue e estúdio de criação integrado.",
    },
    es: {
      title: "Portafolio Interactivo",
      description: "Portafolio personal con 3D interactivo y centro de notas técnicas.",
      overview:
        "Portafolio moderno desarrollado con React 19, TypeScript e interactividad 3D con Three.js / Spline. Incluye lector de notas técnicas, motor markdown, internacionalización multilingüe y estudio de creación integrado.",
    },
  },
  {
    slug: "quadruped-robot",
    date: "2026",
    image: "/projects/seatbelt.svg",
    stack: ["STM32", "C", "PWM", "FreeRTOS"],
    en: {
      title: "Quadruped Robot",
      description: "Quadruped robotic platform with 3-DOF leg Inverse Kinematics solver.",
      overview:
        "Four-legged quadruped robot implementing real-time 3-DOF inverse kinematics (IK) on an STM32 MCU. Features FreeRTOS periodic tasks for smooth trot gait execution, terrain stabilization, and low-latency motor control.",
    },
    pt: {
      title: "Robô Quadrúpede",
      description: "Plataforma de robô quadrúpede com solver de Cinemática Inversa 3-DOF.",
      overview:
        "Robô quadrúpede de quatro patas com cinemática inversa (IK) de 3-DOF em tempo real no STM32. Possui tarefas periódicas no FreeRTOS para execução suave de marcha trotante, estabilização de terreno e controle de motores de baixa latência.",
    },
    es: {
      title: "Robot Cuadrúpedo",
      description: "Robot cuadrúpedo con solucionador de Cinemática Inversa 3-DOF.",
      overview:
        "Robot cuadrúpedo de cuatro patas con cinemática inversa (IK) 3-DOF en tiempo real sobre STM32. Cuenta con tareas periódicas FreeRTOS para ejecución suave del trote, estabilización de terreno y control de motores de baja latencia.",
    },
  },
];

export function getLocalizedProject(project: Project, lang: Language) {
  const content = project[lang] || project.en;
  return {
    slug: project.slug,
    date: project.date,
    image: project.image,
    stack: project.stack,
    title: content.title,
    description: content.description,
    overview: content.overview,
  };
}

export function getProjectBySlug(slug: string, lang: Language = "en") {
  const normalized = slug.toLowerCase().replace(/\.html$/, "");
  const found = projects.find((p) => p.slug.toLowerCase() === normalized);
  if (!found) return undefined;
  return getLocalizedProject(found, lang);
}

export function getAllLocalizedProjects(lang: Language = "en") {
  return projects.map((p) => getLocalizedProject(p, lang));
}
