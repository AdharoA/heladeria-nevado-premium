import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles, Mic, Volume2, VolumeX } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function AdaraWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
        { role: "assistant", content: "¡Hola! Soy Adara, tu asistente virtual. ¿En qué puedo ayudarte hoy?" }
    ]);
    const [location] = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    const chatMutation = trpc.ai.chat.useMutation({
        onSuccess: (data) => {
            setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
            if (voiceEnabled) {
                speak(data.response);
            }
        },
        onError: () => {
            const errorMsg = "Lo siento, tuve un problema al procesar tu mensaje.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }]);
            if (voiceEnabled) {
                speak(errorMsg);
            }
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;

        // Cancel previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            // Optional: Auto-send
            // handleSend(transcript); 
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    const handleSend = (textOverride?: string) => {
        const textToSend = textOverride || message;
        if (!textToSend.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
        setMessage("");

        let context = location;
        if (location.startsWith("/admin")) {
            context = "El usuario es el ADMINISTRADOR y está en el panel de control. Ayúdalo con resúmenes de ventas, stock y gestión.";
        }

        chatMutation.mutate({ message: textToSend, context });
    };

    return (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
            {isOpen && (
                <div className="w-80 h-96 mb-4 shadow-2xl rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col bg-white dark:bg-gray-950">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex flex-row justify-between items-center shrink-0">
                        <div className="text-lg font-semibold flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Adara AI
                        </div>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8"
                                onClick={() => {
                                    setVoiceEnabled(!voiceEnabled);
                                    if (isSpeaking) window.speechSynthesis.cancel();
                                }}
                                title={voiceEnabled ? "Desactivar voz" : "Activar voz"}
                            >
                                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-0">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm break-words ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {chatMutation.isPending && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-bl-none">
                                    <span className="animate-pulse">Escribiendo...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Footer */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 flex gap-2 shrink-0">
                        <Button
                            size="icon"
                            variant={isListening ? "destructive" : "secondary"}
                            onClick={startListening}
                            className={isListening ? "animate-pulse" : ""}
                            title="Hablar"
                        >
                            <Mic className="w-4 h-4" />
                        </Button>
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Escribe un mensaje..."
                            className="flex-1"
                        />
                        <Button size="icon" onClick={() => handleSend()} disabled={chatMutation.isPending}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            <Button
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-110 transition-transform"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Cerrar asistente" : "Abrir asistente de IA"}
                title={isOpen ? "Cerrar" : "Asistente IA"}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </Button>
        </div>
    );
}
