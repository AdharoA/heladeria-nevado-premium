import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ProductDetails() {
    const [, params] = useRoute("/product/:id");
    const productId = params ? parseInt(params.id) : 0;
    const { user } = useAuth();

    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const { data: product, isLoading } = trpc.products.getById.useQuery(productId);
    const { data: reviews } = trpc.reviews.list.useQuery({ productId });

    const utils = trpc.useUtils();

    const addToCartMutation = trpc.cart.add.useMutation({
        onSuccess: () => {
            toast.success("Producto agregado al carrito");
            utils.cart.list.invalidate();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const addReviewMutation = trpc.reviews.create.useMutation({
        onSuccess: () => {
            toast.success("Reseña agregada");
            setComment("");
            utils.reviews.list.invalidate({ productId });
            utils.products.getById.invalidate(productId);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (isLoading) return <div className="p-8 text-center">Cargando...</div>;
    if (!product) return <div className="p-8 text-center">Producto no encontrado</div>;

    const handleAddToCart = () => {
        if (!user) {
            toast.error("Debes iniciar sesión para comprar");
            return;
        }
        addToCartMutation.mutate({ productId, quantity });
    };

    const handleAddReview = () => {
        if (!user) {
            toast.error("Debes iniciar sesión para dejar una reseña");
            return;
        }
        addReviewMutation.mutate({ productId, rating, comment });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="aspect-square relative rounded-lg overflow-hidden border bg-white dark:bg-gray-900">
                    <img
                        src={product.image || "https://placehold.co/600x600?text=Helado"}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-primary dark:text-white">{product.name}</h1>
                    <p className="text-2xl font-semibold dark:text-gray-200">S/ {(product.price / 100).toFixed(2)}</p>
                    <p className="text-muted-foreground text-lg dark:text-gray-400">{product.description}</p>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-12 text-center text-lg">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {product.stock} disponibles
                        </span>
                    </div>

                    <Button
                        size="lg"
                        className="w-full md:w-auto gap-2"
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
                    </Button>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Reseñas</h2>

                {user && (
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`h-6 w-6 cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                            <Textarea
                                placeholder="Escribe tu opinión..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <Button onClick={handleAddReview} disabled={addReviewMutation.isPending}>
                                Publicar Reseña
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-4">
                    {reviews?.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold">{review.userName || "Usuario"}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                        />
                                    ))}
                                </div>
                                <p>{review.comment}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {reviews?.length === 0 && (
                        <p className="text-muted-foreground">No hay reseñas aún. ¡Sé el primero!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
