import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Snowflake, MapPin, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: cartItems } = trpc.cart.list.useQuery();
  const { data: addresses } = trpc.addresses.list.useQuery();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "debit_card" | "bank_transfer" | "cash_on_delivery" | "yape" | "plin">("credit_card");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Pedido creado exitosamente");
      setLocation(`/order-confirmation/${data.orderNumber}`);
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear el pedido");
      setIsCreatingOrder(false);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Debes iniciar sesión para continuar</p>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  const formatPrice = (price: number) => {
    return `S/ ${(price / 100).toFixed(2)}`;
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      toast.error("Por favor selecciona una dirección de entrega");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    setIsCreatingOrder(true);

    const items = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.product?.name || "Producto",
      quantity: item.quantity,
      price: item.product?.price || 0,
      subtotal: (item.product?.price || 0) * item.quantity,
    }));

    const totalAmount = calculateTotal();

    createOrderMutation.mutate({
      totalAmount,
      shippingCost: 0,
      deliveryAddressId: selectedAddressId,
      paymentMethod,
      items,
    });
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
          <Button variant="outline" onClick={() => setLocation("/cart")}>
            Volver al Carrito
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Checkout</h2>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Dirección de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!addresses || addresses.length === 0 ? (
                  <p className="text-gray-600 mb-4">No tienes direcciones guardadas</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {addresses.map((address) => (
                      <label key={address.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{address.street} {address.number}</p>
                          {address.apartment && <p className="text-sm text-gray-600">Apto: {address.apartment}</p>}
                          <p className="text-sm text-gray-600">{address.city}, {address.province}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full" onClick={() => setLocation("/addresses")}>
                  Agregar Nueva Dirección
                </Button>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Método de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { value: "credit_card", label: "Tarjeta de Crédito" },
                    { value: "debit_card", label: "Tarjeta de Débito" },
                    { value: "bank_transfer", label: "Transferencia Bancaria" },
                    { value: "yape", label: "Yape" },
                    { value: "plin", label: "Plin" },
                    { value: "cash_on_delivery", label: "Contra Entrega" },
                  ].map((method) => (
                    <label key={method.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value as any)}
                      />
                      <span className="font-medium">{method.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems && cartItems.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product?.name} x{item.quantity}</span>
                          <span className="font-medium">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-bold">{formatPrice(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Envío</span>
                        <span className="font-bold">S/ 0.00</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-lg">
                        <span className="font-bold">Total</span>
                        <span className="font-bold text-blue-600">{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isCreatingOrder || !selectedAddressId}
                    >
                      {isCreatingOrder ? "Procesando..." : "Confirmar Pedido"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                    <Button variant="outline" onClick={() => setLocation("/products")}>
                      Ir al Catálogo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
