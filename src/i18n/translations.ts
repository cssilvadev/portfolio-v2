export type Language = "en" | "pt" | "es";

export interface Translations {
  nav: {
    home: string;
    projects: string;
    notes: string;
    about: string;
    contact: string;
  };
  home: {
    eyebrow: string;
    name: string;
    subtitle: string;
  };
  projects: {
    title: string;
    viewBtn: string;
    backBtn: string;
    notFound: string;
    notFoundDesc: string;
    backHome: string;
    overview: string;
    projectDescriptions: Record<string, string>;
  };
  notes: {
    title: string;
    tagline: string;
    categories: {
      all: string;
      firmware: string;
      ai: string;
      robotics: string;
      software: string;
    };
    readBtn: string;
    readTime: string;
    noteStudio: string;
    backNotes: string;
    share: string;
    copied: string;
    prevNote: string;
    nextNote: string;
    notFound: string;
    notFoundDesc: string;
    returnBtn: string;
  };
  about: {
    title: string;
    tags: {
      brazil: string;
      software: string;
      firmware: string;
      embedded: string;
    };
    bio: string;
    education: string;
    csTitle: string;
    csUniv: string;
    csDate: string;
    embedTitle: string;
    embedDesc: string;
    embedDate: string;
    cvBtn: string;
  };
  contact: {
    title: string;
    role: string;
    formTitle: string;
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    sendBtn: string;
    sentSuccess: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      projects: "Projects",
      notes: "Notes",
      about: "About",
      contact: "Contact",
    },
    home: {
      eyebrow: "Full Stack Developer & Firmware Engineer",
      name: "Christian Silva",
      subtitle: "Building software, firmware and interactive systems.",
    },
    projects: {
      title: "PROJECTS",
      viewBtn: "View",
      backBtn: "← Back to Projects",
      notFound: "Project not found",
      notFoundDesc: "This project slug does not exist.",
      backHome: "Back to home",
      overview: "Overview",
      projectDescriptions: {
        "arm-robot": "Firmware and desktop interface for a Robotic Arm.",
        "g27-pedal-adapter": "Custom USB HID Pedal Adapter.",
        "humanoid-robot": "Humanoid robot with ESP32 using MAUI to control via Android Phone.",
        "interactive-portfolio": "Personal portfolio with interactive visuals.",
        "quadruped-robot": "Quadruped robot with ESP32 using MAUI to control via Android Phone.",
      },
    },
    notes: {
      title: "NOTES & LOGS",
      tagline:
        "Technical write-ups, firmware logs, robotics kinematics, and human-in-the-loop AI workflows.",
      categories: {
        all: "All",
        firmware: "Firmware & Embedded",
        ai: "AI & Workflows",
        robotics: "Robotics",
        software: "Software Engineering",
      },
      readBtn: "Read",
      readTime: "min read",
      noteStudio: "Note Studio",
      backNotes: "Back to Notes & Logs",
      share: "Share Note",
      copied: "Link Copied!",
      prevNote: "Previous Note",
      nextNote: "Next Note",
      notFound: "Note not found",
      notFoundDesc: "The technical note you are looking for does not exist.",
      returnBtn: "Return to Notes",
    },
    about: {
      title: "ABOUT",
      tags: {
        brazil: "Brazil",
        software: "Software",
        firmware: "Firmware",
        embedded: "Embedded",
      },
      bio: "Full Stack & Firmware Engineer focused on embedded systems, STM32, CAN networks and hardware-oriented development. I enjoy bridging low-level firmware with high-level software and UI.",
      education: "Education",
      csTitle: "Computer Science",
      csUniv: "Universidade de Caxias do Sul - UCS",
      csDate: "2024 — Present",
      embedTitle: "Embedded Systems & Firmware",
      embedDesc: "STM32 · C · CAN · HID",
      embedDate: "2023 — 2024",
      cvBtn: "View my CV",
    },
    contact: {
      title: "CONTACT",
      role: "Software & Firmware Engineer",
      formTitle: "Send me a message",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      message: "Message",
      sendBtn: "Send",
      sentSuccess: "Message sent successfully!",
    },
  },
  pt: {
    nav: {
      home: "Início",
      projects: "Projetos",
      notes: "Notas",
      about: "Sobre",
      contact: "Contato",
    },
    home: {
      eyebrow: "Desenvolvedor Full Stack & Engenheiro de Firmware",
      name: "Christian Silva",
      subtitle: "Construindo software, firmware e sistemas interativos.",
    },
    projects: {
      title: "PROJETOS",
      viewBtn: "Ver",
      backBtn: "← Voltar aos Projetos",
      notFound: "Projeto não encontrado",
      notFoundDesc: "Esse projeto não existe.",
      backHome: "Voltar para o início",
      overview: "Visão Geral",
      projectDescriptions: {
        "arm-robot": "Firmware e interface desktop para Braço Robótico.",
        "g27-pedal-adapter": "Adaptador USB HID personalizado para pedais.",
        "humanoid-robot": "Robô humanóide com ESP32 controlado via aplicativo MAUI no Android.",
        "interactive-portfolio": "Portfólio pessoal com elementos visuais 3D e interativos.",
        "quadruped-robot": "Robô quadrúpede com ESP32 controlado via aplicativo MAUI no Android.",
      },
    },
    notes: {
      title: "NOTAS & LOGS",
      tagline:
        "Artigos técnicos, logs de firmware, cinemática de robótica e workflows de IA aplicada.",
      categories: {
        all: "Todos",
        firmware: "Firmware & Embarcados",
        ai: "IA & Workflows",
        robotics: "Robótica",
        software: "Engenharia de Software",
      },
      readBtn: "Ler",
      readTime: "min de leitura",
      noteStudio: "Studio de Notas",
      backNotes: "Voltar para Notas & Logs",
      share: "Compartilhar",
      copied: "Link Copiado!",
      prevNote: "Nota Anterior",
      nextNote: "Próxima Nota",
      notFound: "Nota não encontrada",
      notFoundDesc: "A nota técnica que você está procurando não existe.",
      returnBtn: "Voltar para Notas",
    },
    about: {
      title: "SOBRE",
      tags: {
        brazil: "Brasil",
        software: "Software",
        firmware: "Firmware",
        embedded: "Embarcados",
      },
      bio: "Engenheiro Full Stack e de Firmware focado em sistemas embarcados, STM32, redes CAN e desenvolvimento orientado a hardware. Gosto de unir firmware de baixo nível com software e interfaces modernas de alto nível.",
      education: "Formação",
      csTitle: "Ciência da Computação",
      csUniv: "Universidade de Caxias do Sul - UCS",
      csDate: "2024 — Presente",
      embedTitle: "Sistemas Embarcados & Firmware",
      embedDesc: "STM32 · C · CAN · HID",
      embedDate: "2023 — 2024",
      cvBtn: "Ver meu Currículo",
    },
    contact: {
      title: "CONTATO",
      role: "Engenheiro de Software & Firmware",
      formTitle: "Envie uma mensagem",
      firstName: "Nome",
      lastName: "Sobrenome",
      email: "E-mail",
      message: "Mensagem",
      sendBtn: "Enviar",
      sentSuccess: "Mensagem enviada com sucesso!",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      projects: "Proyectos",
      notes: "Notas",
      about: "Sobre mí",
      contact: "Contacto",
    },
    home: {
      eyebrow: "Desarrollador Full Stack e Ingeniero de Firmware",
      name: "Christian Silva",
      subtitle: "Construyendo software, firmware y sistemas interactivos.",
    },
    projects: {
      title: "PROYECTOS",
      viewBtn: "Ver",
      backBtn: "← Volver a Proyectos",
      notFound: "Proyecto no encontrado",
      notFoundDesc: "Este proyecto no existe.",
      backHome: "Volver al inicio",
      overview: "Descripción General",
      projectDescriptions: {
        "arm-robot": "Firmware e interfaz de escritorio para Brazo Robótico.",
        "g27-pedal-adapter": "Adaptador USB HID personalizado para pedales.",
        "humanoid-robot": "Robot humanoide con ESP32 controlado mediante aplicación MAUI en Android.",
        "interactive-portfolio": "Portafolio personal con elementos visuales 3D e interactivos.",
        "quadruped-robot": "Robot cuadrúpedo con ESP32 controlado mediante aplicación MAUI en Android.",
      },
    },
    notes: {
      title: "NOTAS Y REGISTROS",
      tagline:
        "Artículos técnicos, registros de firmware, cinemática robótica y flujos de trabajo con IA.",
      categories: {
        all: "Todos",
        firmware: "Firmware y Embebidos",
        ai: "IA y Flujos",
        robotics: "Robótica",
        software: "Ingeniería de Software",
      },
      readBtn: "Leer",
      readTime: "min de lectura",
      noteStudio: "Estudio de Notas",
      backNotes: "Volver a Notas y Registros",
      share: "Compartir",
      copied: "¡Enlace Copiado!",
      prevNote: "Nota Anterior",
      nextNote: "Siguiente Nota",
      notFound: "Nota no encontrada",
      notFoundDesc: "La nota técnica que estás buscando no existe.",
      returnBtn: "Volver a Notas",
    },
    about: {
      title: "SOBRE MÍ",
      tags: {
        brazil: "Brasil",
        software: "Software",
        firmware: "Firmware",
        embedded: "Embebidos",
      },
      bio: "Ingeniero Full Stack y de Firmware enfocado en sistemas embebidos, STM32, redes CAN y desarrollo orientado a hardware. Me apasiona conectar firmware de bajo nivel con software e interfaces modernas de alto nivel.",
      education: "Educación",
      csTitle: "Ciencias de la Computación",
      csUniv: "Universidade de Caxias do Sul - UCS",
      csDate: "2024 — Presente",
      embedTitle: "Sistemas Embebidos y Firmware",
      embedDesc: "STM32 · C · CAN · HID",
      embedDate: "2023 — 2024",
      cvBtn: "Ver mi CV",
    },
    contact: {
      title: "CONTACTO",
      role: "Ingeniero de Software y Firmware",
      formTitle: "Envíame un mensaje",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo electrónico",
      message: "Mensaje",
      sendBtn: "Enviar",
      sentSuccess: "¡Mensaje enviado con éxito!",
    },
  },
};
