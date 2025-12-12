import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function Addresses() {
    const [, setLocation] = useLocation();
    const { isAuthenticated } = useAuth();
    const { data: addresses, refetch } = trpc.addresses.list.useQuery();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        street: "",
        number: "",
        apartment: "",
        city: "",
        province: "",
        postalCode: "",
    });

    const createAddressMutation = trpc.addresses.create.useMutation({
        onSuccess: () => {
            toast.success("Dirección agregada correctamente");
            setIsAdding(false);
            setFormData({
                street: "",
                number: "",
                apartment: "",
                city: "",
                province: "",
                postalCode: "",
            });
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Error al agregar la dirección");
        },
    });

    const deleteAddressMutation = trpc.addresses.delete.useMutation({
        onSuccess: () => {
            toast.success("Dirección eliminada");
            refetch();
        },
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-600 mb-4">Debes iniciar sesión para gestionar tus direcciones</p>
                        <Button onClick={() => setLocation("/dev-login")} className="w-full">
                            Iniciar Sesión
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createAddressMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="container mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    className="mb-6"
                    onClick={() => setLocation("/checkout")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Checkout
                </Button>

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold dark:text-white">Mis Direcciones</h2>
                    <Button onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? "Cancelar" : "Nueva Dirección"}
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Formulario de Nueva Dirección */}
                    {isAdding && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Agregar Nueva Dirección</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Calle / Avenida</label>
                                            <Input
                                                required
                                                value={formData.street}
                                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                                placeholder="Av. Principal"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Número</label>
                                            <Input
                                                required
                                                value={formData.number}
                                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Departamento (Opcional)</label>
                                            <Input
                                                value={formData.apartment}
                                                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                                                placeholder="Apto 401"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Código Postal</label>
                                            <Input
                                                required
                                                value={formData.postalCode}
                                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                                placeholder="15001"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Ciudad</label>
                                            <Input
                                                required
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                placeholder="Lima"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Provincia</label>
                                            <Input
                                                required
                                                value={formData.province}
                                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                                placeholder="Lima"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={createAddressMutation.isPending}>
                                        {createAddressMutation.isPending ? "Guardando..." : "Guardar Dirección"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lista de Direcciones */}
                    {!addresses || addresses.length === 0 ? (
                        !isAdding && (
                            <div className="col-span-2 text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                                <MapPin className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No tienes direcciones guardadas</p>
                            </div>
                        )
                    ) : (
                        addresses.map((address) => (
                            <Card key={address.id}>
                                <CardContent className="p-6 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="bg-blue-100 p-3 rounded-full h-fit">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg dark:text-white">{address.street} {address.number}</p>
                                            {address.apartment && (
                                                <p className="text-gray-600 dark:text-gray-300">Dpto/Int: {address.apartment}</p>
                                            )}
                                            <p className="text-gray-600 dark:text-gray-300">{address.city}, {address.province}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">CP: {address.postalCode}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm("¿Estás seguro de eliminar esta dirección?")) {
                                                deleteAddressMutation.mutate(address.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
