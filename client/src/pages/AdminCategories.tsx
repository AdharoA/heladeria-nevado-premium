import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminCategories() {
    const [, setLocation] = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { data: categories, refetch } = trpc.categories.list.useQuery();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
    });

    const createCategoryMutation = trpc.categories.create.useMutation({
        onSuccess: () => {
            toast.success("Categoría creada");
            resetForm();
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const updateCategoryMutation = trpc.categories.update.useMutation({
        onSuccess: () => {
            toast.success("Categoría actualizada");
            resetForm();
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const deleteCategoryMutation = trpc.categories.delete.useMutation({
        onSuccess: () => {
            toast.success("Categoría eliminada");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            image: "",
        });
    };

    const handleEdit = (category: any) => {
        setFormData({
            name: category.name,
            description: category.description || "",
            image: category.image || "",
        });
        setEditingId(category.id);
        setIsCreating(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            updateCategoryMutation.mutate({ id: editingId, ...formData });
        } else {
            createCategoryMutation.mutate(formData);
        }
    };

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-8 text-center">Acceso Denegado</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 transition-colors duration-300">
            <div className="container mx-auto">
                <Button variant="ghost" className="mb-6" onClick={() => setLocation("/admin/products")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Productos
                </Button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold dark:text-white">Gestión de Categorías</h1>
                    <Button onClick={() => { resetForm(); setIsCreating(!isCreating); }}>
                        {isCreating ? "Cancelar" : "Nueva Categoría"}
                    </Button>
                </div>

                {isCreating && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingId ? "Editar Categoría" : "Nueva Categoría"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    placeholder="Nombre de la categoría"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <Input
                                    placeholder="Descripción"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium">Imagen de Categoría</label>
                                    <ImageUpload
                                        value={formData.image}
                                        onChange={(url) => setFormData({ ...formData, image: url })}
                                        onRemove={() => setFormData({ ...formData, image: "" })}
                                    />
                                </div>
                                <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                                    {createCategoryMutation.isPending || updateCategoryMutation.isPending ? "Guardando..." : "Guardar Categoría"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories?.map((category) => (
                        <Card key={category.id}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold dark:text-white">{category.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500"
                                        onClick={() => {
                                            if (confirm("¿Eliminar categoría?")) {
                                                deleteCategoryMutation.mutate(category.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
