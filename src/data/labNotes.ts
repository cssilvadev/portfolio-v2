import type { Note } from "./notes";

export const labNotes: Note[] = [
  {
    slug: "portfolio-scroll-build-log", date: "2026-09", readingTime: 3, category: "Software Engineering", tags: ["React", "Performance", "Design", "Build log"], coverImage: "/projects/portfolio.svg",
    en: { title: "From a 3D scene to a scroll-driven portfolio", excerpt: "A build log about preserving the robot's identity while moving the work, writing and interactions into a lighter structure.", content: `## The constraint

The original robot gave the portfolio its identity. It also made slower phones and computers part of the design problem: a striking first screen is not enough if scrolling becomes difficult.

## The change

The home now assembles the robot using transparent image layers driven by scroll progress, rather than an always-running 3D scene. Paired limbs share their timing. The approved liquid-glass navigation stays in place; the focus is continuity, not adding effects everywhere.

## Work and writing get their own space

The home introduces projects instead of trying to display every future project. The catalog has search, and individual pages connect the problem, architecture and related articles. Notes remain reading-focused rather than behaving like another animated hero.

## Experiments are optional

The pedal-calibration lab is an educational simulation. Its component loads when requested on the project page; the chart only changes when a control changes. No webcam, microphone or physical device is accessed.

## What remains to be measured

This is a record of implementation choices, not a claim of a perfect performance score. Real-device tests and field measurements still matter. Bench photos, versioned demos and test reports should gradually replace architectural illustrations where available.
` },
    pt: { title: "De uma cena 3D a um portfólio guiado pelo scroll", excerpt: "Um diário sobre preservar a identidade do robô e dar aos projetos, textos e interações uma estrutura mais leve.", content: `## A restrição

O robô original dava identidade ao portfólio. Também trouxe celulares e computadores mais lentos para o centro do problema: uma primeira tela impactante não basta se rolar a página fica difícil.

## A mudança

A home agora monta o robô com camadas de imagem transparentes guiadas pelo progresso do scroll, no lugar de uma cena 3D contínua. Membros em pares compartilham o tempo da montagem. A navegação liquid glass aprovada permanece; o foco é continuidade, não efeitos em todo lugar.

## Projetos e textos ganham espaço próprio

A home apresenta os projetos em vez de tentar exibir todos os trabalhos futuros. O catálogo tem busca e cada página conecta problema, arquitetura e artigos relacionados. As notas priorizam leitura em vez de funcionar como outro hero animado.

## Experimentos são opcionais

O laboratório de calibração de pedais é uma simulação educativa. Na página do projeto, o componente carrega quando solicitado; o gráfico só muda ao alterar um controle. Nenhuma câmera, microfone ou dispositivo físico é acessado.

## O que ainda precisa ser medido

Este é um registro das decisões de implementação, não uma afirmação de score perfeito. Testes em dispositivos reais e medições em campo continuam necessários. Fotos de bancada, demos versionadas e relatórios de teste devem substituir aos poucos as ilustrações de arquitetura quando estiverem disponíveis.
` },
    es: { title: "De una escena 3D a un portafolio guiado por scroll", excerpt: "Un diario sobre conservar la identidad del robot y dar a proyectos, textos e interacciones una estructura más ligera.", content: `## La restricción

El robot original daba identidad al portafolio, pero los teléfonos y ordenadores lentos también debían poder recorrerlo.

## El cambio

La home monta el robot con capas de imagen transparentes guiadas por scroll, no con una escena 3D continua. Las extremidades simétricas comparten los tiempos. La navegación liquid glass aprobada permanece.

## Proyectos y textos

La home introduce el trabajo; el catálogo permite buscarlo. Cada proyecto conecta problema, arquitectura y artículos relacionados. Las notas priorizan la lectura.

## Experimentos opcionales

El laboratorio de pedales es una simulación educativa. En el proyecto carga solo cuando se solicita y el gráfico cambia al mover controles. No accede a cámara, micrófono ni dispositivos físicos.

## Lo que falta medir

Estas decisiones no equivalen a un score perfecto. Faltan mediciones reales, fotos de laboratorio y demos versionadas para documentar el rendimiento y el hardware.
` },
  },
  {
    slug: "pedal-response-bench-note", date: "2026-09", readingTime: 3, category: "Firmware & Embedded", tags: ["ADC", "USB HID", "Calibration", "Simulation"], coverImage: "/projects/g27-pedal-adapter.svg",
    en: { title: "ADC → HID: deadzones and response curves", excerpt: "A reproducible mathematical example for the pedal lab. A simulation, not a physical G27 benchmark.", content: `## Scope

This note explains the educational model used in the interactive lab. It does not report a physical pedal measurement or claim end-to-end latency.

## Normalize first

An ADC sample can be mapped from calibrated minimum and maximum values to an input between 0 and 1. Values outside the calibrated range should be clamped. The browser experiment starts after this step: its input is already normalized.

## Remove the deadzone

For input x and deadzone d, use max(0, (x - d) / (1 - d)). This keeps the resting zone at zero while retaining the full output range.

## Shape the response

Raise the normalized result to an exponent gamma. A gamma above 1 gives less output early in the travel; below 1 gives more. The linear case is gamma = 1.

\`\`\`typescript
const normalized = Math.max(0, (input - deadzone) / (1 - deadzone));
const output = Math.pow(normalized, gamma);
\`\`\`

## Reproduce an example

Set travel to 50%, deadzone to 8% and gamma to 1.5. The normalized value is about 0.4565; the output is about 30.85%. At 8% travel the output is zero; at 100% it is 100%.

## What the model leaves out

Electrical noise, ADC quantization, sample filtering, USB report scheduling and game-side filtering are not simulated. A real adapter needs separate tests for each of those stages. Try the experiment via the related project; no hardware or permissions are required.
` },
    pt: { title: "ADC → HID: zona morta e curvas de resposta", excerpt: "Um exemplo matemático reproduzível para o laboratório de pedais. Simulação, não benchmark físico do G27.", content: `## Escopo

Esta nota explica o modelo educativo usado no laboratório interativo. Não relata uma medição física de pedais nem afirma latência de ponta a ponta.

## Normalize primeiro

Uma amostra ADC pode ser mapeada entre mínimo e máximo calibrados para uma entrada de 0 a 1. Valores fora da faixa devem ser limitados. O experimento no navegador começa depois dessa etapa: sua entrada já está normalizada.

## Remova a zona morta

Para entrada x e zona morta d, usamos max(0, (x - d) / (1 - d)). Isso mantém a região de repouso em zero sem perder a faixa total de saída.

## Modele a resposta

Elevamos o resultado normalizado ao expoente gamma. Acima de 1, a saída é menor no começo do curso; abaixo de 1, é maior. O caso linear é gamma = 1.

\`\`\`typescript
const normalized = Math.max(0, (input - deadzone) / (1 - deadzone));
const output = Math.pow(normalized, gamma);
\`\`\`

## Reproduza um exemplo

Ajuste curso em 50%, zona morta em 8% e gamma em 1.5. O valor normalizado é aproximadamente 0.4565; a saída fica em torno de 30.85%. Em 8% de curso a saída é zero; em 100%, é 100%.

## O que o modelo não inclui

Ruído elétrico, quantização do ADC, filtragem de amostras, agendamento dos relatórios USB e filtragem pelo jogo não são simulados. Um adaptador real precisa de testes separados para essas etapas. Abra o experimento pelo projeto relacionado; nenhum hardware ou permissão é necessário.
` },
    es: { title: "ADC → HID: zonas muertas y curvas de respuesta", excerpt: "Un ejemplo matemático reproducible para el laboratorio de pedales. Simulación, no benchmark físico del G27.", content: `## Alcance

Esta nota explica el modelo educativo del laboratorio. No presenta mediciones físicas ni afirma latencia de extremo a extremo.

## Normalizar

La muestra ADC se mapea entre los límites calibrados a un valor de 0 a 1. El laboratorio empieza después de esta etapa.

## Zona muerta

Para entrada x y zona muerta d, usamos max(0, (x - d) / (1 - d)). Así se conserva todo el rango de salida.

## Curva

Elevamos el resultado a gamma. Por encima de 1 hay menos salida al principio; por debajo de 1 hay más. Gamma = 1 es lineal.

\`\`\`typescript
const normalized = Math.max(0, (input - deadzone) / (1 - deadzone));
const output = Math.pow(normalized, gamma);
\`\`\`

## Reproducir

Entrada 50%, zona muerta 8%, gamma 1.5: salida aproximada 30.85%. En 8% la salida es cero; en 100% es 100%.

## Límites

No se simulan ruido eléctrico, cuantización, filtrado, planificación de reportes USB ni filtrado del juego. Esas etapas necesitan pruebas de hardware independientes.
` },
  },
];
