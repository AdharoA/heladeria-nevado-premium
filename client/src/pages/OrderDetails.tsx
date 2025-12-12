import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OrderDetails() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute("/order/:id");
    const orderId = params?.id ? parseInt(params.id) : 0;
    const { isAuthenticated } = useAuth();

    const { data: order, isLoading, error } = trpc.orders.getById.useQuery(orderId, {
        enabled: !!orderId,
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="mb-4">Debes iniciar sesión para ver este pedido.</p>
                    <Button onClick={() => setLocation("/login")}>Iniciar Sesión</Button>
                </div>
            </div>
        );
    }

    if (isLoading) return <div className="p-8 text-center">Cargando pedido...</div>;
    if (error || !order) return <div className="p-8 text-center text-red-500">Error al cargar el pedido o no encontrado.</div>;

    const formatPrice = (price: number) => `S/ ${(price / 100).toFixed(2)}`;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered": return "bg-green-100 text-green-800";
            case "cancelled": return "bg-red-100 text-red-800";
            case "shipped": return "bg-blue-100 text-blue-800";
            default: return "bg-yellow-100 text-yellow-800";
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods: Record<string, string> = {
            bank_transfer: "Transferencia Bancaria",
            yape: "Yape",
            plin: "Plin",
            paypal: "PayPal",
            cash_on_delivery: "Contra Entrega"
        };
        return methods[method] || method;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
            <div className="container mx-auto max-w-4xl">
                <Button variant="ghost" className="mb-6" onClick={() => setLocation("/profile")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Mis Pedidos
                </Button>

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 dark:text-white">Pedido #{order.orderNumber}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Realizado el {new Date(order.createdAt).toLocaleDateString("es-PE", {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                    </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Productos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                                        <div>
                                            <p className="font-bold dark:text-white">{item.productName}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Cantidad: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold dark:text-white">{formatPrice(item.subtotal)}</p>
                                    </div>
                                ))}
                                <div className="border-t pt-4 mt-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Envío</span>
                                        <span>{formatPrice(order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 dark:text-white">
                                        <span>Total</span>
                                        <span className="text-blue-600 dark:text-blue-400">{formatPrice(order.totalAmount + order.shippingCost)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">Método de Envío: Estándar</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                <p className="text-sm text-gray-500 mt-1">Estado: {order.paymentStatus}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
