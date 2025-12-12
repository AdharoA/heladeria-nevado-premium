import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Snowflake, LogOut, ShoppingBag, User, Camera } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated, refresh } = useAuth();
  const { data: orders } = trpc.orders.list.useQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profilePicture: user?.profilePicture || "",
  });

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil actualizado correctamente");
      setIsEditing(false);
      refresh(); // Refresh user data
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar el perfil");
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSaveProfile = () => {
    // Only send fields that have values
    const updates: any = {};

    if (formData.name && formData.name.trim()) {
      updates.name = formData.name.trim();
    }
    if (formData.email && formData.email.trim()) {
      updates.email = formData.email.trim();
    }
    if (formData.phone && formData.phone.trim()) {
      updates.phone = formData.phone.trim();
    }
    if (formData.profilePicture && formData.profilePicture.trim()) {
      updates.profilePicture = formData.profilePicture.trim();
    }

    updateProfileMutation.mutate(updates);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tu perfil</p>
            <Button onClick={() => setLocation("/login")} className="w-full">
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `S/ ${(price / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}


      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Mi Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {user.profilePicture || formData.profilePicture ? (
                      <img
                        src={formData.profilePicture || user.profilePicture || ""}
                        alt={user.name || "Profile"}
                        className="w-full h-full rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl ${user.profilePicture || formData.profilePicture ? 'hidden' : ''}`}>
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          id="profile-picture-input"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Convert to base64
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, profilePicture: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="profile-picture-input"
                          className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                          title="Cambiar foto"
                        >
                          <Camera className="w-4 h-4 text-white" />
                        </label>
                      </>
                    )}
                  </div>
                  <p className="font-bold text-lg dark:text-white">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>

                {!isEditing ? (
                  <>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Nombre</p>
                        <p className="font-medium dark:text-white">{user.name || "No especificado"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium dark:text-white">{user.email || "No especificado"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Teléfono</p>
                        <p className="font-medium dark:text-white">{user.phone || "No especificado"}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar Perfil
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Foto de Perfil (URL)</label>
                        <Input
                          value={formData.profilePicture}
                          onChange={(e) => setFormData({ ...formData, profilePicture: e.target.value })}
                          placeholder="https://ejemplo.com/foto.jpg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Pega la URL de una imagen desde internet
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="tu@email.com"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Teléfono</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+51 943 123 456"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1"
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        Guardar
                      </Button>
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Orders */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Mis Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!orders || orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No tienes pedidos aún</p>
                    <Button onClick={() => setLocation("/products")}>
                      Ir al Catálogo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold dark:text-white">Pedido #{order.orderNumber}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString("es-PE")}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                              }`}>
                              {order.status === "pending" && "Pendiente"}
                              {order.status === "confirmed" && "Confirmado"}
                              {order.status === "preparing" && "Preparando"}
                              {order.status === "ready" && "Listo"}
                              {order.status === "shipped" && "Enviado"}
                              {order.status === "delivered" && "Entregado"}
                              {order.status === "cancelled" && "Cancelado"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatPrice(order.totalAmount + order.shippingCost)}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/order/${order.id}`)}
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
