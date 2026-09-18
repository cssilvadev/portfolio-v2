export const noteContent = {
  en: `## Introduction to Quadruped Leg Geometry

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
  pt: `## Introdução à Geometria da Perna Quadrúpede

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
  es: `## Introducción a la Geometría de Patas Cuadrúpedas

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
} as const;

