import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CreditCard, MapPin, Package, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutStripe() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Obtener direcciones del usuario
  const { data: addresses } = trpc.addresses.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Obtener carrito
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, {
    enabled: !!user,
  });

  // Crear intención de pago
  const createPayment = trpc.payments.createPaymentIntent.useMutation();

  // Confirmar pago
  const confirmPayment = trpc.payments.confirmPayment.useMutation();

  // Crear orden
  const createOrder = trpc.orders.create.useMutation();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Inicia Sesión Requerido</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Debes iniciar sesión para completar tu compra.
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Volver al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  const total = cartItems?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  const handleCreatePayment = async () => {
    if (!selectedAddress) {
      toast.error("Selecciona una dirección de entrega");
      return;
    }

    setLoading(true);
    try {
      // Crear orden primero
      const orderResult = await createOrder.mutateAsync({
        totalAmount: total,
        shippingCost: 500, // $5.00
        deliveryAddressId: selectedAddress,
        paymentMethod: "stripe",
        items: cartItems?.map((item) => ({
          productId: item.productId,
          productName: item.product?.name || "Producto",
          quantity: item.quantity,
          price: item.product?.price || 0,
          subtotal: (item.product?.price || 0) * item.quantity,
        })) || [],
      });

      // Crear intención de pago
      const paymentResult = await createPayment.mutateAsync({
        orderId: orderResult.id,
        amount: total + 500, // en centavos
        description: `Pedido #${orderResult.orderNumber}`,
      });

      setPaymentIntentId(paymentResult.paymentIntentId);
      setClientSecret(paymentResult.clientSecret || "");
      setStep("payment");
      toast.success("Orden creada. Procede con el pago.");
    } catch (error) {
      toast.error("Error al crear la orden");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const result = await confirmPayment.mutateAsync({
        paymentIntentId,
        orderId: 0, // Se obtendría del contexto
      });

      if (result.success) {
        setStep("confirm");
        toast.success("¡Pago completado exitosamente!");
        setTimeout(() => setLocation("/profile"), 3000);
      } else {
        toast.error("El pago no se pudo completar");
      }
    } catch (error) {
      toast.error("Error al confirmar el pago");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Completa tu compra de forma segura</p>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-4 mb-8">
          {["address", "payment", "confirm"].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                step === s ? "bg-gradient-to-r from-purple-600 to-pink-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === "address" && (
              <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold">Dirección de Entrega</h2>
                </div>

                <div className="space-y-4">
                  {addresses?.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-purple-400"
                      }`}
                    >
                      <p className="font-semibold">{addr.street} {addr.number}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {addr.city}, {addr.province} {addr.postalCode}
                      </p>
                      {addr.isDefault && (
                        <span className="inline-block mt-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                          Por defecto
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleCreatePayment}
                  disabled={!selectedAddress || loading}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {loading ? "Procesando..." : "Continuar al Pago"}
                </Button>
              </Card>
            )}

            {/* Step 2: Payment */}
            {step === "payment" && (
              <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold">Método de Pago</h2>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Stripe está integrado. En producción, se mostraría el formulario de Stripe aquí.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Número de Tarjeta</label>
                    <Input
                      placeholder="4242 4242 4242 4242"
                      className="bg-gray-50 dark:bg-gray-700"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Vencimiento</label>
                      <Input placeholder="MM/YY" className="bg-gray-50 dark:bg-gray-700" disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVC</label>
                      <Input placeholder="123" className="bg-gray-50 dark:bg-gray-700" disabled />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep("address")}
                    variant="outline"
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {loading ? "Procesando..." : "Confirmar Pago"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Confirmation */}
            {step === "confirm" && (
              <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">¡Pago Completado!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Tu pedido ha sido confirmado. Recibirás un email con los detalles.
                </p>
                <Button
                  onClick={() => setLocation("/profile")}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Ver Mis Pedidos
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold">Resumen del Pedido</h3>
              </div>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${((item.product?.price || 0) * item.quantity) / 100}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Envío</span>
                  <span>$5.00</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ${((total + 500) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
