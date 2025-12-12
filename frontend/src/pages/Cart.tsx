import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Snowflake, Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cartItems, refetch } = trpc.cart.list.useQuery();

  const updateCartMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const removeCartMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      toast.success("Producto eliminado del carrito");
      refetch();
    },
  });

  const formatPrice = (price: number) => {
    return `S/ ${(price / 100).toFixed(2)}`;
  };

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartMutation.mutate(itemId);
    } else {
      updateCartMutation.mutate({ id: itemId, quantity: newQuantity });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Snowflake className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">Heladería Nevado</h1>
          </div>
          <Button variant="ghost" onClick={() => setLocation("/products")}>
            Seguir Comprando
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Mi Carrito</h2>

        {!cartItems || cartItems.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg mb-4">Tu carrito está vacío</p>
              <Button onClick={() => setLocation("/products")}>
                Ir al Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-24 h-24 rounded flex items-center justify-center text-3xl flex-shrink-0">
                        🍦
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.product?.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{item.product?.description}</p>
                        <p className="text-xl font-bold text-blue-600 mb-4">
                          {item.product && formatPrice(item.product.price * item.quantity)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 0;
                              handleQuantityChange(item.id, newQty);
                            }}
                            className="w-16 text-center"
                            min="0"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeCartMutation.mutate(item.id)}
                            className="ml-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatPrice(calculateTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="font-bold">S/ 0.00</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-blue-600">{formatPrice(calculateTotal())}</span>
                  </div>
                  <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={() => setLocation("/checkout")}
                  >
                    Proceder al Pago
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setLocation("/products")}
                  >
                    Seguir Comprando
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
