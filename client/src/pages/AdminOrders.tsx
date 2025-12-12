import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag, CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminOrders() {
    const [, setLocation] = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { data: orders, refetch } = trpc.orders.listAll.useQuery();

    const updateStatusMutation = trpc.orders.updateStatus.useMutation({
        onSuccess: () => {
            toast.success("Estado actualizado");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar estado");
        },
    });

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-8 text-center">Acceso Denegado</div>;
    }

    const handleStatusChange = (id: number, status: any) => {
        updateStatusMutation.mutate({ id, status });
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            preparing: "bg-purple-100 text-purple-800",
            ready: "bg-indigo-100 text-indigo-800",
            shipped: "bg-orange-100 text-orange-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        const labels = {
            pending: "Pendiente",
            confirmed: "Confirmado",
            preparing: "Preparando",
            ready: "Listo",
            shipped: "Enviado",
            delivered: "Entregado",
            cancelled: "Cancelado",
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status as keyof typeof styles] || "bg-gray-100"}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 transition-colors duration-300">
            <div className="container mx-auto">
                <Button variant="ghost" className="mb-6" onClick={() => setLocation("/admin")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Panel
                </Button>

                <h1 className="text-3xl font-bold mb-8 dark:text-white">Gestión de Pedidos</h1>

                <div className="space-y-4">
                    {orders?.map((order) => (
                        <Card key={order.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold text-lg dark:text-white">{order.orderNumber}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Fecha: {new Date(order.createdAt).toLocaleDateString("es-PE", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Total: S/ {(order.totalAmount / 100).toFixed(2)}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Método de Pago: {order.paymentMethod}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 items-center">
                                        <span className="text-sm font-medium mr-2">Cambiar Estado:</span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                            onClick={() => handleStatusChange(order.id, "confirmed")}
                                            disabled={order.status === "confirmed"}
                                        >
                                            Confirmar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                                            onClick={() => handleStatusChange(order.id, "preparing")}
                                            disabled={order.status === "preparing"}
                                        >
                                            Preparar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                            onClick={() => handleStatusChange(order.id, "delivered")}
                                            disabled={order.status === "delivered"}
                                        >
                                            Entregar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                            onClick={() => handleStatusChange(order.id, "cancelled")}
                                            disabled={order.status === "cancelled"}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setLocation(`/order/${order.id}`)}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
