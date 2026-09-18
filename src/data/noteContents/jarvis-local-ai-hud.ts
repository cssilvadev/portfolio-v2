export const noteContent = {
  en: `## Overview

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
  pt: `## Visão Geral

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
  es: `## Visión General

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
} as const;

