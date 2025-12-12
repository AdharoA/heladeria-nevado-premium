import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, BarChart3, Users, ShoppingCart, Package } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "users">("dashboard");

  // Verificar si es admin
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Solo los administradores pueden acceder a este panel.
          </p>
          <Button onClick={() => setLocation("/")} className="w-full">
            Volver al Inicio
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Panel Administrativo</h1>
          <p className="text-white/80">Bienvenido, {user?.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navegación */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Button
            onClick={() => setActiveTab("dashboard")}
            variant={activeTab === "dashboard" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Button>
          <Button
            onClick={() => setActiveTab("products")}
            variant={activeTab === "products" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Productos
          </Button>
          <Button
            onClick={() => setActiveTab("orders")}
            variant={activeTab === "orders" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Pedidos
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            variant={activeTab === "users" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Usuarios
          </Button>
        </div>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Ventas</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">$45,230</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Pedidos Pendientes</p>
                  <p className="text-3xl font-bold text-pink-600 mt-2">12</p>
                </div>
                <Package className="w-12 h-12 text-pink-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Clientes Activos</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">156</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Productos Activos</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">13</p>
                </div>
                <Package className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Productos */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestión de Productos</h2>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                <Plus className="w-4 h-4" />
                Agregar Producto
              </Button>
            </div>

            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Producto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Categoría</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Precio</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">Helado de Vainilla</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Vainilla pura y cremosa</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">Clásicos</td>
                        <td className="px-6 py-4 font-semibold">$10.00</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                            50 unidades
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <Edit2 className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Pedidos</h2>
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pedido #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Cliente</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-semibold">#ORD-00{i}</td>
                        <td className="px-6 py-4">Juan Pérez</td>
                        <td className="px-6 py-4 font-semibold">$45.00</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                            Pendiente
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          29 Nov 2024
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Usuarios */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Gestión de Usuarios</h2>
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Rol</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Pedidos</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 font-medium">Usuario {i}</td>
                        <td className="px-6 py-4 text-sm">usuario{i}@example.com</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                            Cliente
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{i * 3} pedidos</td>
                        <td className="px-6 py-4">
                          <Button size="sm" variant="outline">
                            Ver Detalles
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
