import React, { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Snowflake, Search, ShoppingCart, Star, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

type SortOption = "default" | "rating" | "price_asc" | "price_desc";

export default function Products() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery({
    categoryId: selectedCategory,
    search: searchQuery || undefined,
  });

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Producto agregado al carrito");
    },
    onError: (error) => {
      toast.error(error.message || "Error al agregar al carrito");
    },
  });

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      setLocation("/dev-login");
      return;
    }
    addToCartMutation.mutate({ productId, quantity: 1 });
  };

  const formatPrice = (price: number) => {
    return `S/ ${(price / 100).toFixed(2)}`;
  };

  // Sort products
  const sortedProducts = React.useMemo(() => {
    if (!products) return [];

    const sorted = [...products];

    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }, [products, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-gray-500" />
              <label htmlFor="sort-select" className="sr-only">Ordenar productos por</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="default">Ordenar por defecto</option>
                <option value="rating">Mejor valorados</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
              </select>
            </div>
          </div>

          {/* Categories with Images */}
          <div>
            <h3 className="text-lg font-semibold mb-3 dark:text-white">Categorías</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card
                className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCategory === undefined ? "ring-2 ring-blue-500" : ""
                  }`}
                onClick={() => setSelectedCategory(undefined)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-full h-20 mb-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center text-3xl">
                    🍦
                  </div>
                  <p className="font-medium text-sm dark:text-white">Todos</p>
                </CardContent>
              </Card>
              {categories?.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${selectedCategory === category.id ? "ring-2 ring-blue-500" : ""
                    }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="w-full h-20 mb-2 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          width={200}
                          height={80}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-3xl">
                          🍦
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-sm dark:text-white">{category.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : sortedProducts && sortedProducts.length > 0 ? (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/product/${product.id}`)}
              >
                <div className="bg-gray-100 dark:bg-gray-800 h-48 overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width={300}
                      height={192}
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 h-full flex items-center justify-center text-5xl">
                      🍦
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2 dark:text-white">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2 dark:text-gray-400">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(product.price)}</p>
                    <span className={`text-sm px-2 py-1 rounded ${product.stock > 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}>
                      {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
                    </span>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${star <= (product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                          }`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({product.rating ? Number(product.rating).toFixed(1) : "0.0"})
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
