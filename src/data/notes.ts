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

The goal of **Inverse Kinematics (IK)** is to calculate the 3 joint angles \((\\theta_1, \\theta_2, \\theta_3)\) required to position the foot at target coordinate \((x, y, z)\) relative to the hip frame.

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

O objetivo da **Cinemática Inversa (IK)** é calcular os 3 ângulos das articulações \((\\theta_1, \\theta_2, \\theta_3)\) necessários para posicionar a ponta do pé na coordenada alvo \((x, y, z)\) em relação à base do quadril.

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

El objetivo de la **Cinemática Inversa (IK)** es calcular los 3 ángulos articulares \((\\theta_1, \\theta_2, \\theta_3)\) necesarios para situar el pie en la coordenada objetivo \((x, y, z)\) respecto al origen de la cadera.

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
