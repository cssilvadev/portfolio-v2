import type { Language } from "../i18n/translations";

export type LocalText = Record<Language, string>;
export const text = (en: string, pt: string, es: string): LocalText => ({ en, pt, es });
export const editorial = {
  positioning: text("I build software and systems that connect the digital to the physical.", "Construo software e sistemas que conectam o digital ao mundo físico.", "Construyo software y sistemas que conectan lo digital con el mundo físico."),
  problem: text("The problem", "O problema", "El problema"),
  architecture: text("Inside the system", "Por dentro do sistema", "Dentro del sistema"),
  decisions: text("Decisions, not just features.", "Decisões, não só funcionalidades.", "Decisiones, no solo funciones."),
  evidence: text("See the actual build", "Veja o projeto real", "El proyecto real"),
  limits: text("What works. What comes next.", "O que funciona. O que vem depois.", "Qué funciona. Qué viene después."),
  related: text("Continue the investigation", "Continue a investigação", "Continúa la investigación"),
  relatedProjects: text("Projects behind this note", "Projetos por trás desta nota", "Proyectos detrás de esta nota"),
  toc: text("On this page", "Nesta página", "En esta página"),
  profile: text("Profile & résumé", "Perfil e currículo", "Perfil y currículum"),
  print: text("Print / save as PDF", "Imprimir / salvar como PDF", "Imprimir / guardar como PDF"),
  search: text("Search notes, topics, tags…", "Buscar notas, temas, tags…", "Buscar notas, temas, etiquetas…"),
  noResults: text("No notes match these filters.", "Nenhuma nota corresponde a estes filtros.", "Ninguna nota coincide con estos filtros."),
  clearFilters: text("Clear filters", "Limpar filtros", "Restablecer filtros"),
  browseNotes: text("Explore all notes", "Explorar todas as notas", "Explorar todas las notas"),
  allFormats: text("All formats", "Todos os formatos", "Todos los formatos"),
  article: text("Article", "Artigo", "Artículo"),
  "build-log": text("Build log", "Diário de desenvolvimento", "Diario de desarrollo"),
  "bench-note": text("Bench note", "Nota de bancada", "Nota de laboratorio"),
  lab: text("Interactive lab", "Laboratório interativo", "Laboratorio interactivo"),
  start: text("Open experiment", "Abrir experimento", "Abrir experimento"),
  simulation: text("Educational simulation · no hardware connected", "Simulação educativa · nenhum hardware conectado", "Simulación educativa · sin hardware conectado"),
  scope: text("Technical overview", "Visão técnica", "Visión técnica"),
  prototype: text("Documented prototype", "Protótipo documentado", "Prototipo documentado"),
  live: text("Live website", "Site publicado", "Sitio publicado"),
  validation: text("This page documents the proposed architecture. Bench measurements, hardware photos and completion status have not yet been published; specifications are not performance guarantees.", "Esta página documenta a arquitetura proposta. Medições de bancada, fotos do hardware e status de conclusão ainda não foram publicados; especificações não são garantias de desempenho.", "Esta página documenta la arquitectura propuesta. Aún no se publicaron mediciones, fotos del hardware ni estado de finalización; las especificaciones no garantizan rendimiento."),
};

export type NoteFormat = "article" | "build-log" | "bench-note";
export const noteConnections: Record<string, { format: NoteFormat; projects: string[] }> = {
  "jarvis-local-ai-hud": { format: "article", projects: ["jarvis"] },
  "stm32-can-bus-architecture": { format: "article", projects: ["humanoid-robot"] },
  "quadruped-inverse-kinematics": { format: "article", projects: ["quadruped-robot"] },
  "human-in-the-loop-ai-workflows": { format: "article", projects: ["jarvis", "interactive-portfolio"] },
  "portfolio-scroll-build-log": { format: "build-log", projects: ["interactive-portfolio"] },
  "pedal-response-bench-note": { format: "bench-note", projects: ["g27-pedal-adapter"] },
};

/** Reserved CMS tags keep editorial metadata compatible with the existing DB. */
export function getNoteConnection(slug: string, tags: string[] = []) {
  const fallback = noteConnections[slug] ?? { format: "article" as NoteFormat, projects: [] };
  const format = tags.find(tag => /^format:(article|build-log|bench-note)$/.test(tag))?.slice(7) as NoteFormat | undefined;
  const projects = tags.filter(tag => /^project:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)).map(tag => tag.slice(8));
  return { format: format ?? fallback.format, projects: tags.includes("project:none") ? [] : projects.length ? [...new Set(projects)] : fallback.projects };
}

