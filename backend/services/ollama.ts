/**
 * Servicio para conectar con Ollama y usar el modelo deepseek-r1:8b
 * Asegúrate de tener Ollama instalado y corriendo en http://localhost:11434
 */

interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
}

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gpt-oss:20b";

/**
 * Enviar mensaje a Ollama y obtener respuesta
 */
export async function chatWithOllama(
  messages: OllamaMessage[],
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  }
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          top_p: options?.top_p || 0.9,
          top_k: options?.top_k || 40,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Error connecting to Ollama:", error);
    throw new Error("No se pudo conectar con el modelo de IA. Asegúrate de que Ollama está ejecutándose.");
  }
}

/**
 * Generar respuesta contextual para ADARA
 */
export async function generateADARAResponse(
  userMessage: string,
  context: string = "general",
  conversationHistory: OllamaMessage[] = []
): Promise<string> {
  // Construir el prompt del sistema
  let systemPrompt = `Eres ADARA, la Amiga Digital de Atención y Recomendación Avanzada de Heladería Nevado.
Tu personalidad es amigable, entusiasta y siempre dispuesta a ayudar.
Eres experta en helados, recomendaciones personalizadas y atención al cliente.
Siempre responde en español y de manera conversacional y natural.
Puedes hacer recomendaciones de productos basadas en las preferencias del usuario.
Si el usuario pregunta sobre pedidos, direcciones o cuenta, ayuda de manera empática.
Mantén respuestas concisas (máximo 2-3 párrafos).
Usa emojis ocasionalmente para hacer la conversación más amigable.`;

  // Agregar contexto específico
  if (context === "products") {
    systemPrompt += `\nEl usuario está navegando el catálogo de productos. Puedes ayudar a encontrar helados específicos, explicar sabores, o hacer recomendaciones.`;
  } else if (context === "cart") {
    systemPrompt += `\nEl usuario está en su carrito de compras. Puedes ayudar a completar la compra, sugerir productos complementarios, o responder preguntas sobre el pedido.`;
  } else if (context === "checkout") {
    systemPrompt += `\nEl usuario está realizando un pedido. Sé empática y ayuda a completar el proceso de compra de manera rápida.`;
  } else if (context === "profile") {
    systemPrompt += `\nEl usuario está en su perfil. Puedes ayudar con información de cuenta, pedidos anteriores, o direcciones guardadas.`;
  }

  // Construir el historial de mensajes
  const messages: OllamaMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  try {
    const response = await chatWithOllama(messages, {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 40,
    });

    return response;
  } catch (error) {
    console.error("Error generating ADARA response:", error);
    // Respuesta fallback si Ollama no está disponible
    return "Disculpa, estoy teniendo dificultades en este momento. Por favor, intenta de nuevo más tarde. 😊";
  }
}

/**
 * Verificar si Ollama está disponible
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`, {
      method: "GET",
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.error("Ollama is not available:", error);
    return false;
  }
}

/**
 * Obtener lista de modelos disponibles en Ollama
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}
