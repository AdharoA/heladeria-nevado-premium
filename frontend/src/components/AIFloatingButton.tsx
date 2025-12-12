import { useLocation } from "wouter";
import { MessageCircle } from "lucide-react";

export default function AIFloatingButton() {
  const [, setLocation] = useLocation();

  return (
    <button
      onClick={() => setLocation("/ai-assistant")}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-epic hover-lift flex items-center justify-center z-40 animate-pulse"
      title="Abrir asistente de IA"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
