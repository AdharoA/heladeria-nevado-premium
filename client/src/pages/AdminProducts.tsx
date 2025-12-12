import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { ImageUpload } from "@/components/ui/image-upload";

export default function AdminProducts() {
    const [, setLocation] = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { data: products, refetch } = trpc.products.list.useQuery({});
    const { data: categories } = trpc.categories.list.useQuery();

    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "100",
        image: "",
    });

    const createProductMutation = trpc.products.create.useMutation({
        onSuccess: () => {
            toast.success("Producto creado correctamente");
            resetForm();
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear producto");
        },
    });

    const updateProductMutation = trpc.products.update.useMutation({
        onSuccess: () => {
            toast.success("Producto actualizado correctamente");
            resetForm();
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar producto");
        },
    });

    const deleteProductMutation = trpc.products.delete.useMutation({
        onSuccess: () => {
            toast.success("Producto eliminado");
            refetch();
        },
    });

    const resetForm = () => {
        setIsCreating(false);
        setEditingId(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            categoryId: "",
            stock: "100",
            image: "",
        });
    };

    const handleEdit = (product: any) => {
        setFormData({
            name: product.name,
            description: product.description || "",
            price: (product.price / 100).toString(),
            categoryId: product.categoryId.toString(),
            stock: product.stock.toString(),
            image: product.image || "",
        });
        setEditingId(product.id);
        setIsCreating(true);
    };

    if (!isAuthenticated || user?.role !== "admin") {
        return <div className="p-8 text-center">Acceso Denegado</div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.categoryId) {
            toast.error("Selecciona una categoría");
            return;
        }

        const data = {
            name: formData.name,
            description: formData.description,
            price: parseInt(formData.price) * 100,
            categoryId: parseInt(formData.categoryId),
            stock: parseInt(formData.stock),
            image: formData.image,
        };

        if (editingId) {
            updateProductMutation.mutate({ id: editingId, ...data });
        } else {
            createProductMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8 transition-colors duration-300">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" onClick={() => setLocation("/admin")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver al Panel
                    </Button>
                    <Button variant="outline" onClick={() => setLocation("/admin/categories")}>
                        Gestionar Categorías
                    </Button>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold dark:text-white">Gestión de Productos</h1>
                    <Button onClick={() => { resetForm(); setIsCreating(!isCreating); }}>
                        {isCreating ? "Cancelar" : "Nuevo Producto"}
                    </Button>
                </div>

                {isCreating && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Nombre del producto"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <Input
                                        placeholder="Precio (en soles)"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Seleccionar Categoría</option>
                                        {categories?.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        placeholder="Descripción"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-medium">Imagen del Producto</label>
                                        <ImageUpload
                                            value={formData.image}
                                            onChange={(url) => setFormData({ ...formData, image: url })}
                                            onRemove={() => setFormData({ ...formData, image: "" })}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                                    {createProductMutation.isPending || updateProductMutation.isPending ? "Guardando..." : "Guardar Producto"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {products?.map((product) => (
                        <Card key={product.id}>
                            <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded" />
                                        ) : (
                                            <img src="https://placehold.co/100x100?text=Ice" alt="Placeholder" className="w-full h-full object-cover rounded" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold dark:text-white">{product.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Stock: {product.stock} | Precio: S/ {(product.price / 100).toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500"
                                        onClick={() => {
                                            if (confirm("¿Eliminar producto?")) {
                                                deleteProductMutation.mutate(product.id);
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
