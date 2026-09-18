import type { Language } from "../i18n/translations";

export type NoteCategory =
  | "Firmware & Embedded"
  | "AI & Workflows"
  | "Robotics"
  | "Software Engineering";

export type NoteContent = {
  title: string;
  excerpt: string;
  content: string;
};

export type Note = {
  slug: string;
  date: string;
  readingTime: number;
  category: NoteCategory;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
  en: NoteContent;
  pt: NoteContent;
  es: NoteContent;
};

export const notes: Note[] = [
  {
    slug: "stm32-can-bus-architecture",
    date: "2026-08",
    readingTime: 5,
    category: "Firmware & Embedded",
    tags: ["STM32", "CAN Bus", "C", "Embedded", "Hardware"],
    coverImage: "/projects/humanoid-robot.svg",
    featured: true,
    en: {
      title: "STM32 CAN Bus Architecture & Hardware Integration",
      excerpt:
        "A deep dive into setting up reliable Controller Area Network (CAN 2.0B) communication on STM32 microcontrollers with hardware filtering and error handling.",
      content: ``,
    },
    pt: {
      title: "Arquitetura CAN Bus STM32 e Integração de Hardware",
      excerpt:
        "Um mergulho profundo na configuração de comunicação Controller Area Network (CAN 2.0B) em microcontroladores STM32 com filtros de hardware e tratamento de erros.",
      content: ``,
    },
    es: {
      title: "Arquitectura CAN Bus STM32 e Integración de Hardware",
      excerpt:
        "Un análisis profundo sobre la configuración de comunicación Controller Area Network (CAN 2.0B) en microcontroladores STM32 con filtros por hardware y manejo de errores.",
      content: ``,
    },
  },
  {
    slug: "human-in-the-loop-ai-workflows",
    date: "2026-08",
    readingTime: 4,
    category: "AI & Workflows",
    tags: ["AI", "Workflows", "Productivity", "Prompting", "Engineering"],
    coverImage: "/projects/portfolio.svg",
    featured: true,
    en: {
      title: "Human-in-the-Loop AI: Workflows for Engineering & Learning",
      excerpt:
        "How to leverage AI coding assistants and LLMs to accelerate debugging, explore architectures, and master complex concepts without losing critical thinking.",
      content: ``,
    },
    pt: {
      title: "IA com Humano no Controle: Workflows para Engenharia e Aprendizado",
      excerpt:
        "Como utilizar assistentes de IA para acelerar depuração, explorar arquiteturas e dominar conceitos complexos mantendo o pensamento crítico.",
      content: ``,
    },
    es: {
      title: "IA con Humano en el Control: Flujos de Trabajo para Ingeniería y Aprendizaje",
      excerpt:
        "Cómo aprovechar los asistentes de IA para acelerar la depuración, explorar arquitecturas y dominar conceptos complejos sin perder el pensamiento crítico.",
      content: ``,
    },
  },
  {
    slug: "quadruped-inverse-kinematics",
    date: "2026-07",
    readingTime: 6,
    category: "Robotics",
    tags: ["Robotics", "Kinematics", "C#", "STM32", "Math"],
    coverImage: "/projects/quadruped-robot.svg",
    featured: false,
    en: {
      title: "Inverse Kinematics & Motion Control for Quadruped Robotics",
      excerpt:
        "A mathematical and firmware breakdown of 3-DOF leg inverse kinematics for quadruped robots running on low-latency microcontrollers.",
      content: ``,
    },
    pt: {
      title: "Cinemática Inversa e Controle de Movimento para Robôs Quadrúpedes",
      excerpt:
        "Uma análise matemática e de firmware da cinemática inversa de perna 3-DOF para robôs quadrúpedes em microcontroladores de baixa latência.",
      content: ``,
    },
    es: {
      title: "Cinemática Inversa y Control de Movimiento para Robótica Cuadrúpeda",
      excerpt:
        "Desglose matemático y de firmware de la cinemática inversa de 3-DOF para patas de robots cuadrúpedos en microcontroladores de baja latencia.",
      content: ``,
    },
  },
  {
    slug: "jarvis-local-ai-hud",
    date: "2026-08",
    readingTime: 10,
    category: "AI & Workflows",
    tags: ["AI", "Computer Vision", "Voice", "C#", "Python", "Ollama", "Local-First"],
    coverImage: "/projects/jarvis-standby-hud.png",
    featured: true,
    en: {
      title: "Building Jarvis: A Fully Local, Iron Man-Style Desktop AI HUD",
      excerpt:
        "Inside Jarvis's architecture: deterministic commands before the LLM, why Kokoro replaced Chatterbox as the voice, a holographic hand cursor, and an offline STL viewer — all running without a single cloud call.",
      content: ``,
    },
    pt: {
      title: "Construindo o Jarvis: Um HUD de IA para Desktop 100% Local, no Estilo Homem de Ferro",
      excerpt:
        "Por dentro da arquitetura do Jarvis: comandos determinísticos antes do LLM, por que o Kokoro substituiu o Chatterbox como voz, um cursor holográfico de mão e um visualizador de STL offline — tudo sem nenhuma chamada de nuvem.",
      content: ``,
    },
    es: {
      title: "Construyendo Jarvis: un HUD de IA de Escritorio 100% Local, al Estilo Iron Man",
      excerpt:
        "Por dentro de la arquitectura de Jarvis: comandos determinísticos antes del LLM, por qué Kokoro reemplazó a Chatterbox como voz, un cursor holográfico de mano y un visor de STL offline — todo sin ninguna llamada a la nube.",
      content: ``,
    },
  },
];

