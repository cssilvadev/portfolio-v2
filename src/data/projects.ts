import type { Language } from "../i18n/translations";

export type ProjectContent = {
  title: string;
  description: string;
  overview: string;
};

export type ProjectSpec = {
  key: string;
  value: string;
};

export type Project = {
  slug: string;
  date: string;
  image: string;
  stack: string[];
  specs: ProjectSpec[];
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
    specs: [
      { key: "mcu", value: "STM32F103C8T6" },
      { key: "control", value: "6-DOF PWM Servo Control" },
      { key: "interface", value: "C# WPF Desktop GUI" },
      { key: "comms", value: "USB Serial · 115200 baud" },
    ],
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
    specs: [
      { key: "mcu", value: "STM32F103" },
      { key: "interface", value: "USB HID · Custom Report Descriptor" },
      { key: "input", value: "3-axis ADC (Throttle/Brake/Clutch)" },
      { key: "latency", value: "<1ms USB polling" },
    ],
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
    specs: [
      { key: "mcu", value: "ESP32 (multi-node)" },
      { key: "network", value: "CAN Bus 2.0B" },
      { key: "dof", value: "12+ Servo Joints" },
      { key: "app", value: ".NET MAUI (cross-platform)" },
      { key: "telemetry", value: "Real-time gait diagnostics" },
    ],
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
    specs: [
      { key: "frontend", value: "React 19 + TypeScript" },
      { key: "render3d", value: "Spline / Three.js WebGL" },
      { key: "backend", value: "Supabase (Auth + Postgres)" },
      { key: "i18n", value: "EN / PT-BR / ES" },
    ],
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
    slug: "jarvis",
    date: "2026",
    image: "/projects/jarvis-standby-hud.png",
    stack: ["C#", ".NET MAUI", "Python", "MediaPipe", "WebGL", "Ollama"],
    specs: [
      { key: "app", value: ".NET MAUI (C#) · HTML/CSS/JS HUD in WebView2" },
      { key: "vision", value: "MediaPipe Hand Landmarker · holographic pinch cursor" },
      { key: "voice", value: "openWakeWord + claps · Silero VAD · faster-whisper · Kokoro TTS" },
      { key: "llm", value: "Ollama · Qwen 3.5 4B, deterministic commands first" },
      { key: "render3d", value: "Hand-written WebGL · offline STL viewer" },
      { key: "comms", value: "HTTP + WebSocket over localhost" },
    ],
    en: {
      title: "Jarvis",
      description: "Iron Man-style desktop AI assistant with real-time hand tracking, voice control, and a fully local LLM.",
      overview:
        "A desktop AI assistant inspired by Iron Man's HUD. The shell is a .NET MAUI (C#) Windows app rendering an HTML/CSS/JS interface — arc-reactor visuals, panels, and a hand-written WebGL 3D viewer with its own STL parser and shaders — inside an embedded WebView2, no front-end framework involved. A separate Python service handles hand tracking with MediaPipe's Hand Landmarker, turning the index finger into a holographic cursor and a thumb-to-index pinch into a drag gesture for the HUD panels themselves — only landmark coordinates cross into the app, never a camera frame. Say \"open a STL\" and the same hand-written WebGL viewer loads and explodes a 3D model into labeled, dimensioned parts, fully offline. Voice runs entirely on-device: openWakeWord (or two claps) triggers listening, Silero VAD confirms real speech, faster-whisper (large-v3-turbo) transcribes it locally, and Kokoro speaks the reply — it replaced an earlier Chatterbox voice-cloning engine that took up to 70 seconds per phrase. Every command hits a deterministic, whitelisted resolver before anything reaches an LLM; only genuinely open-ended questions go to Ollama running Qwen 3.5 4B locally. The C# app and Python services talk over HTTP and WebSocket, all on localhost — nothing leaves the machine except a couple of optional non-AI integrations (Spotify, stock quotes via BRAPI).",
    },
    pt: {
      title: "Jarvis",
      description: "Assistente de IA para desktop no estilo Homem de Ferro, com rastreamento de mão em tempo real, controle por voz e LLM 100% local.",
      overview:
        "Um assistente de IA para desktop inspirado no HUD do Homem de Ferro. A casca é um app Windows em .NET MAUI (C#) que renderiza uma interface em HTML/CSS/JS — reator, painéis e um visualizador 3D em WebGL escrito à mão, com parser de STL e shaders próprios — dentro de um WebView2 embutido, sem framework de front-end. Um serviço Python separado cuida do rastreamento de mão com o Hand Landmarker do MediaPipe, transformando o dedo indicador em cursor holográfico e a pinça entre polegar e indicador em gesto de arrastar os próprios painéis do HUD — só as coordenadas dos pontos cruzam pro app, nunca um frame da câmera. Dizer \"abra um STL\" abre esse mesmo visualizador WebGL escrito à mão pra explodir um modelo 3D em peças nomeadas e dimensionadas, totalmente offline. O áudio roda 100% local: openWakeWord (ou duas palmas) dispara a escuta, Silero VAD confirma fala de verdade, faster-whisper (large-v3-turbo) transcreve localmente, e o Kokoro responde por voz — ele substituiu um motor anterior de clonagem de voz, o Chatterbox, que chegava a levar 70 segundos por frase. Todo comando passa por um resolvedor determinístico e com lista de permissões antes de qualquer coisa chegar a um LLM; só perguntas genuinamente abertas vão pro Ollama rodando Qwen 3.5 4B localmente. O app em C# e os serviços Python conversam por HTTP e WebSocket, tudo em localhost — nada sai da máquina, exceto integrações opcionais sem IA (Spotify, cotação de ações via BRAPI).",
    },
    es: {
      title: "Jarvis",
      description: "Asistente de IA de escritorio al estilo Iron Man, con seguimiento de manos en tiempo real, control por voz y LLM 100% local.",
      overview:
        "Un asistente de IA de escritorio inspirado en el HUD de Iron Man. La capa base es una app de Windows en .NET MAUI (C#) que renderiza una interfaz en HTML/CSS/JS —reactor, paneles y un visor 3D en WebGL escrito a mano, con parser de STL y shaders propios— dentro de un WebView2 embebido, sin framework de frontend. Un servicio Python aparte se encarga del seguimiento de manos con el Hand Landmarker de MediaPipe, convirtiendo el dedo índice en un cursor holográfico y la pinza entre pulgar e índice en un gesto para arrastrar los propios paneles del HUD — solo las coordenadas de los puntos cruzan hacia la app, nunca un fotograma de la cámara. Decir \"abre un STL\" abre ese mismo visor WebGL escrito a mano para explosionar un modelo 3D en piezas nombradas y con sus dimensiones, totalmente offline. El audio corre 100% local: openWakeWord (o dos palmadas) dispara la escucha, Silero VAD confirma habla real, faster-whisper (large-v3-turbo) transcribe localmente, y Kokoro responde por voz — reemplazó a un motor anterior de clonación de voz, Chatterbox, que llegaba a tardar 70 segundos por frase. Cada comando pasa por un resolvedor determinístico con lista de permisos antes de que algo llegue a un LLM; solo las preguntas genuinamente abiertas van a Ollama ejecutando Qwen 3.5 4B localmente. La app en C# y los servicios en Python se comunican por HTTP y WebSocket, todo en localhost — nada sale de la máquina, salvo un par de integraciones opcionales sin IA (Spotify, cotización de acciones vía BRAPI).",
    },
  },
  {
    slug: "quadruped-robot",
    date: "2026",
    image: "/projects/seatbelt.svg",
    stack: ["STM32", "C", "PWM", "FreeRTOS"],
    specs: [
      { key: "mcu", value: "STM32G4" },
      { key: "control", value: "3-DOF Inverse Kinematics" },
      { key: "rtos", value: "FreeRTOS periodic tasks" },
      { key: "dof", value: "12 (4 legs × 3 joints)" },
      { key: "gait", value: "Trot Pattern Generator" },
    ],
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
    specs: project.specs,
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
