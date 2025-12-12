import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Snowflake, Send, Loader2, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "¡Hola! Soy el asistente de Heladería Nevado. Puedo ayudarte a:\n\n• Recomendar productos según tus gustos\n• Responder preguntas sobre nuestros helados\n• Ayudarte con tu pedido\n• Sugerir combinaciones especiales\n\n¿En qué puedo ayudarte?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: products } = trpc.products.list.useQuery({ limit: 100 });
  const { data: categories } = trpc.categories.list.useQuery();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContextPrompt = () => {
    let context = "Eres un asistente amable de una heladería llamada 'Heladería Nevado' ubicada en Huaraz, Perú. ";
    context += "Tienes acceso a la siguiente información:\n\n";

    if (categories && categories.length > 0) {
      context += "CATEGORÍAS DE PRODUCTOS:\n";
      categories.forEach((cat) => {
        context += `- ${cat.name}: ${cat.description || "Helados especiales"}\n`;
      });
      context += "\n";
    }

    if (products && products.length > 0) {
      context += "PRODUCTOS DISPONIBLES:\n";
      products.slice(0, 10).forEach((prod) => {
        context += `- ${prod.name}: S/ ${(prod.price / 100).toFixed(2)} - ${prod.description}\n`;
      });
      context += "\n";
    }

    context += "Tu objetivo es:\n";
    context += "1. Ser amable y entusiasta\n";
    context += "2. Recomendar productos basado en preferencias del usuario\n";
    context += "3. Responder preguntas sobre helados, sabores y promociones\n";
    context += "4. Ayudar con información de pedidos y envíos\n";
    context += "5. Sugerir combinaciones especiales\n";
    context += "6. Mantener conversaciones naturales en español\n";

    return context;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Simular respuesta del asistente de IA
      // En producción, esto llamaría a un endpoint real de IA
      const contextPrompt = buildContextPrompt();
      const userQuery = inputValue;

      // Aquí iría la llamada real a la API de IA
      // Por ahora, simulamos respuestas inteligentes
      let assistantResponse = "";

      if (
        userQuery.toLowerCase().includes("recomend") ||
        userQuery.toLowerCase().includes("sugerir")
      ) {
        assistantResponse =
          "¡Excelente pregunta! Basándome en nuestro catálogo, te recomiendo probar nuestros helados más populares. ¿Prefieres sabores clásicos como vainilla y chocolate, o te gustaría probar algo más aventurero como nuestros sabores especiales? 🍦";
      } else if (
        userQuery.toLowerCase().includes("precio") ||
        userQuery.toLowerCase().includes("costo")
      ) {
        assistantResponse =
          "Nuestros helados tienen precios muy competitivos. Puedes ver todos nuestros productos y sus precios en la sección de catálogo. ¿Te gustaría que te ayude a encontrar algo específico? 💰";
      } else if (
        userQuery.toLowerCase().includes("entrega") ||
        userQuery.toLowerCase().includes("envío")
      ) {
        assistantResponse =
          "Realizamos entregas rápidas en Huaraz y áreas circundantes. Nuestro tiempo de entrega es de 30-45 minutos. ¿Necesitas más información sobre nuestros servicios de entrega? 🚚";
      } else if (
        userQuery.toLowerCase().includes("sabor") ||
        userQuery.toLowerCase().includes("chocolate") ||
        userQuery.toLowerCase().includes("vainilla")
      ) {
        assistantResponse =
          "¡Excelente elección! Tenemos una variedad de sabores deliciosos. Nuestros helados se preparan con ingredientes naturales de alta calidad. ¿Hay algún sabor específico que te gustaría conocer más? 🍫";
      } else if (
        userQuery.toLowerCase().includes("contacto") ||
        userQuery.toLowerCase().includes("teléfono")
      ) {
        assistantResponse =
          "Puedes contactarnos por:\n📞 Teléfono: +51 943 123 456\n📧 Email: info@nevado.pe\n💬 WhatsApp: https://wa.me/51943123456\n\n¿Hay algo más en lo que pueda ayudarte?";
      } else if (
        userQuery.toLowerCase().includes("pedido") ||
        userQuery.toLowerCase().includes("orden")
      ) {
        assistantResponse =
          "Para hacer un pedido, simplemente:\n1. Explora nuestro catálogo de productos\n2. Agrega los productos a tu carrito\n3. Procede al checkout\n4. Selecciona tu dirección de entrega\n5. Elige tu método de pago\n\n¿Necesitas ayuda con algún paso específico?";
      } else {
        assistantResponse =
          "¡Gracias por tu pregunta! Soy el asistente de Heladería Nevado. Puedo ayudarte con información sobre nuestros productos, precios, entregas y más. ¿Hay algo específico que quieras saber? 😊";
      }

      // Simular delay de respuesta
      await new Promise((resolve) => setTimeout(resolve, 800));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Error al procesar tu mensaje");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Snowflake className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Heladería Nevado</h1>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            Volver al Inicio
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Asistente de IA - Heladería Nevado
              </CardTitle>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user" ? "text-blue-100" : "text-gray-600"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString("es-PE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setInputValue("Recomiéndame un helado");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              Recomendaciones
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputValue("¿Cuál es el horario de entrega?");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              Horarios
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputValue("¿Cuáles son tus sabores especiales?");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              Sabores
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInputValue("¿Cómo hago un pedido?");
                setTimeout(() => handleSendMessage(), 100);
              }}
            >
              Cómo Comprar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
