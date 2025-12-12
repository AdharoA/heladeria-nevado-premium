import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";

export default function AdminPosts() {
    const { user, isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({ publishedOnly: false });

    const createPostMutation = trpc.posts.create.useMutation();
    const updatePostMutation = trpc.posts.update.useMutation();
    const deletePostMutation = trpc.posts.delete.useMutation();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        images: [] as string[],
        layout: "carousel" as "carousel" | "side_by_side" | "collage",
        published: false
    });

    if (!isAuthenticated || user?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
                    <Button onClick={() => setLocation("/")}>Volver al Inicio</Button>
                </div>
            </div>
        );
    }

    const handleOpenDialog = (post?: any) => {
        if (post) {
            setEditingPost(post);
            // Parse images from JSON string if needed
            let parsedImages: string[] = [];
            try {
                if (typeof post.images === 'string') {
                    parsedImages = JSON.parse(post.images);
                } else if (Array.isArray(post.images)) {
                    parsedImages = post.images;
                }
            } catch (e) {
                parsedImages = [];
            }
            setFormData({
                title: post.title,
                content: post.content || "",
                images: parsedImages,
                layout: post.layout || "carousel",
                published: post.published
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: "",
                content: "",
                images: [],
                layout: "carousel",
                published: false
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            console.log('📝 Guardando publicación:', formData);
            if (editingPost) {
                await updatePostMutation.mutateAsync({
                    id: editingPost.id,
                    ...formData
                });
                toast.success("Publicación actualizada");
            } else {
                await createPostMutation.mutateAsync(formData);
                toast.success("Publicación creada");
            }
            setIsDialogOpen(false);
            refetch();
        } catch (error) {
            console.error('❌ Error guardando publicación:', error);
            toast.error("Error al guardar la publicación");
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("¿Estás seguro de eliminar esta publicación?")) {
            try {
                await deletePostMutation.mutateAsync(id);
                toast.success("Publicación eliminada");
                refetch();
            } catch (error) {
                toast.error("Error al eliminar");
            }
        }
    };

    const togglePublish = async (post: any) => {
        try {
            await updatePostMutation.mutateAsync({
                id: post.id,
                published: !post.published
            });
            toast.success(post.published ? "Publicación ocultada" : "Publicación publicada");
            refetch();
        } catch (error) {
            toast.error("Error al actualizar estado");
        }
    };

    const addImage = (url: string) => {
        let maxImages = 10; // default for carousel
        if (formData.layout === "collage") {
            maxImages = 4;
        } else if (formData.layout === "side_by_side") {
            maxImages = 1;
        }

        if (formData.images.length >= maxImages) {
            const layoutNames = {
                "collage": "Collage (máx. 4)",
                "side_by_side": "Imagen Lateral (máx. 1)",
                "carousel": "Carrusel"
            };
            toast.error(`El layout ${layoutNames[formData.layout]} permite máximo ${maxImages} imagen${maxImages > 1 ? 'es' : ''}`);
            return;
        }
        setFormData({ ...formData, images: [...formData.images, url] });
    };

    const removeImage = (index: number) => {
        setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
    };

    if (isLoading) return <div className="p-8 text-center">Cargando publicaciones...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
            <div className="container mx-auto max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Gestión de Publicaciones (CMS)</h1>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Publicación
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Publicaciones y Banners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vista Previa</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Diseño</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts?.map((post) => {
                                    // Parse images from JSON string if needed
                                    let images: string[] = [];
                                    try {
                                        if (typeof post.images === 'string') {
                                            images = JSON.parse(post.images);
                                        } else if (Array.isArray(post.images)) {
                                            images = post.images;
                                        }
                                    } catch (e) {
                                        console.error('Error parsing images:', e);
                                        images = [];
                                    }
                                    return (
                                        <TableRow key={post.id}>
                                            <TableCell>
                                                {images[0] ? (
                                                    <img src={images[0]} alt={post.title} className="w-16 h-10 object-cover rounded" />
                                                ) : (
                                                    <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">Sin imagen</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{post.title}</TableCell>
                                            <TableCell className="capitalize">{post.layout?.replace('_', ' ') || 'Carrusel'}</TableCell>
                                            <TableCell>
                                                <div className={`flex items-center gap-2 ${post.published ? "text-green-600" : "text-gray-500"}`}>
                                                    {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    {post.published ? "Publicado" : "Borrador"}
                                                </div>
                                            </TableCell>
                                            <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => togglePublish(post)} title={post.published ? "Ocultar" : "Publicar"}>
                                                        {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(post)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(post.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {posts?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No hay publicaciones creadas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPost ? "Editar Publicación" : "Nueva Publicación"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4">
                            {/* Left Column: Form */}
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Título</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Título del banner o noticia"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Contenido (Opcional)</Label>
                                    <Textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Descripción o contenido adicional..."
                                        rows={4}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Diseño</Label>
                                    <Select value={formData.layout} onValueChange={(value: any) => setFormData({ ...formData, layout: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="carousel">Carrusel</SelectItem>
                                            <SelectItem value="side_by_side">Imagen Lateral</SelectItem>
                                            <SelectItem value="collage">Collage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Imágenes ({formData.images.length})</Label>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition"
                                                    onClick={() => removeImage(idx)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <ImageUpload
                                        value=""
                                        onChange={addImage}
                                        onRemove={() => { }}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={formData.published}
                                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                                    />
                                    <Label>Publicar inmediatamente</Label>
                                </div>
                            </div>

                            {/* Right Column: Preview */}
                            <div className="space-y-2">
                                <Label>Vista Previa</Label>
                                <div className="border rounded-lg p-4 bg-white dark:bg-slate-900">
                                    {formData.layout === "carousel" && (
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg">{formData.title || "Título"}</h3>
                                            {formData.images.length > 0 ? (
                                                <img src={formData.images[0]} alt="Preview" className="w-full h-48 object-cover rounded" />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                                    Sin imagen
                                                </div>
                                            )}
                                            {formData.content && <p className="text-sm text-muted-foreground">{formData.content}</p>}
                                        </div>
                                    )}
                                    {formData.layout === "side_by_side" && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                {formData.images[0] ? (
                                                    <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover rounded" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center min-h-[200px]">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h3 className="font-bold text-lg mb-2">{formData.title || "Título"}</h3>
                                                <p className="text-sm text-muted-foreground">{formData.content || "Descripción..."}</p>
                                            </div>
                                        </div>
                                    )}
                                    {formData.layout === "collage" && (
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg mb-2 text-center">{formData.title || "Título"}</h3>
                                            {formData.content && <p className="text-sm text-muted-foreground text-center mb-2">{formData.content}</p>}
                                            <div className="grid grid-cols-2 gap-2">
                                                {formData.images.slice(0, 4).map((img, idx) => (
                                                    <img key={idx} src={img} alt={`Collage ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                                                ))}
                                                {[...Array(Math.max(0, 4 - formData.images.length))].map((_, idx) => (
                                                    <div key={`empty-${idx}`} className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                                                        Imagen {formData.images.length + idx + 1}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={createPostMutation.isPending || updatePostMutation.isPending}>
                                {editingPost ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
