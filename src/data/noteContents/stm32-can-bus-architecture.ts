export const noteContent = {
  en: `## Overview

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
  pt: `## Visão Geral

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
  es: `## Descripción General

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
} as const;

