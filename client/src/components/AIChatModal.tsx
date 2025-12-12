
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageCircle, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface AIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "¡Hola! Soy el asistente de Heladería Nevado. 🍦\n¿En qué puedo ayudarte hoy?",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: products } = trpc.products.list.useQuery({ limit: 20 });
    const chatMutation = trpc.ai.chat.useMutation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const buildContext = () => {
        let context = "Eres un asistente amable de 'Heladería Nevado'. ";
        if (products && products.length > 0) {
            context += "Tenemos estos productos: " + products.map(p => `${p.name} (S/ ${p.price / 100})`).join(", ") + ". ";
        }
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

        try {
            const result = await chatMutation.mutateAsync({
                message: inputValue,
                context: buildContext(),
            });

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: result.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            toast.error("Error al conectar con el asistente");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 z-50 shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300 h-[600px]">
            <div className="h-full w-full flex flex-col bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex flex-row items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-base font-semibold">
                        <MessageCircle className="w-5 h-5" />
                        Asistente Nevado
                    </div>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Messages Area with scroll */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900 min-h-0">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${message.role === "user"
                                    ? "bg-blue-600 text-white rounded-br-none"
                                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none"
                                    }`}
                            >
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    {chatMutation.isPending && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg rounded-bl-none">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                    <div className="flex gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe un mensaje..."
                            disabled={chatMutation.isPending}
                            className="flex-1 bg-white dark:bg-gray-700 focus-visible:ring-1"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={chatMutation.isPending || !inputValue.trim()}
                            size="icon"
                            className="bg-blue-600 hover:bg-blue-700 shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
