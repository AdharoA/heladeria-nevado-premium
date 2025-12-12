import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

export default function OrderConfirmation() {
    const [, setLocation] = useLocation();
    const [, params] = useRoute("/order-confirmation/:orderNumber");
    const orderNumber = params?.orderNumber;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-700">
                        ¡Pedido Confirmado!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            Gracias por tu compra. Tu pedido ha sido recibido correctamente.
                        </p>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Número de Pedido</p>
                            <p className="text-xl font-mono font-bold text-gray-800">
                                {orderNumber}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Te enviaremos un correo con los detalles de tu compra.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            className="w-full"
                            onClick={() => setLocation("/profile")}
                        >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Ver Mis Pedidos
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setLocation("/products")}
                        >
                            Seguir Comprando
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
