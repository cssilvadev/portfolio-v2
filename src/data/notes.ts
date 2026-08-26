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
  readingTime: string;
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
    date: "Aug 2026",
    readingTime: "5 min read",
    category: "Firmware & Embedded",
    tags: ["STM32", "CAN Bus", "C", "Embedded", "Hardware"],
    coverImage: "/projects/humanoid-robot.svg",
    featured: true,
    en: {
      title: "STM32 CAN Bus Architecture & Hardware Integration",
      excerpt:
        "A deep dive into setting up reliable Controller Area Network (CAN 2.0B) communication on STM32 microcontrollers with hardware filtering and error handling.",
      content: `## Overview

When building distributed robotic systems or automotive hardware adapters, **CAN Bus (Controller Area Network)** is the gold standard for robust, noise-immune differential signaling. Unlike I2C or SPI, CAN handles bus arbitration at the physical/data link layer without master-slave dependencies.

In this note, we break down how to configure hardware filter banks on an **STM32F4/STM32G4** to offload message filtering from the CPU and prevent interrupt floods.

> [!NOTE]
> Hardware filtering ensures that your firmware's ISR (Interrupt Service Routine) only executes when a message matching your target identifier is received.

---

## Hardware Configuration & Transceiver Wiring

A standard CAN node requires a transceiver like the **TJA1050** or **SN65HVD230** (3.3V logic compatible with STM32):

- **TX Pin (STM32 PB9)** → **TXD (Transceiver)**
- **RX Pin (STM32 PB8)** → **RXD (Transceiver)**
- **CANH / CANL** → Twisted pair bus terminated with **120Ω resistors** at both bus ends.

\`\`\`diagram
STM32 PB9 (TX) -> TJA1050 TXD -> CAN Bus (120Ω term.)
CAN Bus (120Ω term.) -> TJA1050 RXD -> STM32 PB8 (RX)
\`\`\`

---

## Firmware Implementation (C / STM32 HAL)

Here is how to configure the CAN filter bank in 32-bit Mask Mode:

\`\`\`c
#include "stm32f4xx_hal.h"

extern CAN_HandleTypeDef hcan1;

void CAN_ConfigFilter(void) {
    CAN_FilterTypeDef filterConfig;

    // Filter Bank 0 for CAN1
    filterConfig.FilterBank = 0;
    filterConfig.FilterMode = CAN_FILTERMODE_IDMASK;
    filterConfig.FilterScale = CAN_FILTERSCALE_32BIT;

    // We only accept Standard ID 0x320 (Motor Feedback)
    filterConfig.FilterIdHigh = (0x320 << 5);
    filterConfig.FilterIdLow = 0x0000;
    filterConfig.FilterMaskIdHigh = (0x7FF << 5); // Match exact 11-bit ID
    filterConfig.FilterMaskIdLow = 0x0000;

    filterConfig.FilterFIFOAssignment = CAN_RX_FIFO0;
    filterConfig.FilterActivation = CAN_FILTER_ENABLE;
    filterConfig.SlaveStartFilterBank = 14;

    if (HAL_CAN_ConfigFilter(&hcan1, &filterConfig) != HAL_OK) {
        // Initialization Error
        Error_Handler();
    }
}
\`\`\`

> [!TIP]
> Always enable the CAN RX FIFO Interrupt after starting the CAN peripheral:
> \`HAL_CAN_ActivateNotification(&hcan1, CAN_IT_RX_FIFO0_MSG_PENDING);\`

---

## Non-Blocking Interrupt Handler

Process the incoming frames inside the callback to keep the ISR fast:

\`\`\`c
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan) {
    CAN_RxHeaderTypeDef rxHeader;
    uint8_t rxData[8];

    if (HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &rxHeader, rxData) == HAL_OK) {
        if (rxHeader.StdId == 0x320) {
            // Unpack 16-bit motor encoder velocity (Big Endian)
            int16_t velocity = (rxData[0] << 8) | rxData[1];
            update_motor_state(velocity);
        }
    }
}
\`\`\`

---

## Key Takeaways
1. **Always terminate your bus**: Missing the 120Ω terminators causes signal reflections and bus-off states.
2. **Filter in hardware**: Never let software discard unneeded packets on busy networks.
3. **Handle error flags**: Monitor \`HAL_CAN_GetError()\` to detect bit-stuffing or acknowledgment failures early.
`,
    },
    pt: {
      title: "Arquitetura CAN Bus STM32 e Integração de Hardware",
      excerpt:
        "Um mergulho profundo na configuração de comunicação Controller Area Network (CAN 2.0B) em microcontroladores STM32 com filtros de hardware e tratamento de erros.",
      content: `## Visão Geral

Ao desenvolver sistemas robóticos distribuídos ou adaptadores de hardware automotivo, o **CAN Bus (Controller Area Network)** é o padrão de ouro para sinalização diferencial robusta e imune a ruídos. Ao contrário do I2C ou SPI, o CAN gerencia a arbitragem de barramento na camada física/enlace de dados sem depender de topologias mestre-escravo.

Nesta nota, detalhamos como configurar bancos de filtros em hardware no **STM32F4/STM32G4** para descarregar a filtragem de mensagens da CPU e evitar sobrecarga de interrupções.

> [!NOTE]
> A filtragem por hardware garante que a rotina de interrupção (ISR) do seu firmware execute apenas quando uma mensagem com o identificador de destino for recebida.

---

## Configuração de Hardware e Ligação do Transceptor

Um nó CAN padrão requer um transceptor como o **TJA1050** ou **SN65HVD230** (lógica de 3.3V compatível com STM32):

- **Pino TX (STM32 PB9)** → **TXD (Transceptor)**
- **Pino RX (STM32 PB8)** → **RXD (Transceptor)**
- **CANH / CANL** → Barramento de par trançado terminado com **resistores de 120Ω** em ambas as extremidades.

\`\`\`diagram
STM32 PB9 (TX) -> TJA1050 TXD -> Barramento CAN (term. 120Ω)
Barramento CAN (term. 120Ω) -> TJA1050 RXD -> STM32 PB8 (RX)
\`\`\`

---

## Implementação no Firmware (C / STM32 HAL)

Veja como configurar o banco de filtros CAN no modo Máscara de 32 bits:

\`\`\`c
#include "stm32f4xx_hal.h"

extern CAN_HandleTypeDef hcan1;

void CAN_ConfigFilter(void) {
    CAN_FilterTypeDef filterConfig;

    // Banco de Filtro 0 para CAN1
    filterConfig.FilterBank = 0;
    filterConfig.FilterMode = CAN_FILTERMODE_IDMASK;
    filterConfig.FilterScale = CAN_FILTERSCALE_32BIT;

    // Aceitamos apenas o ID Padrão 0x320 (Feedback do Motor)
    filterConfig.FilterIdHigh = (0x320 << 5);
    filterConfig.FilterIdLow = 0x0000;
    filterConfig.FilterMaskIdHigh = (0x7FF << 5); // Casamento exato do ID de 11 bits
    filterConfig.FilterMaskIdLow = 0x0000;

    filterConfig.FilterFIFOAssignment = CAN_RX_FIFO0;
    filterConfig.FilterActivation = CAN_FILTER_ENABLE;
    filterConfig.SlaveStartFilterBank = 14;

    if (HAL_CAN_ConfigFilter(&hcan1, &filterConfig) != HAL_OK) {
        // Erro de Inicialização
        Error_Handler();
    }
}
\`\`\`

> [!TIP]
> Sempre ative a notificação de interrupção CAN RX FIFO após iniciar o periférico CAN:
> \`HAL_CAN_ActivateNotification(&hcan1, CAN_IT_RX_FIFO0_MSG_PENDING);\`

---

## Manipulador de Interrupção Não-Bloqueante

Processe os quadros recebidos dentro do callback para manter a rotina rápida:

\`\`\`c
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan) {
    CAN_RxHeaderTypeDef rxHeader;
    uint8_t rxData[8];

    if (HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &rxHeader, rxData) == HAL_OK) {
        if (rxHeader.StdId == 0x320) {
            // Desempacota velocidade de 16 bits do encoder do motor (Big Endian)
            int16_t velocity = (rxData[0] << 8) | rxData[1];
            update_motor_state(velocity);
        }
    }
}
\`\`\`

---

## Pontos Chave
1. **Sempre termine o barramento**: A falta dos resistores de 120Ω gera reflexões de sinal e quedas no barramento.
2. **Filtre em hardware**: Nunca deixe o software descartar pacotes em redes de alto tráfego.
3. **Monitore flags de erro**: Use \`HAL_CAN_GetError()\` para detectar falhas de bit-stuffing ou confirmação rapidamente.
`,
    },
    es: {
      title: "Arquitectura CAN Bus STM32 e Integración de Hardware",
      excerpt:
        "Un análisis profundo sobre la configuración de comunicación Controller Area Network (CAN 2.0B) en microcontroladores STM32 con filtros por hardware y manejo de errores.",
      content: `## Descripción General

Al construir sistemas robóticos distribuidos o adaptadores de hardware automotriz, **CAN Bus (Controller Area Network)** es el estándar de oro para señalización diferencial robusta e inmune al ruido. A diferencia de I2C o SPI, CAN gestiona el arbitraje del bus en la capa física/enlace de datos sin depender de maestro-esclavo.

En esta nota, desglosamos cómo configurar bancos de filtros por hardware en **STM32F4/STM32G4** para liberar a la CPU de filtrar mensajes y evitar avalanchas de interrupciones.

> [!NOTE]
> El filtrado por hardware garantiza que la rutina de servicio de interrupción (ISR) de tu firmware solo se ejecute cuando se reciba un mensaje que coincida con tu identificador de destino.

---

## Configuración de Hardware y Conexión del Transceptor

Un nodo CAN estándar requiere un transceptor como el **TJA1050** o **SN65HVD230** (lógica de 3.3V compatible con STM32):

- **Pin TX (STM32 PB9)** → **TXD (Transceptor)**
- **Pin RX (STM32 PB8)** → **RXD (Transceptor)**
- **CANH / CANL** → Par trenzado terminado con **resistencias de 120Ω** en ambos extremos del bus.

\`\`\`diagram
STM32 PB9 (TX) -> TJA1050 TXD -> Bus CAN (term. 120Ω)
Bus CAN (term. 120Ω) -> TJA1050 RXD -> STM32 PB8 (RX)
\`\`\`

---

## Implementación de Firmware (C / STM32 HAL)

A continuación se muestra cómo configurar el banco de filtros CAN en modo Máscara de 32 bits:

\`\`\`c
#include "stm32f4xx_hal.h"

extern CAN_HandleTypeDef hcan1;

void CAN_ConfigFilter(void) {
    CAN_FilterTypeDef filterConfig;

    // Banco de Filtro 0 para CAN1
    filterConfig.FilterBank = 0;
    filterConfig.FilterMode = CAN_FILTERMODE_IDMASK;
    filterConfig.FilterScale = CAN_FILTERSCALE_32BIT;

    // Solo aceptamos ID Estándar 0x320 (Feedback del Motor)
    filterConfig.FilterIdHigh = (0x320 << 5);
    filterConfig.FilterIdLow = 0x0000;
    filterConfig.FilterMaskIdHigh = (0x7FF << 5); // Coincidencia exacta de 11 bits
    filterConfig.FilterMaskIdLow = 0x0000;

    filterConfig.FilterFIFOAssignment = CAN_RX_FIFO0;
    filterConfig.FilterActivation = CAN_FILTER_ENABLE;
    filterConfig.SlaveStartFilterBank = 14;

    if (HAL_CAN_ConfigFilter(&hcan1, &filterConfig) != HAL_OK) {
        // Error de Inicialización
        Error_Handler();
    }
}
\`\`\`

> [!TIP]
> Habilita siempre la notificación de interrupción CAN RX FIFO tras iniciar el periférico:
> \`HAL_CAN_ActivateNotification(&hcan1, CAN_IT_RX_FIFO0_MSG_PENDING);\`

---

## Controlador de Interrupción No Bloqueante

Procesa las tramas entrantes dentro del callback para mantener la ISR ágil:

\`\`\`c
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan) {
    CAN_RxHeaderTypeDef rxHeader;
    uint8_t rxData[8];

    if (HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &rxHeader, rxData) == HAL_OK) {
        if (rxHeader.StdId == 0x320) {
            // Desempaquetar velocidad del encoder de 16 bits (Big Endian)
            int16_t velocity = (rxData[0] << 8) | rxData[1];
            update_motor_state(velocity);
        }
    }
}
\`\`\`

---

## Conclusiones Clave
1. **Termina siempre el bus**: Omitir las resistencias de 120Ω provoca reflexiones de señal y estados bus-off.
2. **Filtra en hardware**: Nunca dejes que el software descarte paquetes en redes con mucho tráfico.
3. **Gestiona flags de error**: Monitorea \`HAL_CAN_GetError()\` para detectar anomalías a tiempo.
`,
    },
  },
  {
    slug: "human-in-the-loop-ai-workflows",
    date: "Aug 2026",
    readingTime: "4 min read",
    category: "AI & Workflows",
    tags: ["AI", "Workflows", "Productivity", "Prompting", "Engineering"],
    coverImage: "/projects/portfolio.svg",
    featured: true,
    en: {
      title: "Human-in-the-Loop AI: Workflows for Engineering & Learning",
      excerpt:
        "How to leverage AI coding assistants and LLMs to accelerate debugging, explore architectures, and master complex concepts without losing critical thinking.",
      content: `## The Core Philosophy: Partner, Not Autopilot

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
    },
    pt: {
      title: "IA com Humano no Controle: Workflows para Engenharia e Aprendizado",
      excerpt:
        "Como utilizar assistentes de IA para acelerar depuração, explorar arquiteturas e dominar conceitos complexos mantendo o pensamento crítico.",
      content: `## Filosofia Central: Parceiro, Não Piloto Automático

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
    },
    es: {
      title: "IA con Humano en el Control: Flujos de Trabajo para Ingeniería y Aprendizaje",
      excerpt:
        "Cómo aprovechar los asistentes de IA para acelerar la depuración, explorar arquitecturas y dominar conceptos complejos sin perder el pensamiento crítico.",
      content: `## Filosofía Central: Compañero, No Piloto Automático

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
    },
  },
  {
    slug: "quadruped-inverse-kinematics",
    date: "Jul 2026",
    readingTime: "6 min read",
    category: "Robotics",
    tags: ["Robotics", "Kinematics", "C#", "STM32", "Math"],
    coverImage: "/projects/seatbelt.svg",
    featured: false,
    en: {
      title: "Inverse Kinematics & Motion Control for Quadruped Robotics",
      excerpt:
        "A mathematical and firmware breakdown of 3-DOF leg inverse kinematics for quadruped robots running on low-latency microcontrollers.",
      content: `## Introduction to Quadruped Leg Geometry

A standard quadruped robot leg consists of 3 degrees of freedom (3-DOF):
1. **Coxa (Hip Abduction/Adduction - Roll)**: Rotates the leg outward or inward.
2. **Femur (Hip Pitch)**: Moves the upper leg forward and backward.
3. **Tibia (Knee Pitch)**: Extends or contracts the lower leg.

The goal of **Inverse Kinematics (IK)** is to calculate the 3 joint angles \`(θ₁, θ₂, θ₃)\` required to position the foot at target coordinate \`(x, y, z)\` relative to the hip frame.

---

## Geometric IK Formulation

Using the geometric approach with trigonometry:

\`\`\`c
#include <math.h>

typedef struct {
    float theta1; // Coxa angle in radians
    float theta2; // Femur angle in radians
    float theta3; // Tibia angle in radians
} LegAngles_t;

// Leg segment lengths in millimeters
#define L_COXA   45.0f
#define L_FEMUR  120.0f
#define L_TIBIA  125.0f

LegAngles_t Calculate_Leg_IK(float x, float y, float z) {
    LegAngles_t angles;

    // 1. Coxa Angle (Theta 1)
    angles.theta1 = atan2f(y, -z);

    // Effective length in X-Z projected plane
    float yz_plane = sqrtf(y * y + z * z);
    float d = sqrtf(yz_plane * yz_plane - L_COXA * L_COXA);
    float dist = sqrtf(x * x + d * d);

    // 2. Tibia Angle (Theta 3) via Law of Cosines
    float cos_theta3 = (dist * dist - L_FEMUR * L_FEMUR - L_TIBIA * L_TIBIA) 
                       / (2.0f * L_FEMUR * L_TIBIA);

    // Clamp for float precision
    if (cos_theta3 > 1.0f) cos_theta3 = 1.0f;
    if (cos_theta3 < -1.0f) cos_theta3 = -1.0f;
    
    angles.theta3 = acosf(cos_theta3);

    // 3. Femur Angle (Theta 2)
    float alpha = atan2f(x, d);
    float beta = acosf((dist * dist + L_FEMUR * L_FEMUR - L_TIBIA * L_TIBIA) 
                       / (2.0f * dist * L_FEMUR));
    angles.theta2 = alpha + beta;

    return angles;
}
\`\`\`

> [!WARNING]
> Always perform workspace boundary checking before passing calculated angles to PWM timers. Commanding unreachable coordinates leads to \`NaN\` outputs and erratic servo motion.

---

## Real-Time Gait Generation

To achieve smooth locomotion:
- Use a **Bezier curve** or **cycloid trajectory** for the foot swing phase.
- Run the IK solver at **200Hz - 500Hz** inside a dedicated FreeRTOS task or hardware timer callback.
`,
    },
    pt: {
      title: "Cinemática Inversa e Controle de Movimento para Robôs Quadrúpedes",
      excerpt:
        "Uma análise matemática e de firmware da cinemática inversa de perna 3-DOF para robôs quadrúpedes em microcontroladores de baixa latência.",
      content: `## Introdução à Geometria da Perna Quadrúpede

Uma perna padrão de robô quadrúpede possui 3 graus de liberdade (3-DOF):
1. **Coxa (Abdução/Adução do Quadril - Roll)**: Rotaciona a perna para fora ou para dentro.
2. **Fêmur (Pitch do Quadril)**: Move a parte superior da perna para frente e para trás.
3. **Tíbia (Pitch do Joelho)**: Estende ou contrai a parte inferior da perna.

O objetivo da **Cinemática Inversa (IK)** é calcular os 3 ângulos das articulações \`(θ₁, θ₂, θ₃)\` necessários para posicionar a ponta do pé na coordenada alvo \`(x, y, z)\` em relação à base do quadril.

---

## Formulação Geométrica de IK

Utilizando abordagem trigonométrica:

\`\`\`c
#include <math.h>

typedef struct {
    float theta1; // Ângulo da Coxa em radianos
    float theta2; // Ângulo do Fêmur em radianos
    float theta3; // Ângulo da Tíbia em radianos
} LegAngles_t;

// Comprimento dos segmentos da perna em milímetros
#define L_COXA   45.0f
#define L_FEMUR  120.0f
#define L_TIBIA  125.0f

LegAngles_t Calculate_Leg_IK(float x, float y, float z) {
    LegAngles_t angles;

    // 1. Ângulo da Coxa (Theta 1)
    angles.theta1 = atan2f(y, -z);

    // Comprimento efetivo no plano projetado X-Z
    float yz_plane = sqrtf(y * y + z * z);
    float d = sqrtf(yz_plane * yz_plane - L_COXA * L_COXA);
    float dist = sqrtf(x * x + d * d);

    // 2. Ângulo da Tíbia (Theta 3) via Lei dos Cossenos
    float cos_theta3 = (dist * dist - L_FEMUR * L_FEMUR - L_TIBIA * L_TIBIA) 
                       / (2.0f * L_FEMUR * L_TIBIA);

    // Limitação para precisão de ponto flutuante
    if (cos_theta3 > 1.0f) cos_theta3 = 1.0f;
    if (cos_theta3 < -1.0f) cos_theta3 = -1.0f;
    
    angles.theta3 = acosf(cos_theta3);

    // 3. Ângulo do Fêmur (Theta 2)
    float alpha = atan2f(x, d);
    float beta = acosf((dist * dist + L_FEMUR * L_FEMUR - L_TIBIA * L_TIBIA) 
                       / (2.0f * dist * L_FEMUR));
    angles.theta2 = alpha + beta;

    return angles;
}
\`\`\`

> [!WARNING]
> Sempre verifique os limites de alcance do espaço de trabalho antes de enviar os ângulos para os timers PWM. Coordenadas fora de alcance geram valores \`NaN\` e movimentos bruscos dos servos.

---

## Geração de Marcha em Tempo Real

Para locomoção fluida:
- Utilize **curvas de Bézier** ou **trajetórias ciclóides** para a fase de elevação do pé.
- Execute o solver de IK entre **200Hz e 500Hz** dentro de uma tarefa dedicada do FreeRTOS ou interrupção de timer em hardware.
`,
    },
    es: {
      title: "Cinemática Inversa y Control de Movimiento para Robótica Cuadrúpeda",
      excerpt:
        "Desglose matemático y de firmware de la cinemática inversa de 3-DOF para patas de robots cuadrúpedos en microcontroladores de baja latencia.",
      content: `## Introducción a la Geometría de Patas Cuadrúpedas

Una pata estándar de robot cuadrúpedo consta de 3 grados de libertad (3-DOF):
1. **Coxa (Abducción/Aducción de Cadera - Roll)**: Gira la pata hacia afuera o hacia adentro.
2. **Fémur (Pitch de Cadera)**: Mueve el segmento superior hacia adelante y hacia atrás.
3. **Tibia (Pitch de Rodilla)**: Extiende o contrae el segmento inferior.

El objetivo de la **Cinemática Inversa (IK)** es calcular los 3 ángulos articulares \`(θ₁, θ₂, θ₃)\` necesarios para situar el pie en la coordenada objetivo \`(x, y, z)\` respecto al origen de la cadera.

---

## Formulación Geométrica de IK

Empleando trigonometría geométrica:

\`\`\`c
#include <math.h>

typedef struct {
    float theta1; // Ángulo Coxa en radianes
    float theta2; // Ángulo Fémur en radianes
    float theta3; // Ángulo Tibia en radianes
} LegAngles_t;

// Longitud de segmentos en milímetros
#define L_COXA   45.0f
#define L_FEMUR  120.0f
#define L_TIBIA  125.0f

LegAngles_t Calculate_Leg_IK(float x, float y, float z) {
    LegAngles_t angles;

    // 1. Ángulo de Coxa (Theta 1)
    angles.theta1 = atan2f(y, -z);

    // Longitud efectiva en el plano X-Z proyectado
    float yz_plane = sqrtf(y * y + z * z);
    float d = sqrtf(yz_plane * yz_plane - L_COXA * L_COXA);
    float dist = sqrtf(x * x + d * d);

    // 2. Ángulo de Tibia (Theta 3) mediante Ley del Coseno
    float cos_theta3 = (dist * dist - L_FEMUR * L_FEMUR - L_TIBIA * L_TIBIA) 
                       / (2.0f * L_FEMUR * L_TIBIA);

    // Acotar para precisión numérica
    if (cos_theta3 > 1.0f) cos_theta3 = 1.0f;
    if (cos_theta3 < -1.0f) cos_theta3 = -1.0f;
    
    angles.theta3 = acosf(cos_theta3);

    // 3. Ángulo de Fémur (Theta 2)
    float alpha = atan2f(x, d);
    float beta = acosf((dist * dist + L_FEMUR * L_FEMUR - L_TIBIA * L_TIBIA) 
                       / (2.0f * dist * L_FEMUR));
    angles.theta2 = alpha + beta;

    return angles;
}
\`\`\`

> [!WARNING]
> Realiza siempre comprobación de límites espaciales antes de enviar ángulos a los temporizadores PWM. Coordenadas inalcanzables producen valores \`NaN\` y movimientos descontrolados.

---

## Generación de Marcha en Tiempo Real

Para locomoción fluida:
- Utiliza **curvas de Bézier** o **trayectorias cicloides** para la fase aérea del pie.
- Ejecuta el solucionador de IK entre **200Hz y 500Hz** dentro de una tarea FreeRTOS dedicada.
`,
    },
  },
  {
    slug: "jarvis-local-ai-hud",
    date: "Aug 2026",
    readingTime: "10 min read",
    category: "AI & Workflows",
    tags: ["AI", "Computer Vision", "Voice", "C#", "Python", "Ollama", "Local-First"],
    coverImage: "/projects/jarvis-standby-hud.png",
    featured: true,
    en: {
      title: "Building Jarvis: A Fully Local, Iron Man-Style Desktop AI HUD",
      excerpt:
        "Inside Jarvis's architecture: deterministic commands before the LLM, why Kokoro replaced Chatterbox as the voice, a holographic hand cursor, and an offline STL viewer — all running without a single cloud call.",
      content: `## Overview

**Jarvis** is a desktop AI assistant inspired by Iron Man's HUD: an arc-reactor interface, live panels, a holographic hand cursor, and a 3D viewer — all wrapped around a voice assistant that runs **entirely on-device**. Wake word detection, transcription, the language model, and text-to-speech all run locally; only a couple of explicitly non-AI features (Spotify playback, stock quotes) touch the internet, and only when asked for.

![Jarvis standby HUD showing the arc-reactor idle screen, the Spotify now-playing panel, and the clap/wake-word activation hint](/projects/jarvis-standby-hud.png)

> [!NOTE]
> Cloud LLM APIs were tested early on. Local inference won for latency, privacy, and simply not being at the mercy of a network connection — a decision that keeps paying off throughout this build.

---

## System Architecture

Voice and vision are two independent pipelines that both report into the same C# core, which decides what happens next — and the core never lets the model act directly:

\`\`\`diagram
Hey Jarvis / two claps -> openWakeWord + clap detector -> Silero VAD -> faster-whisper -> C# core
Webcam -> MediaPipe Hand Landmarker -> C# core
C# core -> whitelisted Windows command
C# core -> Ollama (Qwen 3.5 4B) -> Kokoro TTS -> speaker
C# core -> BRAPI quotes / news (only when asked) -> Kokoro TTS -> speaker
\`\`\`

Online tools (market data, news) are called separately from general conversation, so the model can't silently mix guesses with live facts.

---

## Waking It Up: Wake Word, Claps, and Voice Activity Detection

Jarvis listens for two independent triggers, both gated by the same Silero VAD confirmation:

- **"Hey Jarvis"** via openWakeWord, at a 0.50 detection threshold.
- **Two claps**, caught by a transient detector checking peak level, minimum RMS, crest factor, and zero-crossing rate inside a 0.90-second window.

Once triggered, capture allows up to 8 seconds to start speaking and up to 30 seconds per turn, cutting off 650ms after the last detected speech. Transcription runs on **faster-whisper** (\`large-v3-turbo\`, quantized \`int8_float16\`, beam size 5), fixed to Portuguese, with VAD filtering built in.

> [!TIP]
> The clap detector almost had a false-positive problem: an early version fired on noise spikes with a peak near \`0.001\` and RMS near \`0.0002\` — nowhere near a real clap. Requiring crest factor and zero-crossing rate on top of peak/RMS fixed it.

---

## The Brain: Deterministic Commands Before the LLM

Every spoken command goes through a **deterministic resolver first**. If it matches a known action — opening an app, controlling media, reading the time, checking system health — it executes immediately without ever reaching the language model. Only genuinely open-ended questions go to **Ollama**, running **Qwen 3.5 4B** locally.

> [!IMPORTANT]
> Ollama never gets free access to the terminal or filesystem. It can only trigger the fixed set of actions the C# core explicitly allows — nothing is executed directly from a model's output.

4B wasn't the first choice — the smaller 2B variant was faster, but confused C with C++ during testing. 4B answered correctly and, warmed up on an RTX 3060 Ti, took about 1.7 seconds. To feel even faster, replies now stream: Ollama releases the answer sentence by sentence, the HUD renders the partial text live, and the first complete sentence is sent to speech before the rest has even finished generating.

---

## Voice: Why Kokoro Replaced Chatterbox

The first version used **Chatterbox**, a diffusion-based voice-cloning model, for every response. It sounded great but took **4 to 70+ seconds per phrase**, even on GPU — unacceptable for an assistant that's supposed to answer immediately. Several alternatives got benchmarked against the same authorized voice reference:

- **Chatterbox** (CUDA, TF32 off, correct encoding) — cloned voice, but ~4-8s typically, spiking to 20-70s.
- **Piper** — under 1 second, but a rough, robotic accent.
- **XTTS v2** — cloned the voice correctly, but ~11s for a 90-character reply.
- **Fish Speech** — discarded outright: needs 24GB of VRAM, the machine has 8GB.
- **Kokoro** (\`pm_santa\` voice) — fast, but sounded "elderly".
- **Kokoro** (\`pm_alex\` voice) — accepted accent, and a full 4-sentence reply ready in **~1.5 to 4.6 seconds**, even running on CPU.

**Kokoro** (\`kokoro-onnx\`, an 82M-parameter ONNX model) won. It doesn't clone a voice — it uses a fixed pre-trained one — but the latency gap was too large to ignore. Running it on CPU is also deliberate: it frees the GPU's VRAM for speech-to-text, the LLM, and hand tracking. The Chatterbox service and voice reference stayed in the codebase, just no longer called: swapping in \`KokoroSpeechClient\` behind the exact same interface (\`WarmAsync\`/\`SpeakAsync\`/\`CancelAsync\`/\`StopAsync\`) meant nothing else in the app had to change.

---

## A Holographic Cursor: Hand Tracking Beyond Just Watching

Hand tracking isn't a decoration — it drives the interface. A separate Python service runs MediaPipe's **Hand Landmarker** (21 points per hand) over the webcam feed on its own thread, connected to capture by a queue that always drops the stale frame instead of buffering it, so tracking never lags behind the live picture. The index finger becomes a holographic cursor; pinching thumb-to-index picks up and drags HUD panels.

![Jarvis's PROJETOS workspace with a loaded STL model, the piece list sidebar, and the SARC VISION hand-mesh tracking panel in the corner](/projects/jarvis-vision-panel.png)

> [!IMPORTANT]
> Only landmark coordinates and gesture state cross into the HUD. No pixel, frame, or face from the webcam ever leaves the vision service — the hand shown on screen is drawn synthetically on a canvas from the coordinates alone.

---

## SARC Projects: An Offline STL Viewer Inside the HUD

Saying "open project NUB-E" or "open an STL" launches a fully offline 3D viewer built into the HUD, capable of exploding a model into its individual parts with every component labeled and dimensioned, plus a live triangle count and file size. It searches Downloads, the Desktop, and \`Documents\\SARC Projects\` / \`Documents\\JARVIS Models\` for a matching file, falling back to the Windows file picker if nothing matches. Rotation and zoom work with either a pinch gesture or a mouse.

![Jarvis's exploded STL view of an Iron Man-style helmet, with every printed part labeled and dimensioned in millimeters](/projects/jarvis-stl-exploded.png)

---

## Trust Boundaries

A few deliberate constraints keep the assistant predictable:

- **Git/project status is read-only.** "What's the project status?" reports the branch, pending changes, and last commit — it never runs \`commit\`, \`push\`, or \`pull\`.
- **Financial numbers are never invented.** The spoken market briefing is assembled directly from BRAPI's data and its quote timestamp, not phrased by the LLM — if a ticker isn't authorized by the API plan, Jarvis keeps reporting the public quotes it does have instead of answering with nothing.
- **Spotify uses Authorization Code + PKCE.** Only a Client ID is needed — no client secret lives in the app, and the refresh token sits in Windows' secure credential storage.
- **A private local knowledge base never touches Git.** Optional \`.md\`/\`.txt\` files dropped in \`%LocalAppData%\\Jarvis\\knowledge\` let Jarvis answer questions about local, personal context — it automatically picks only the two most relevant documents per question.

---

## Key Takeaways
- **Benchmark actual latency, not demo latency.** Chatterbox's cloned voice sounded better in isolation, but 35-70 second replies make an assistant unusable in practice — Kokoro's plainer accent was the right trade for a 10x speed difference.
- **Never let a language model be the last line of defense.** Every locally-executed action goes through an explicit whitelist in C#; the LLM only ever explains, it doesn't execute.
- **Stream what you can.** Speaking the first sentence while the rest of the answer is still generating makes an assistant feel instant without actually being faster end-to-end.
`,
    },
    pt: {
      title: "Construindo o Jarvis: Um HUD de IA para Desktop 100% Local, no Estilo Homem de Ferro",
      excerpt:
        "Por dentro da arquitetura do Jarvis: comandos determinísticos antes do LLM, por que o Kokoro substituiu o Chatterbox como voz, um cursor holográfico de mão e um visualizador de STL offline — tudo sem nenhuma chamada de nuvem.",
      content: `## Visão Geral

O **Jarvis** é um assistente de IA para desktop inspirado no HUD do Homem de Ferro: uma interface de reator, painéis ao vivo, um cursor holográfico de mão e um visualizador 3D — tudo em torno de um assistente de voz que roda **inteiramente na própria máquina**. Detecção da palavra de ativação, transcrição, o modelo de linguagem e a síntese de voz rodam localmente; só duas funcionalidades explicitamente sem IA (reprodução no Spotify, cotações de ações) tocam a internet, e só quando pedido.

![HUD do Jarvis em standby, mostrando a tela de reator ociosa, o painel do Spotify tocando e a dica de ativação por palma/wake word](/projects/jarvis-standby-hud.png)

> [!NOTE]
> APIs de LLM em nuvem foram testadas no início. A inferência local venceu pela latência, privacidade e por simplesmente não depender de conexão de rede — uma decisão que continua compensando ao longo de todo o projeto.

---

## Arquitetura do Sistema

Voz e visão são dois pipelines independentes que reportam ao mesmo núcleo em C#, que decide o que acontece a seguir — e o núcleo nunca deixa o modelo agir diretamente:

\`\`\`diagram
Hey Jarvis / duas palmas -> openWakeWord + detector de palmas -> Silero VAD -> faster-whisper -> núcleo C#
Webcam -> MediaPipe Hand Landmarker -> núcleo C#
Núcleo C# -> comando Windows autorizado
Núcleo C# -> Ollama (Qwen 3.5 4B) -> Kokoro TTS -> alto-falante
Núcleo C# -> cotações BRAPI / notícias (só quando pedido) -> Kokoro TTS -> alto-falante
\`\`\`

Ferramentas online (dados de mercado, notícias) são chamadas separadamente da conversa geral, então o modelo não consegue misturar silenciosamente um chute com um fato ao vivo.

---

## Ativação: Wake Word, Palmas e Detecção de Voz

O Jarvis escuta dois gatilhos independentes, ambos confirmados pelo mesmo Silero VAD:

- **"Hey Jarvis"** via openWakeWord, com limiar de detecção de 0.50.
- **Duas palmas**, capturadas por um detector de transientes que verifica pico, RMS mínimo, fator de crista e taxa de cruzamento por zero dentro de uma janela de 0.90 segundo.

Depois de ativado, a captura permite até 8 segundos para começar a falar e até 30 segundos por turno, encerrando 650ms após a última fala detectada. A transcrição roda no **faster-whisper** (\`large-v3-turbo\`, quantizado em \`int8_float16\`, beam 5), fixado em português, com filtragem por VAD já embutida.

> [!TIP]
> O detector de palmas quase teve um problema sério de falso positivo: uma versão inicial disparava com picos de ruído perto de \`0.001\` e RMS perto de \`0.0002\` — muito longe de uma palma real. Exigir fator de crista e taxa de cruzamento por zero além de pico/RMS resolveu.

---

## O Cérebro: Comandos Determinísticos Antes do LLM

Todo comando falado passa primeiro por um **resolvedor determinístico**. Se ele corresponde a uma ação conhecida — abrir um app, controlar mídia, dizer as horas, checar a saúde do sistema — executa na hora, sem nunca chegar ao modelo de linguagem. Só perguntas genuinamente abertas vão pro **Ollama**, rodando **Qwen 3.5 4B** localmente.

> [!IMPORTANT]
> O Ollama nunca tem acesso livre ao terminal ou ao sistema de arquivos. Ele só consegue disparar o conjunto fixo de ações que o núcleo em C# permite explicitamente — nada é executado diretamente a partir da saída de um modelo.

O 4B não foi a primeira escolha — a variante 2B, menor, era mais rápida, mas confundiu C com C++ durante os testes. O 4B respondeu corretamente e, já aquecido numa RTX 3060 Ti, levou cerca de 1.7 segundo. Pra parecer ainda mais rápido, as respostas agora chegam em streaming: o Ollama libera a resposta frase por frase, o HUD renderiza o texto parcial ao vivo, e a primeira frase completa já vai pra fala antes mesmo do resto terminar de ser gerado.

---

## Voz: Por Que o Kokoro Substituiu o Chatterbox

A primeira versão usava o **Chatterbox**, um modelo de clonagem de voz por difusão, em toda resposta. Soava ótimo, mas levava **de 4 a mais de 70 segundos por frase**, mesmo em GPU — inaceitável pra um assistente que deveria responder na hora. Várias alternativas foram testadas com a mesma referência de voz autorizada:

- **Chatterbox** (CUDA, TF32 desligado, encoding correto) — voz clonada, mas ~4-8s no geral, com picos de 20-70s.
- **Piper** — menos de 1 segundo, mas sotaque robótico e ruim.
- **XTTS v2** — clonou a voz certa, mas ~11s pra uma resposta de 90 caracteres.
- **Fish Speech** — descartado de cara: exige 24GB de VRAM, a máquina tem 8GB.
- **Kokoro** (voz \`pm_santa\`) — rápido, mas soava "de idoso".
- **Kokoro** (voz \`pm_alex\`) — sotaque aceito, e uma resposta completa de 4 frases pronta em **~1.5 a 4.6 segundos**, mesmo rodando em CPU.

O **Kokoro** (\`kokoro-onnx\`, um modelo ONNX de 82M de parâmetros) venceu. Ele não clona voz — usa uma voz pré-treinada fixa — mas a diferença de latência era grande demais pra ignorar. Rodar em CPU também foi uma escolha consciente: libera a VRAM da GPU pra transcrição, LLM e rastreamento de mão. O serviço do Chatterbox e a referência de voz continuam no código, só pararam de ser chamados: trocar pelo \`KokoroSpeechClient\` atrás da mesma interface (\`WarmAsync\`/\`SpeakAsync\`/\`CancelAsync\`/\`StopAsync\`) fez com que nada mais no app precisasse mudar.

---

## Um Cursor Holográfico: Rastreamento de Mão Além de Só Observar

O rastreamento de mão não é decoração — ele controla a interface. Um serviço Python separado roda o **Hand Landmarker** do MediaPipe (21 pontos por mão) sobre a imagem da webcam, na sua própria thread, conectada à captura por uma fila que sempre descarta o quadro antigo em vez de acumulá-lo, então o rastreamento nunca fica atrasado em relação à imagem ao vivo. O dedo indicador vira um cursor holográfico; a pinça entre polegar e indicador pega e arrasta os painéis do HUD.

![Workspace PROJETOS do Jarvis com um modelo STL carregado, a lista de peças na lateral e o painel SARC VISION de rastreamento de mão no canto](/projects/jarvis-vision-panel.png)

> [!IMPORTANT]
> Só as coordenadas dos pontos e o estado do gesto cruzam pro HUD. Nenhum pixel, frame ou rosto da webcam sai do serviço de visão — a mão mostrada na tela é desenhada de forma sintética num canvas, só a partir das coordenadas.

---

## SARC Projects: Um Visualizador de STL Offline Dentro do HUD

Dizer "abra projeto NUB-E" ou "abra um STL" abre um visualizador 3D totalmente offline embutido no HUD, capaz de explodir um modelo em peças individuais com cada componente nomeado e dimensionado, além de contagem de triângulos e tamanho do arquivo ao vivo. Ele procura por um arquivo correspondente em Downloads, na Área de Trabalho e em \`Documentos\\SARC Projects\` / \`Documentos\\JARVIS Models\`, e recorre ao seletor de arquivos do Windows se nada for encontrado. Rotação e zoom funcionam tanto por pinça quanto por mouse.

![Visão explodida em STL de um capacete estilo Homem de Ferro no Jarvis, com cada peça impressa nomeada e dimensionada em milímetros](/projects/jarvis-stl-exploded.png)

---

## Limites de Confiança

Algumas restrições deliberadas mantêm o assistente previsível:

- **Status do Git/projeto é somente leitura.** "Qual o status do projeto?" informa a branch, alterações pendentes e último commit — nunca executa \`commit\`, \`push\` ou \`pull\`.
- **Números financeiros nunca são inventados.** O briefing de mercado falado é montado direto a partir dos dados da BRAPI e do horário da cotação, não formulado pelo LLM — se um ticker não é autorizado pelo plano da API, o Jarvis continua informando as cotações públicas que tem em vez de responder sem dado nenhum.
- **O Spotify usa Authorization Code + PKCE.** Só é preciso um Client ID — nenhum client secret vive no app, e o refresh token fica no armazenamento seguro de credenciais do Windows.
- **Uma base de conhecimento local privada nunca toca o Git.** Arquivos opcionais \`.md\`/\`.txt\` colocados em \`%LocalAppData%\\Jarvis\\knowledge\` deixam o Jarvis responder perguntas sobre contexto local e pessoal — ele seleciona automaticamente só os dois documentos mais relevantes pra cada pergunta.

---

## Principais Aprendizados
- **Meça a latência real, não a latência de demonstração.** A voz clonada do Chatterbox soava melhor isolada, mas respostas de 35-70 segundos tornam um assistente inutilizável na prática — o sotaque mais simples do Kokoro foi a troca certa por uma diferença de 10x na velocidade.
- **Nunca deixe um modelo de linguagem ser a última linha de defesa.** Toda ação executada localmente passa por uma lista explícita de permissões em C#; o LLM só explica, nunca executa.
- **Coloque em streaming o que der.** Falar a primeira frase enquanto o resto da resposta ainda está sendo gerado faz o assistente parecer instantâneo sem de fato ser mais rápido de ponta a ponta.
`,
    },
    es: {
      title: "Construyendo Jarvis: un HUD de IA de Escritorio 100% Local, al Estilo Iron Man",
      excerpt:
        "Por dentro de la arquitectura de Jarvis: comandos determinísticos antes del LLM, por qué Kokoro reemplazó a Chatterbox como voz, un cursor holográfico de mano y un visor de STL offline — todo sin ninguna llamada a la nube.",
      content: `## Visión General

**Jarvis** es un asistente de IA de escritorio inspirado en el HUD de Iron Man: una interfaz de reactor, paneles en vivo, un cursor holográfico de mano y un visor 3D — todo alrededor de un asistente de voz que corre **enteramente en la propia máquina**. La detección de la palabra de activación, la transcripción, el modelo de lenguaje y la síntesis de voz corren localmente; solo un par de funciones explícitamente sin IA (reproducción en Spotify, cotizaciones) tocan internet, y solo cuando se les pide.

![HUD de Jarvis en standby, mostrando la pantalla de reactor inactiva, el panel de Spotify reproduciendo y la pista de activación por palmada/wake word](/projects/jarvis-standby-hud.png)

> [!NOTE]
> Se probaron APIs de LLM en la nube al principio. La inferencia local ganó por la latencia, la privacidad y por simplemente no depender de una conexión de red — una decisión que sigue dando resultado a lo largo de todo el proyecto.

---

## Arquitectura del Sistema

Voz y visión son dos pipelines independientes que reportan al mismo núcleo en C#, que decide qué pasa después — y el núcleo nunca deja que el modelo actúe directamente:

\`\`\`diagram
Hey Jarvis / dos palmadas -> openWakeWord + detector de palmadas -> Silero VAD -> faster-whisper -> núcleo C#
Webcam -> MediaPipe Hand Landmarker -> núcleo C#
Núcleo C# -> comando de Windows autorizado
Núcleo C# -> Ollama (Qwen 3.5 4B) -> Kokoro TTS -> altavoz
Núcleo C# -> cotizaciones BRAPI / noticias (solo si se pide) -> Kokoro TTS -> altavoz
\`\`\`

Las herramientas en línea (datos de mercado, noticias) se llaman por separado de la conversación general, así el modelo no puede mezclar en silencio una suposición con un hecho en vivo.

---

## Activación: Palabra Clave, Palmadas y Detección de Voz

Jarvis escucha dos disparadores independientes, ambos confirmados por el mismo Silero VAD:

- **"Hey Jarvis"** vía openWakeWord, con un umbral de detección de 0.50.
- **Dos palmadas**, capturadas por un detector de transitorios que verifica pico, RMS mínimo, factor de cresta y tasa de cruce por cero dentro de una ventana de 0.90 segundos.

Una vez activado, la captura permite hasta 8 segundos para empezar a hablar y hasta 30 segundos por turno, cortando 650ms después del último habla detectado. La transcripción corre en **faster-whisper** (\`large-v3-turbo\`, cuantizado en \`int8_float16\`, beam 5), fijo en portugués, con filtrado VAD incorporado.

> [!TIP]
> El detector de palmadas casi tuvo un problema serio de falsos positivos: una versión inicial se disparaba con picos de ruido cerca de \`0.001\` y RMS cerca de \`0.0002\` — muy lejos de una palmada real. Exigir factor de cresta y tasa de cruce por cero además de pico/RMS lo solucionó.

---

## El Cerebro: Comandos Determinísticos Antes del LLM

Cada comando hablado pasa primero por un **resolvedor determinístico**. Si coincide con una acción conocida —abrir una app, controlar la reproducción, decir la hora, revisar la salud del sistema— se ejecuta de inmediato, sin llegar nunca al modelo de lenguaje. Solo las preguntas genuinamente abiertas van a **Ollama**, ejecutando **Qwen 3.5 4B** localmente.

> [!IMPORTANT]
> Ollama nunca tiene acceso libre a la terminal ni al sistema de archivos. Solo puede disparar el conjunto fijo de acciones que el núcleo en C# permite explícitamente — nada se ejecuta directamente desde la salida de un modelo.

El 4B no fue la primera opción — la variante 2B, más pequeña, era más rápida, pero confundió C con C++ durante las pruebas. El 4B respondió correctamente y, ya calentado en una RTX 3060 Ti, tardó cerca de 1.7 segundos. Para sentirse aún más rápido, las respuestas ahora llegan en streaming: Ollama libera la respuesta frase por frase, el HUD renderiza el texto parcial en vivo, y la primera frase completa ya va a voz antes de que el resto termine de generarse.

---

## Voz: Por Qué Kokoro Reemplazó a Chatterbox

La primera versión usaba **Chatterbox**, un modelo de clonación de voz por difusión, en cada respuesta. Sonaba genial, pero tardaba **de 4 a más de 70 segundos por frase**, incluso en GPU — inaceptable para un asistente que debería responder al instante. Se probaron varias alternativas con la misma referencia de voz autorizada:

- **Chatterbox** (CUDA, TF32 desactivado, encoding correcto) — voz clonada, pero ~4-8s en general, con picos de 20-70s.
- **Piper** — menos de 1 segundo, pero acento robótico y tosco.
- **XTTS v2** — clonó la voz correcta, pero ~11s para una respuesta de 90 caracteres.
- **Fish Speech** — descartado de entrada: necesita 24GB de VRAM, la máquina tiene 8GB.
- **Kokoro** (voz \`pm_santa\`) — rápido, pero sonaba "anciano".
- **Kokoro** (voz \`pm_alex\`) — acento aceptado, y una respuesta completa de 4 frases lista en **~1.5 a 4.6 segundos**, incluso corriendo en CPU.

**Kokoro** (\`kokoro-onnx\`, un modelo ONNX de 82M de parámetros) ganó. No clona una voz — usa una voz pre-entrenada fija— pero la diferencia de latencia era demasiado grande para ignorarla. Ejecutarlo en CPU también fue una decisión deliberada: libera la VRAM de la GPU para la transcripción, el LLM y el seguimiento de manos. El servicio de Chatterbox y la referencia de voz se quedaron en el código, solo dejaron de llamarse: reemplazar por \`KokoroSpeechClient\` detrás de la misma interfaz (\`WarmAsync\`/\`SpeakAsync\`/\`CancelAsync\`/\`StopAsync\`) hizo que nada más en la app tuviera que cambiar.

---

## Un Cursor Holográfico: Seguimiento de Manos Más Allá de Solo Observar

El seguimiento de manos no es decoración — controla la interfaz. Un servicio Python aparte ejecuta el **Hand Landmarker** de MediaPipe (21 puntos por mano) sobre la imagen de la webcam, en su propio hilo, conectado a la captura por una cola que siempre descarta el fotograma antiguo en vez de acumularlo, así el seguimiento nunca va a la zaga de la imagen en vivo. El dedo índice se convierte en un cursor holográfico; la pinza entre pulgar e índice toma y arrastra los paneles del HUD.

![Espacio de trabajo PROJETOS de Jarvis con un modelo STL cargado, la lista de piezas al costado y el panel SARC VISION de seguimiento de manos en la esquina](/projects/jarvis-vision-panel.png)

> [!IMPORTANT]
> Solo las coordenadas de los puntos y el estado del gesto cruzan hacia el HUD. Ningún píxel, fotograma o rostro de la webcam sale jamás del servicio de visión — la mano que se ve en pantalla se dibuja de forma sintética en un canvas, solo a partir de las coordenadas.

---

## SARC Projects: Un Visor de STL Offline Dentro del HUD

Decir "abre proyecto NUB-E" o "abre un STL" lanza un visor 3D totalmente offline integrado en el HUD, capaz de explosionar un modelo en piezas individuales con cada componente nombrado y con sus dimensiones, más un conteo de triángulos y tamaño de archivo en vivo. Busca un archivo coincidente en Descargas, el Escritorio y \`Documentos\\SARC Projects\` / \`Documentos\\JARVIS Models\`, y recurre al selector de archivos de Windows si no encuentra nada. La rotación y el zoom funcionan tanto con un gesto de pinza como con el mouse.

![Vista explosionada en STL de un casco estilo Iron Man en Jarvis, con cada pieza impresa nombrada y dimensionada en milímetros](/projects/jarvis-stl-exploded.png)

---

## Límites de Confianza

Algunas restricciones deliberadas mantienen al asistente predecible:

- **El estado de Git/proyecto es solo lectura.** "¿Cuál es el estado del proyecto?" informa la rama, cambios pendientes y el último commit — nunca ejecuta \`commit\`, \`push\` ni \`pull\`.
- **Los números financieros nunca se inventan.** El briefing de mercado hablado se arma directamente con los datos de BRAPI y su hora de cotización, no lo redacta el LLM — si un ticker no está autorizado por el plan de la API, Jarvis sigue informando las cotizaciones públicas que sí tiene en vez de responder sin datos.
- **Spotify usa Authorization Code + PKCE.** Solo se necesita un Client ID — ningún client secret vive en la app, y el refresh token queda en el almacenamiento seguro de credenciales de Windows.
- **Una base de conocimiento local privada nunca toca Git.** Archivos opcionales \`.md\`/\`.txt\` colocados en \`%LocalAppData%\\Jarvis\\knowledge\` dejan que Jarvis responda preguntas sobre contexto local y personal — selecciona automáticamente solo los dos documentos más relevantes por pregunta.

---

## Conclusiones Clave
- **Mide la latencia real, no la de demo.** La voz clonada de Chatterbox sonaba mejor aislada, pero respuestas de 35-70 segundos hacen que un asistente sea inutilizable en la práctica — el acento más simple de Kokoro fue el cambio correcto por una diferencia de velocidad de 10x.
- **Nunca dejes que un modelo de lenguaje sea la última línea de defensa.** Toda acción ejecutada localmente pasa por una lista explícita de permisos en C#; el LLM solo explica, nunca ejecuta.
- **Pon en streaming lo que puedas.** Decir la primera frase mientras el resto de la respuesta todavía se está generando hace que el asistente se sienta instantáneo sin serlo realmente de punta a punta.
`,
    },
  },
];

export type LocalizedNote = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readingTime: string;
  category: NoteCategory;
  tags: string[];
  coverImage?: string;
  featured?: boolean;
};

export function getLocalizedNote(note: Note, lang: Language): LocalizedNote {
  const noteContent = note[lang] || note.en;
  return {
    slug: note.slug,
    title: noteContent.title,
    excerpt: noteContent.excerpt,
    content: noteContent.content,
    date: note.date,
    readingTime: note.readingTime,
    category: note.category,
    tags: note.tags,
    coverImage: note.coverImage,
    featured: note.featured,
  };
}

export function getNoteBySlug(slug: string, lang: Language = "en"): LocalizedNote | undefined {
  const normalized = slug.toLowerCase().replace(/\\.html$/, "");
  const found = notes.find((n) => n.slug.toLowerCase() === normalized);
  if (!found) return undefined;
  return getLocalizedNote(found, lang);
}

export function getAllLocalizedNotes(lang: Language = "en"): LocalizedNote[] {
  return notes.map((n) => getLocalizedNote(n, lang));
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet);
}

export function estimateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
