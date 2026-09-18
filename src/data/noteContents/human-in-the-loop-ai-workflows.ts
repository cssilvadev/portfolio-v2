export const noteContent = {
  en: `## The Core Philosophy: Partner, Not Autopilot

The biggest trap when adopting AI tools is using them as a passive crutch. When you simply accept code generation without understanding the underlying mechanics, you accumulate invisible technical debt and stall your own skill development.

Inspired by deliberate learning methods, the **Human-in-the-Loop** approach treats AI as a **high-speed research collaborator and sparring partner**, while the engineer maintains complete architectural ownership.

> [!IMPORTANT]
> **The 3 Golden Rules:**
> 1. **Formulate your hypothesis first**: Identify what you expect before asking the model.
> 2. **Ask for mechanics, not just solutions**: Ask *why* an approach was chosen over alternatives.
> 3. **Verify through execution**: Code that hasn't been compiled or stress-tested is only a suggestion.

---

## 3 High-Impact AI Workflows for Developers

### 1. Reverse-Engineering & Architecture Deconstruction
When exploring an unfamiliar codebase (e.g., FreeRTOS scheduler or a complex React 19 hook):

\`\`\`markdown
Prompt Template:
"Explain the sequence of operations in this module from entry to completion.
Highlight potential race conditions or edge cases, and describe the data flow
as a step-by-step state transition."
\`\`\`

### 2. Targeted Drill & Bug Simulation
Instead of just asking for a bug fix, use AI to generate synthetic failure cases:

\`\`\`markdown
Prompt Template:
"Here is my CAN bus packet parsing function. Write 5 edge-case inputs
(e.g., malformed headers, buffer overflows, unexpected frame lengths)
and show what my code currently does vs what it should do."
\`\`\`

### 3. Firmware Register Calculation Helper
Translating bitwise registers into clear diagrams:

\`\`\`c
// Ask AI to generate clear bitmask definitions with byte alignment verified:
#define CAN_BTR_BRP_Pos       (0U)
#define CAN_BTR_BRP_Msk       (0x3FFUL << CAN_BTR_BRP_Pos)  // Baud Rate Prescaler: 10 bits
#define CAN_BTR_TS1_Pos       (16U)
#define CAN_BTR_TS1_Msk       (0xFUL << CAN_BTR_TS1_Pos)    // Time Segment 1: 4 bits
#define CAN_BTR_TS2_Pos       (20U)
#define CAN_BTR_TS2_Msk       (0x7UL << CAN_BTR_TS2_Pos)    // Time Segment 2: 3 bits
\`\`\`

---

## Summary
AI doesn't replace the craft of software and firmware engineering—it amplifies high-leverage curiosity. By staying in the driver's seat and questioning generated assumptions, your speed and depth of mastery compound exponentially.
`,
  pt: `## Filosofia Central: Parceiro, Não Piloto Automático

A maior armadilha ao adotar ferramentas de IA é usá-las como muleta passiva. Quando você simplesmente aceita a geração de código sem entender o funcionamento interno, acumula dívida técnica invisível e estagna seu aprendizado.

Inspirado em métodos de prática deliberada, a abordagem **Humano no Controle (Human-in-the-Loop)** trata a IA como um **colaborador de pesquisa de alta velocidade e parceiro de testes**, enquanto você mantém a liderança da arquitetura.

> [!IMPORTANT]
> **As 3 Regras de Ouro:**
> 1. **Formule sua hipótese primeiro**: Tenha clareza do que espera antes de perguntar ao modelo.
> 2. **Pergunte pela mecânica, não apenas pela solução**: Entenda *por que* uma abordagem foi escolhida.
> 3. **Valide através da execução**: Código que não foi compilado ou testado é apenas uma sugestão.

---

## 3 Workflows de Alto Impacto para Desenvolvedores

### 1. Engenharia Reversa e Decomposição de Arquitetura
Ao explorar um código desconhecido (ex: scheduler do FreeRTOS ou hooks avançados do React):

\`\`\`markdown
Template de Prompt:
"Explique a sequência de operações deste módulo do início ao fim.
Destaque possíveis condições de corrida ou casos de borda e descreva
o fluxo de dados como transições de estado passo a passo."
\`\`\`

### 2. Simulação de Bugs e Testes de Borda
Em vez de pedir apenas a correção, gere cenários de falha sintéticos:

\`\`\`markdown
Template de Prompt:
"Aqui está minha função de parsing de pacotes CAN. Crie 5 entradas de casos
de borda (cabeçalhos inválidos, estouro de buffer, tamanhos inesperados)
e mostre o que meu código faz atualmente vs o que deveria fazer."
\`\`\`

### 3. Auxiliar de Cálculo de Registradores de Firmware
Conversão de registradores bitwise em definições claras:

\`\`\`c
// Solicite à IA a geração de máscaras de bits com alinhamento conferido:
#define CAN_BTR_BRP_Pos       (0U)
#define CAN_BTR_BRP_Msk       (0x3FFUL << CAN_BTR_BRP_Pos)  // Prescaler de Baud Rate: 10 bits
#define CAN_BTR_TS1_Pos       (16U)
#define CAN_BTR_TS1_Msk       (0xFUL << CAN_BTR_TS1_Pos)    // Segmento de Tempo 1: 4 bits
#define CAN_BTR_TS2_Pos       (20U)
#define CAN_BTR_TS2_Msk       (0x7UL << CAN_BTR_TS2_Pos)    // Segmento de Tempo 2: 3 bits
\`\`\`

---

## Resumo
A IA não substitui o ofício da engenharia de software e firmware — ela amplifica sua curiosidade e produtividade. Ao manter-se no comando, sua velocidade e profundidade de domínio crescem exponencialmente.
`,
  es: `## Filosofía Central: Compañero, No Piloto Automático

La mayor trampa al adoptar herramientas de IA es utilizarlas como una muleta pasiva. Cuando simplemente aceptas el código generado sin comprender los mecanismos subyacentes, acumulas deuda técnica invisible y frenas tu desarrollo profesional.

Inspirado en métodos de aprendizaje deliberado, el enfoque **Humano en el Control (Human-in-the-Loop)** trata a la IA como un **colaborador de investigación de alta velocidad y compañero de debate**, mientras el ingeniero mantiene la autoría arquitectónica.

> [!IMPORTANT]
> **Las 3 Reglas de Oro:**
> 1. **Formula tu hipótesis primero**: Ten claro qué esperas antes de consultar al modelo.
> 2. **Pregunta por los mecanismos, no solo por la respuesta**: Entiende *por qué* se eligió una solución.
> 3. **Verifica mediante la ejecución**: Código no compilado ni probado es solo una sugerencia.

---

## 3 Flujos de IA de Alto Impacto para Desarrolladores

### 1. Ingeniería Inversa y Descomposición de Arquitectura
Al explorar una base de código desconocida (ej: planificador FreeRTOS o hooks de React):

\`\`\`markdown
Plantilla de Prompt:
"Explica la secuencia de operaciones en este módulo de principio a fin.
Destaca condiciones de carrera o casos extremos y describe el flujo de
datos paso a paso."
\`\`\`

### 2. Simulación de Errores y Casos Límite
En lugar de pedir solo una corrección, simula entradas adversas:

\`\`\`markdown
Plantilla de Prompt:
"Aquí está mi función de análisis de paquetes CAN. Genera 5 entradas de casos
límite (cabeceras corruptas, desbordamientos de búfer) y muestra lo que
hace mi código frente a lo que debería hacer."
\`\`\`

### 3. Asistente para Registros de Firmware
Traducción de registros bit a bit en definiciones claras:

\`\`\`c
// Generación asistida de máscaras de bits con alineación verificada:
#define CAN_BTR_BRP_Pos       (0U)
#define CAN_BTR_BRP_Msk       (0x3FFUL << CAN_BTR_BRP_Pos)  // Prescaler de Baud Rate: 10 bits
#define CAN_BTR_TS1_Pos       (16U)
#define CAN_BTR_TS1_Msk       (0xFUL << CAN_BTR_TS1_Pos)    // Segmento Temporal 1: 4 bits
#define CAN_BTR_TS2_Pos       (20U)
#define CAN_BTR_TS2_Msk       (0x7UL << CAN_BTR_TS2_Pos)    // Segmento Temporal 2: 3 bits
\`\`\`

---

## Resumen
La IA no reemplaza la disciplina de la ingeniería: amplifica tu curiosidad. Al mantener el control y cuestionar los resultados, tu velocidad de aprendizaje se multiplica.
`,
} as const;

