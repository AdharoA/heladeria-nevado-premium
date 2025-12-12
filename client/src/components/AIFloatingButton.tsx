
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import AIChatModal from "./AIChatModal";

export default function AIFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-epic hover-lift flex items-center justify-center z-40 animate-pulse hover:animate-none transition-transform active:scale-95"
        title="Abrir asistente de IA"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