type Chapter = { title: LocalText; body: LocalText };
export type ProjectStory = {
  problem: LocalText;
  flow: string[];
  chapters?: Chapter[];
  limits?: LocalText;
  gallery?: { image: string; width: number; height: number; caption: LocalText }[];
};

export const projectStories: Record<string, ProjectStory> = {
  jarvis: {
    problem: text("Make a desktop assistant useful without sending voice and vision to a cloud model. The challenge is not the HUD: it is predictable actions, responsive speech and clear boundaries between local inference and optional online tools.", "Tornar um assistente de desktop útil sem enviar voz e visão a um modelo na nuvem. O desafio não é o HUD: são ações previsíveis, voz responsiva e limites claros entre inferência local e ferramentas online opcionais.", "Crear un asistente útil sin enviar voz y visión a un modelo en la nube. El reto no es el HUD: son acciones predecibles, voz ágil y límites claros entre inferencia local y herramientas online opcionales."),
    flow: ["openWakeWord / Silero VAD", "faster-whisper", "C# · command resolver", "Ollama / allowed action", "Kokoro · HUD"],
    chapters: [
      { title: text("Commands before conversation", "Comandos antes da conversa", "Comandos antes de conversar"), body: text("Known commands go through a deterministic C# resolver. Open questions go to Ollama. Model output is not unrestricted permission to execute Windows commands.", "Comandos conhecidos passam por um resolvedor determinístico em C#. Perguntas abertas vão para o Ollama. A saída do modelo não é uma permissão irrestrita para executar comandos no Windows.", "Los comandos conocidos pasan por un resolvedor determinista en C#. Las preguntas abiertas van a Ollama. La salida del modelo no autoriza comandos arbitrarios en Windows.") },
      { title: text("Responsiveness over voice cloning", "Responsividade antes da clonagem de voz", "Agilidad antes de clonar la voz"), body: text("The build log describes replacing Chatterbox with Kokoro behind the same speech interface, and streaming complete sentences before the entire response is ready. These are engineering trade-offs, not universal latency benchmarks.", "O artigo descreve a troca do Chatterbox pelo Kokoro mantendo a mesma interface de voz e o streaming de frases completas antes de terminar a resposta. São decisões de engenharia, não benchmarks universais de latência.", "El artículo documenta el cambio de Chatterbox a Kokoro manteniendo la interfaz de voz y transmitiendo frases completas antes de terminar la respuesta. Son decisiones de ingeniería, no benchmarks universales.") },
      { title: text("Landmarks, not camera frames", "Coordenadas, não frames da câmera", "Coordenadas, no imágenes de cámara"), body: text("MediaPipe runs in a separate Python service. Landmark coordinates and gesture state drive the HUD; stale frames are discarded instead of building a delayed queue. The STL viewer remains local.", "O MediaPipe roda em um serviço Python separado. Coordenadas e gestos controlam o HUD; frames antigos são descartados em vez de acumular uma fila atrasada. O visualizador STL permanece local.", "MediaPipe funciona en un servicio Python separado. Las coordenadas y los gestos controlan el HUD; los frames antiguos se descartan para evitar retrasos. El visor STL permanece local.") },
    ],
    limits: text("The screenshots and engineering article document a working desktop prototype. AI inference runs locally; Spotify, market data and news require the network when requested. Timings in the article describe that development machine, not a reproducible cross-device benchmark. Next: publish a versioned demo, test procedure and representative hardware measurements.", "As capturas e o artigo documentam um protótipo funcional de desktop. A inferência de IA roda localmente; Spotify, cotações e notícias dependem de rede quando solicitados. Os tempos do artigo descrevem aquela máquina de desenvolvimento, não um benchmark reproduzível entre dispositivos. Próximos passos: demonstração versionada, procedimento de teste e medições em hardware representativo.", "Las capturas y el artículo documentan un prototipo funcional. La inferencia de IA es local; Spotify, cotizaciones y noticias necesitan red cuando se solicitan. Los tiempos describen esa máquina, no un benchmark reproducible. Próximos pasos: demo versionada, procedimiento de prueba y mediciones representativas."),
    gallery: [
      { image: "/projects/jarvis-vision-panel.png", width: 1919, height: 1029, caption: text("Actual HUD capture · MediaPipe landmarks and STL workspace", "Captura real do HUD · coordenadas MediaPipe e espaço STL", "Captura real del HUD · coordenadas MediaPipe y espacio STL") },
      { image: "/projects/jarvis-stl-exploded.png", width: 1915, height: 1028, caption: text("Actual viewer capture · exploded STL parts", "Captura real do visualizador · peças STL em vista explodida", "Captura real del visor · piezas STL explosionadas") },
    ],
  },
  "g27-pedal-adapter": {
    problem: text("Use G27 pedals independently of the original wheel, translating analog pedal positions into USB HID axes that a PC can read.", "Usar pedais G27 sem depender do volante original, convertendo posições analógicas em eixos USB HID que o PC consegue ler.", "Usar pedales G27 sin el volante original, convirtiendo posiciones analógicas en ejes USB HID para el PC."),
    flow: ["G27 · potentiometers", "STM32 · ADC", "Calibration / deadzone", "USB HID", "PC · game input"],
  },
  "arm-robot": {
    problem: text("Connect a desktop interface to a multi-axis robotic arm while keeping servo control on the microcontroller.", "Conectar uma interface de desktop a um braço de múltiplos eixos, mantendo o controle dos servos no microcontrolador.", "Conectar una interfaz de escritorio a un brazo multieje manteniendo el control de servos en el microcontrolador."),
    flow: ["C# · WPF", "USB serial", "STM32 · firmware", "PWM", "Servo joints"],
  },
  "humanoid-robot": {
    problem: text("Organize a multi-node robot so joint controllers and a higher-level interface can exchange commands and telemetry over CAN.", "Organizar um robô distribuído para que controladores de juntas e uma interface de alto nível troquem comandos e telemetria via CAN.", "Organizar un robot distribuido para intercambiar comandos y telemetría entre las articulaciones y la interfaz mediante CAN."),
    flow: ["C# · MAUI", "CAN 2.0B", "ESP32 · nodes", "Joint control", "Telemetry"],
  },
  "quadruped-robot": {
    problem: text("Turn foot targets into joint commands, separating inverse kinematics, gait scheduling and motor output.", "Converter alvos dos pés em comandos de juntas, separando cinemática inversa, planejamento da marcha e saída dos motores.", "Convertir objetivos de los pies en comandos articulares, separando cinemática inversa, marcha y motores."),
    flow: ["Foot targets", "3-DOF · IK", "FreeRTOS · scheduling", "STM32 · PWM", "12 joints"],
  },
  "interactive-portfolio": {
    problem: text("Keep a cinematic, scroll-driven identity without making visitors run a continuous 3D scene. Make the work and writing accessible on their own URLs.", "Preservar uma identidade cinematográfica guiada pelo scroll sem exigir uma cena 3D contínua. Dar aos projetos e textos suas próprias URLs acessíveis.", "Mantener una identidad cinematográfica con scroll sin exigir una escena 3D continua. Dar a proyectos y textos sus propias URLs."),
    flow: ["React · TypeScript", "Scroll progress", "Image layers · CSS", "Published CMS", "Static routes · RSS"],
    limits: text("This website is the live demonstration. The robot uses image layers instead of an always-running 3D scene. Reduced motion and on-demand experiments are supported. Field performance still needs real visitor measurements; no score is claimed here.", "Este site é a demonstração publicada. O robô usa camadas de imagem em vez de uma cena 3D sempre ativa. Há suporte a movimento reduzido e experimentos sob demanda. O desempenho em campo ainda precisa de medições de visitantes reais; nenhum score é afirmado aqui.", "Este sitio es la demo publicada. El robot usa capas de imagen, no una escena 3D continua. Hay movimiento reducido y experimentos bajo demanda. El rendimiento real aún necesita mediciones; aquí no se afirma ningún score."),
  },
};

export function projectStatus(slug: string, language: Language) {
  return editorial[slug === "jarvis" ? "prototype" : slug === "interactive-portfolio" ? "live" : "scope"][language];
}
