import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Snowflake, ShoppingCart, Truck, Award } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-white/10 glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Snowflake className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Heladería Nevado</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/products")}
            >
              Productos
            </Button>
            <Button
              variant="ghost"
              onClick={() => setLocation("/contact")}
            >
              Contacto
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/cart")}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Carrito
                </Button>
                <Button
                  variant="default"
                  onClick={() => setLocation("/profile")}
                >
                  Mi Perfil
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                onClick={() => setLocation("/login")}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-20 bg-mesh">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Helados Artesanales de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Calidad Premium</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Disfruta de nuestros deliciosos helados elaborados con ingredientes naturales y recetas exclusivas. Entrega rápida en Huaraz y alrededores.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/products")}
              >
                Ver Catálogo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/contact")}
              >
                Contáctanos
              </Button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center text-white text-6xl shadow-epic hover-lift">
            🍦
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">¿Por qué elegir Nevado?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Award className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Calidad Garantizada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Helados artesanales con ingredientes naturales y recetas exclusivas elaboradas con cuidado.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Entrega Rápida</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Entrega a domicilio en Huaraz y áreas circundantes. Tus helados llegarán frescos y deliciosos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>Compra Fácil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Plataforma segura y fácil de usar. Múltiples opciones de pago para tu comodidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white py-16 shadow-epic">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">¿Listo para disfrutar?</h3>
          <p className="text-lg mb-8 opacity-90">
            Explora nuestro catálogo de helados y haz tu pedido ahora.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setLocation("/products")}
          >
            Ir al Catálogo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-gray-400 dark:text-gray-500 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white dark:text-gray-100 font-bold mb-4">Heladería Nevado</h4>
              <p className="text-sm">Helados artesanales de calidad premium en Huaraz.</p>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-bold mb-4">Enlaces</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200">Productos</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200">Contacto</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200">Términos</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-bold mb-4">Contacto</h4>
              <ul className="text-sm space-y-2">
                <li>📞 +51 943 123 456</li>
                <li>📧 info@nevado.pe</li>
                <li>📍 Huaraz, Perú</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white dark:text-gray-100 font-bold mb-4">Síguenos</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200">Facebook</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200">Instagram</a></li>
                <li><a href="#" className="hover:text-white dark:hover:text-gray-200">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Heladería Nevado. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
