import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Snowflake, Moon, Sun, LogOut, ShoppingCart, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  return (
    <nav className="border-b border-gray-200 dark:border-white/10 glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer hover-lift"
          onClick={() => setLocation("/")}
        >
          <Snowflake className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Heladería Nevado
          </h1>
        </div>

        {/* Menu Central */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setLocation("/products")}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Productos
          </button>
          <button
            onClick={() => setLocation("/contact")}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Contacto
          </button>
          <button
            onClick={() => setLocation("/ai-assistant")}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            IA
          </button>
        </div>

        {/* Acciones Derecha */}
        <div className="flex items-center gap-4">
          {/* Botón de Tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title={theme === "light" ? "Modo oscuro" : "Modo claro"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-gray-700" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </button>

          {/* Carrito */}
          <button
            onClick={() => setLocation("/cart")}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </button>

          {/* Autenticación */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/profile")}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                {user?.name?.split(" ")[0] || "Perfil"}
              </button>
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Iniciar Sesión
              </Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
