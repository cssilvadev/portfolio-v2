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
    specsTitle: string;
    specLabels: Record<string, string>;
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
    sending: string;
    sentSuccess: string;
    sendError: string;
    endpointMissing: string;
    emailFallback: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    createAccount: string;
    fullName: string;
    email: string;
    password: string;
    forgotPassword: string;
    resetPassword: string;
    sendReset: string;
    backToSignIn: string;
    checkEmail: string;
    signOut: string;
    account: string;
    close: string;
    signingIn: string;
    signingUp: string;
    resetting: string;
    authNotConfigured: string;
    authFailed: string;
    passwordMin: string;
    passwordUpdated: string;
    confirmPassword: string;
    admin: string;
  };
  billing: {
    upgrade: string;
    monthly: string;
    yearly: string;
    lifetime: string;
    subscribe: string;
    active: string;
    unavailable: string;
    checkoutError: string;
    checkoutSuccess: string;
    checkoutCancelled: string;
    signInRequired: string;
    free: string;
    pro: string;
  };
  notFoundPage: {
    title: string;
    desc: string;
    backBtn: string;
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
      specsTitle: "Technical Specs",
      specLabels: {
        mcu: "MCU",
        control: "Control",
        interface: "Interface",
        comms: "Communication",
        firmware: "Firmware",
        network: "Network",
        dof: "Degrees of Freedom",
        rtos: "RTOS",
        app: "Application",
        telemetry: "Telemetry",
        frontend: "Frontend",
        render3d: "3D Rendering",
        backend: "Backend",
        i18n: "Localization",
        input: "Input",
        latency: "Latency",
        gait: "Gait Pattern",
        vision: "Computer Vision",
        voice: "Voice Pipeline",
        llm: "Language Model",
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
      sending: "Sending…",
      sentSuccess: "Message sent successfully!",
      sendError: "The message could not be sent. Please try again or use email.",
      endpointMissing: "Contact form is not configured yet. Please use email instead.",
      emailFallback: "Send by email",
    },
    auth: {
      signIn: "Sign In", signUp: "Sign Up", createAccount: "Create account", fullName: "Full name",
      email: "Email", password: "Password", forgotPassword: "Forgot password?", resetPassword: "Reset password",
      sendReset: "Send reset link", backToSignIn: "Back to sign in", checkEmail: "Check your email for the next step.",
      signOut: "Sign out", account: "Account", close: "Close", signingIn: "Signing in…", signingUp: "Creating account…",
      resetting: "Sending…", authNotConfigured: "Authentication is not configured yet.", authFailed: "Authentication could not be completed.", passwordMin: "Use at least 8 characters.", passwordUpdated: "Password updated successfully.", confirmPassword: "Confirm password", admin: "Admin",
    },
    billing: {
      upgrade: "Unlock PRO", monthly: "Monthly", yearly: "Yearly", lifetime: "Lifetime", subscribe: "Continue to checkout",
      active: "Active plan", unavailable: "This plan is not configured yet.", checkoutError: "Checkout could not be started.",
      checkoutSuccess: "Payment received. Your access will be updated after confirmation.", checkoutCancelled: "Checkout cancelled.",
      signInRequired: "Sign in to choose a plan.", free: "Free", pro: "PRO",
    },
    notFoundPage: {
      title: "Page not found",
      desc: "The page you're looking for doesn't exist or was moved.",
      backBtn: "Back to home",
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
      specsTitle: "Ficha Técnica",
      specLabels: {
        mcu: "MCU",
        control: "Controle",
        interface: "Interface",
        comms: "Comunicação",
        firmware: "Firmware",
        network: "Rede",
        dof: "Graus de Liberdade",
        rtos: "RTOS",
        app: "Aplicativo",
        telemetry: "Telemetria",
        frontend: "Frontend",
        render3d: "Renderização 3D",
        backend: "Backend",
        i18n: "Internacionalização",
        input: "Entrada",
        latency: "Latência",
        gait: "Padrão de Marcha",
        vision: "Visão Computacional",
        voice: "Pipeline de Voz",
        llm: "Modelo de Linguagem",
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
      sending: "Enviando…",
      sentSuccess: "Mensagem enviada com sucesso!",
      sendError: "Não foi possível enviar a mensagem. Tente novamente ou use o e-mail.",
      endpointMissing: "O formulário ainda não está configurado. Use o e-mail enquanto isso.",
      emailFallback: "Enviar por e-mail",
    },
    auth: {
      signIn: "Entrar", signUp: "Cadastrar", createAccount: "Criar conta", fullName: "Nome completo",
      email: "E-mail", password: "Senha", forgotPassword: "Esqueceu a senha?", resetPassword: "Redefinir senha",
      sendReset: "Enviar link de redefinição", backToSignIn: "Voltar para entrar", checkEmail: "Confira seu e-mail para continuar.",
      signOut: "Sair", account: "Conta", close: "Fechar", signingIn: "Entrando…", signingUp: "Criando conta…",
      resetting: "Enviando…", authNotConfigured: "A autenticação ainda não está configurada.", authFailed: "Não foi possível concluir a autenticação.", passwordMin: "Use pelo menos 8 caracteres.", passwordUpdated: "Senha atualizada com sucesso.", confirmPassword: "Confirme a senha", admin: "Admin",
    },
    billing: {
      upgrade: "Desbloquear PRO", monthly: "Mensal", yearly: "Anual", lifetime: "Vitalício", subscribe: "Continuar para pagamento",
      active: "Plano ativo", unavailable: "Este plano ainda não está configurado.", checkoutError: "Não foi possível iniciar o pagamento.",
      checkoutSuccess: "Pagamento recebido. O acesso será atualizado após a confirmação.", checkoutCancelled: "Pagamento cancelado.",
      signInRequired: "Entre para escolher um plano.", free: "Grátis", pro: "PRO",
    },
    notFoundPage: {
      title: "Página não encontrada",
      desc: "A página que você procura não existe ou foi movida.",
      backBtn: "Voltar para o início",
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
      specsTitle: "Ficha Técnica",
      specLabels: {
        mcu: "MCU",
        control: "Control",
        interface: "Interfaz",
        comms: "Comunicación",
        firmware: "Firmware",
        network: "Red",
        dof: "Grados de Libertad",
        rtos: "RTOS",
        app: "Aplicación",
        telemetry: "Telemetría",
        frontend: "Frontend",
        render3d: "Renderizado 3D",
        backend: "Backend",
        i18n: "Internacionalización",
        input: "Entrada",
        latency: "Latencia",
        gait: "Patrón de Marcha",
        vision: "Visión Artificial",
        voice: "Pipeline de Voz",
        llm: "Modelo de Lenguaje",
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
      sending: "Enviando…",
      sentSuccess: "¡Mensaje enviado con éxito!",
      sendError: "No se pudo enviar el mensaje. Inténtalo de nuevo o usa el correo electrónico.",
      endpointMissing: "El formulario todavía no está configurado. Usa el correo electrónico.",
      emailFallback: "Enviar por correo",
    },
    auth: {
      signIn: "Iniciar sesión", signUp: "Registrarse", createAccount: "Crear cuenta", fullName: "Nombre completo",
      email: "Correo electrónico", password: "Contraseña", forgotPassword: "¿Olvidaste tu contraseña?", resetPassword: "Restablecer contraseña",
      sendReset: "Enviar enlace", backToSignIn: "Volver a iniciar sesión", checkEmail: "Revisa tu correo para continuar.",
      signOut: "Cerrar sesión", account: "Cuenta", close: "Cerrar", signingIn: "Iniciando sesión…", signingUp: "Creando cuenta…",
      resetting: "Enviando…", authNotConfigured: "La autenticación aún no está configurada.", authFailed: "No se pudo completar la autenticación.", passwordMin: "Usa al menos 8 caracteres.", passwordUpdated: "Contraseña actualizada correctamente.", confirmPassword: "Confirma la contraseña", admin: "Admin",
    },
    billing: {
      upgrade: "Desbloquear PRO", monthly: "Mensual", yearly: "Anual", lifetime: "Vitalicio", subscribe: "Continuar al pago",
      active: "Plan activo", unavailable: "Este plan aún no está configurado.", checkoutError: "No se pudo iniciar el pago.",
      checkoutSuccess: "Pago recibido. El acceso se actualizará tras la confirmación.", checkoutCancelled: "Pago cancelado.",
      signInRequired: "Inicia sesión para elegir un plan.", free: "Gratis", pro: "PRO",
    },
    notFoundPage: {
      title: "Página no encontrada",
      desc: "La página que buscas no existe o fue movida.",
      backBtn: "Volver al inicio",
    },
  },
};
