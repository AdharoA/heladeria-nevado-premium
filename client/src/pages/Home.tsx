import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Snowflake, ShoppingCart, Truck, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: posts } = trpc.posts.list.useQuery({ publishedOnly: true });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">


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


      {/* Posts/Banners Section */}
      {
        posts && posts.length > 0 && (
          <section className="py-12 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-8">Novedades y Promociones</h2>
              <div className="space-y-12 max-w-6xl mx-auto">
                {posts.map((post) => {
                  // Parse images from JSON string if needed
                  let images: string[] = [];
                  try {
                    if (typeof post.images === 'string') {
                      images = JSON.parse(post.images);
                    } else if (Array.isArray(post.images)) {
                      images = post.images;
                    }
                  } catch (e) {
                    console.error('Error parsing post images:', e);
                    images = [];
                  }
                  const layout = post.layout || 'carousel';

                  if (layout === 'carousel') {
                    return (
                      <Carousel key={post.id} className="w-full">
                        <CarouselContent>
                          {images.map((img, idx) => (
                            <CarouselItem key={idx}>
                              <Card className="overflow-hidden border-0 shadow-lg">
                                <CardContent className="p-0 relative aspect-video">
                                  <img 
                                    src={img} 
                                    alt={`${post.title} ${idx + 1}`} 
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    width={600}
                                    height={400}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                                    <h4 className="text-2xl font-bold mb-2">{post.title}</h4>
                                    {post.content && <p className="text-sm opacity-90">{post.content}</p>}
                                  </div>
                                </CardContent>
                              </Card>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {images.length > 1 && (
                          <>
                            <CarouselPrevious />
                            <CarouselNext />
                          </>
                        )}
                      </Carousel>
                    );
                  }

                  if (layout === 'side_by_side') {
                    return (
                      <Card key={post.id} className="overflow-hidden shadow-lg">
                        <CardContent className="p-0">
                          <div className="grid md:grid-cols-2 gap-0">
                            <div className="relative aspect-square">
                              {images[0] ? (
                                <img src={images[0]} alt={post.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-6xl">
                                  🍦
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center p-8 bg-gray-50 dark:bg-slate-800">
                              <h4 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{post.title}</h4>
                              {post.content && (
                                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                  {post.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  if (layout === 'collage') {
                    return (
                      <Card key={post.id} className="overflow-hidden shadow-lg">
                        <CardContent className="p-6">
                          <h4 className="text-2xl font-bold text-center mb-2">{post.title}</h4>
                          {post.content && <p className="text-center text-muted-foreground mb-4">{post.content}</p>}
                          <div className="grid grid-cols-2 gap-2">
                            {images.slice(0, 4).map((img, idx) => (
                              <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                                <img src={img} alt={`${post.title} ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {[...Array(Math.max(0, 4 - images.length))].map((_, idx) => (
                              <div key={`empty-${idx}`} className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl">
                                🍦
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </section>
        )
      }
      {/* About Us Section */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <img
                src="https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&q=80&w=800"
                alt="Nuestra Historia"
                className="rounded-lg shadow-xl"
                loading="lazy"
                width={600}
                height={400}
              />
            </div>
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nuestra Historia</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Heladería Nevado Premium nació en el corazón de Huaraz con una misión simple: crear los helados más deliciosos utilizando los mejores ingredientes locales.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Desde nuestros inicios, nos hemos comprometido con la calidad y la innovación, fusionando sabores tradicionales con técnicas modernas para ofrecerte una experiencia única en cada bocado.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-400 mb-1">10+</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Años de Experiencia</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-3xl font-bold text-purple-800 dark:text-purple-400 mb-1">50+</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">Sabores Únicos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir Nevado?</h2>
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
          <h2 className="text-3xl font-bold mb-4">¿Listo para disfrutar?</h2>
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
                <li><a href="/products" className="hover:text-white dark:hover:text-gray-200">Productos</a></li>
                <li><a href="/contact" className="hover:text-white dark:hover:text-gray-200">Contacto</a></li>
                <li><a href="#terms" className="hover:text-white dark:hover:text-gray-200">Términos</a></li>
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
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white dark:hover:text-gray-200">Facebook</a></li>
                <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white dark:hover:text-gray-200">Instagram</a></li>
                <li><a href="https://wa.me/51943123456" target="_blank" rel="noopener noreferrer" className="hover:text-white dark:hover:text-gray-200">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Heladería Nevado. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div >
  );
}
