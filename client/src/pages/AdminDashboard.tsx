import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Users, ShoppingBag, TrendingUp, DollarSign, TrendingDown, Settings, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const { data: stats, isLoading: isLoadingStats } = trpc.dashboard.stats.useQuery();
    const { data: orders, isLoading: isLoadingOrders } = trpc.orders.listAll.useQuery();

    console.log("📊 Dashboard Stats:", stats);
    if (stats?.salesByDay) {
        console.log("📊 Sales by day:", stats.salesByDay);
        console.log("📊 Sales by month:", stats.salesByMonth);
    }


    const pendingOrders = orders?.filter(o => o.status === "pending") || [];

    if (!isAuthenticated || user?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
                    <p className="mb-4">No tienes permisos para ver esta página.</p>
                    <Button onClick={() => setLocation("/")}>Volver al Inicio</Button>
                </div>
            </div>
        );
    }

    if (isLoadingStats || isLoadingOrders) {
        return <div className="p-8 text-center">Cargando estadísticas...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">S/ {((stats?.income || 0) / 100).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Total histórico</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Egresos Estimados</CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">S/ {((stats?.expenses || 0) / 100).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">60% de los ingresos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                            <ShoppingBag className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.ordersCount || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
                            <Users className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.usersCount || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Sales Chart */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Ventas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="weekly" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="weekly">Semanal</TabsTrigger>
                                    <TabsTrigger value="monthly">Mensual</TabsTrigger>
                                    <TabsTrigger value="yearly">Anual</TabsTrigger>
                                </TabsList>
                                <TabsContent value="weekly" className="space-y-4">
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <LineChart data={stats?.salesByDay || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip formatter={(value: number) => `S/ ${(value / 100).toFixed(2)}`} />
                                                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>
                                <TabsContent value="monthly" className="space-y-4">
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={stats?.salesByMonth || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip formatter={(value: number) => `S/ ${(value / 100).toFixed(2)}`} />
                                                <Bar dataKey="amount" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>
                                <TabsContent value="yearly" className="space-y-4">
                                    <div style={{ width: '100%', height: 300 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={stats?.salesByYear || []}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip formatter={(value: number) => `S/ ${(value / 100).toFixed(2)}`} />
                                                <Bar dataKey="amount" fill="#82ca9d" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Productos Más Vendidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats?.topProducts.map((product, i) => (
                                    <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                {i + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">{product.quantity} unidades vendidas</p>
                                            </div>
                                        </div>
                                        <div className="font-bold">
                                            S/ {(product.total / 100).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                {stats?.topProducts.length === 0 && (
                                    <p className="text-center text-muted-foreground">No hay datos de ventas aún.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Low Stock Alert */}
                <div className="mb-8">
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                                <AlertTriangle className="h-5 w-5" />
                                Alerta de Bajo Stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats?.lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900">
                                        <span className="font-medium dark:text-white">{product.name}</span>
                                        <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded text-xs font-bold">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                ))}
                                {stats?.lowStockProducts.length === 0 && (
                                    <p className="text-muted-foreground">Todos los productos tienen buen stock.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Orders Section */}
                <div className="mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos Pendientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingOrders.length === 0 ? (
                                <p className="text-muted-foreground">No hay pedidos pendientes.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3">Orden #</th>
                                                <th className="px-6 py-3">Fecha</th>
                                                <th className="px-6 py-3">Total</th>
                                                <th className="px-6 py-3">Método Pago</th>
                                                <th className="px-6 py-3">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingOrders.map((order) => (
                                                <tr key={order.id} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                        {order.orderNumber}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        S/ {(order.totalAmount / 100).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 capitalize">
                                                        {order.paymentMethod.replace(/_/g, " ")}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setLocation(`/order/${order.id}`)}
                                                        >
                                                            Ver Detalles
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/admin/products")}>
                        <Package className="h-6 w-6" />
                        Gestionar Productos
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/admin/categories")}>
                        <TrendingUp className="h-6 w-6" />
                        Gestionar Categorías
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/admin/users")}>
                        <Users className="h-6 w-6" />
                        Gestionar Usuarios
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/admin/orders")}>
                        <ShoppingBag className="h-6 w-6" />
                        Gestionar Pedidos
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/admin/posts")}>
                        <FileText className="h-6 w-6" />
                        Publicaciones (CMS)
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setLocation("/admin/settings")}>
                        <Settings className="h-6 w-6" />
                        Configuración
                    </Button>
                </div>
            </div>
        </div>
    );
}
