import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useSettings } from "@/_core/hooks/useSettings";
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
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash_on_delivery" | "yape" | "plin" | "paypal">("yape");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const { getSetting } = useSettings();

  // Effect to render PayPal button when method is selected
  const renderPayPalButton = () => {
    if (window.paypal) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: (calculateTotal() / 100).toFixed(2)
              }
            }]
          });
        },
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            toast.success("Pago con PayPal exitoso: " + details.payer.name.given_name);
            handlePlaceOrder();
          });
        }
      }).render('#paypal-button-container');
    }
  };

  // Re-render PayPal button when payment method changes to paypal
  if (paymentMethod === 'paypal' && !paypalLoaded) {
    setTimeout(() => {
      const container = document.getElementById('paypal-button-container');
      if (container && container.innerHTML === "") {
        renderPayPalButton();
        setPaypalLoaded(true);
      }
    }, 100);
  } else if (paymentMethod !== 'paypal' && paypalLoaded) {
    setPaypalLoaded(false);
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}


      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h2>

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
                  <p className="text-gray-600 mb-4 dark:text-gray-300">No tienes direcciones guardadas</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {addresses.map((address) => (
                      <label key={address.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium dark:text-white">{address.street} {address.number}</p>
                          {address.apartment && <p className="text-sm text-gray-600 dark:text-gray-400">Apto: {address.apartment}</p>}
                          <p className="text-sm text-gray-600 dark:text-gray-400">{address.city}, {address.province}</p>
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
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  {([
                    { value: "bank_transfer" as const, label: "Transferencia Bancaria" },
                    { value: "yape" as const, label: "Yape" },
                    { value: "plin" as const, label: "Plin" },
                    { value: "paypal" as const, label: "PayPal" },
                    { value: "cash_on_delivery" as const, label: "Contra Entrega" },
                  ] as const).map((method) => (
                    <div key={method.value} className={`border rounded-lg overflow-hidden ${paymentMethod === method.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} dark:border-gray-700`}>
                      <label className="flex items-center gap-3 p-3 cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={() => setPaymentMethod(method.value)}
                        />
                        <span className="font-medium dark:text-white">{method.label}</span>
                      </label>

                      {/* Simulated Payment Details */}
                      {paymentMethod === method.value && (
                        <div className="px-3 pb-3 pl-9 text-sm text-gray-600 dark:text-gray-300 animate-in slide-in-from-top-2">
                          {method.value === "bank_transfer" ? (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                              <p className="font-bold dark:text-white">{getSetting("bank_name") || "BCP"}: {getSetting("bank_account_number") || "191-12345678-0-01"}</p>
                              <p>CCI: {getSetting("bank_cci") || "002-191-12345678001-55"}</p>
                              <p className="text-xs mt-1">Titular: {getSetting("bank_account_holder") || "Heladería Nevado"}</p>
                              <p className="mt-2 text-xs">Sube tu comprobante después de confirmar.</p>
                            </div>
                          ) : method.value === "yape" || method.value === "plin" ? (
                            <div className="text-center bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                              {method.value === "yape" && getSetting("yape_qr") ? (
                                <img src={getSetting("yape_qr")!} alt="QR Yape" className="w-24 h-24 mx-auto mb-2 object-contain" />
                              ) : method.value === "plin" && getSetting("plin_qr") ? (
                                <img src={getSetting("plin_qr")!} alt="QR Plin" className="w-24 h-24 mx-auto mb-2 object-contain" />
                              ) : (
                                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 mx-auto mb-2 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">QR CODE</div>
                              )}
                              <p className="font-bold dark:text-white">
                                {method.value === "yape" ? (getSetting("yape_number") || "987 654 321") : (getSetting("plin_number") || "987 654 321")}
                              </p>
                              <p>Titular: {getSetting("company_name") || "Heladería Nevado"}</p>
                            </div>
                          ) : method.value === "paypal" ? (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700">
                              <p className="mb-2 text-sm dark:text-white">Paga seguro con PayPal</p>
                              <div id="paypal-button-container"></div>
                            </div>
                          ) : (
                            <p>Pagarás en efectivo al recibir tu pedido.</p>
                          )}
                        </div>
                      )}
                    </div>
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
                    {!selectedAddressId && (
                      <p className="text-sm text-red-500 text-center mt-2">
                        * Selecciona una dirección de entrega para continuar
                      </p>
                    )}
                    <Button
                      className="w-full mt-2"
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