export type LocalizedNote = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: number;
  category: NoteCategory;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
};

type NoteContentModule = { noteContent: Record<Language, string> };

const contentLoaders: Record<string, () => Promise<NoteContentModule>> = {
  "stm32-can-bus-architecture": () => import("./noteContents/stm32-can-bus-architecture"),
  "human-in-the-loop-ai-workflows": () => import("./noteContents/human-in-the-loop-ai-workflows"),
  "quadruped-inverse-kinematics": () => import("./noteContents/quadruped-inverse-kinematics"),
  "jarvis-local-ai-hud": () => import("./noteContents/jarvis-local-ai-hud"),
};

export function getLocalizedNote(note: Note, lang: Language): LocalizedNote {
  const noteContent = note[lang] || note.en;
  return {
    slug: note.slug, title: noteContent.title, excerpt: noteContent.excerpt, content: noteContent.content,
    date: note.date, readingTime: note.readingTime, category: note.category, tags: note.tags,
    coverImage: note.coverImage, featured: note.featured,
  };
}

function normalizeSlug(slug: string): string {
  return slug.toLowerCase().replace(/\.html$/, "");
}

export function getNoteBySlug(slug: string, lang: Language = "en", source: Note[] = notes): LocalizedNote | undefined {
  const normalized = normalizeSlug(slug);
  const found = source.find((n) => n.slug.toLowerCase() === normalized);
  return found ? getLocalizedNote(found, lang) : undefined;
}

export async function loadNoteBySlug(slug: string, lang: Language = "en", source: Note[] = notes): Promise<LocalizedNote | undefined> {
  const localized = getNoteBySlug(slug, lang, source);
  if (!localized) return undefined;
  if (localized.content) return localized;
  const loader = contentLoaders[localized.slug];
  if (!loader) return localized;
  const content = await loader();
  return { ...localized, content: content.noteContent[lang] || content.noteContent.en };
}

export function getAllLocalizedNotes(lang: Language = "en", source: Note[] = notes): LocalizedNote[] {
  return source.map((n) => getLocalizedNote(n, lang));
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet);
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function formatNoteDate(date: string, lang: Language): string {
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : lang, { month: "short", year: "numeric" })
    .format(new Date(date + "-15T12:00:00Z"));
}
