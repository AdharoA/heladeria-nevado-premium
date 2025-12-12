import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function AdminUsers() {
    const [, setLocation] = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { data: users, refetch } = trpc.users.list.useQuery();

    const updateRoleMutation = trpc.users.updateRole.useMutation({
        onSuccess: () => {
            toast.success("Rol actualizado");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-8 text-center">Acceso Denegado</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 transition-colors duration-300">
            <div className="container mx-auto">
                <Button variant="ghost" className="mb-6" onClick={() => setLocation("/admin")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Panel
                </Button>

                <h1 className="text-3xl font-bold mb-8 dark:text-white">Gestión de Usuarios</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Usuarios Registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {users?.map((u) => (
                                <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold dark:text-white">{u.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                        {u.id !== user?.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateRoleMutation.mutate({
                                                    id: u.id,
                                                    role: u.role === 'admin' ? 'user' : 'admin'
                                                })}
                                            >
                                                Cambiar a {u.role === 'admin' ? 'User' : 'Admin'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
