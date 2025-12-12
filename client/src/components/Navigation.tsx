import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Snowflake, Moon, Sun, LogOut, ShoppingCart, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useSettings } from "@/_core/hooks/useSettings";

function CartCount() {
  const { data: cartItems } = trpc.cart.list.useQuery();
  const count = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  if (count === 0) return null;

  return (
    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {count}
    </span>
  );
}

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const { getSetting } = useSettings();

  const logo = getSetting("site_logo");
  const companyName = getSetting("company_name") || "Heladería Nevado";

  return (
    <nav className="border-b border-gray-200 dark:border-white/10 glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer hover-lift"
          onClick={() => setLocation("/")}
        >
          {logo ? (
            <img src={logo} alt={companyName} className="w-8 h-8 object-contain" />
          ) : (
            <Snowflake className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {companyName}
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
            onClick={() => setLocation("/location")}
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Ubicación
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => setLocation("/admin")}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Admin
            </button>
          )}
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
            aria-label="Ver carrito de compras"
            title="Carrito"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {isAuthenticated && (
              <CartCount />
            )}
          </button>

          {/* Autenticación */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/profile")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name || "Profile"}
                    className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
                    onError={(e) => {
                      // Fallback to initials if image fails
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold ${user?.profilePicture ? 'hidden' : ''}`}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="font-medium text-gray-900 dark:text-white hidden md:inline">
                  {user?.name?.split(" ")[0] || "Perfil"}
                </span>
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
            <a>
              <Button
                variant="default"
                onClick={() => setLocation("/dev-login")}
              >
                Iniciar Sesión
              </Button>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
