import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Save, Building, CreditCard, Phone } from "lucide-react";

export default function AdminSettings() {
    const { user, isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const { data: settings, isLoading, refetch } = trpc.settings.list.useQuery();
    const updateSettingMutation = trpc.settings.update.useMutation();

    const [formData, setFormData] = useState<Record<string, string>>({});

    useEffect(() => {
        if (settings) {
            const newFormData: Record<string, string> = {};
            settings.forEach(s => {
                newFormData[s.key] = s.value || "";
            });
            setFormData(newFormData);
        }
    }, [settings]);

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

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (key: string) => {
        try {
            await updateSettingMutation.mutateAsync({
                key,
                value: formData[key] || "",
                type: "string"
            });
            toast.success("Configuración guardada");
            refetch();
        } catch (error) {
            toast.error("Error al guardar");
        }
    };

    const handleSaveAll = async () => {
        try {
            for (const [key, value] of Object.entries(formData)) {
                if (value !== undefined && value !== null) {
                    await updateSettingMutation.mutateAsync({ key, value: String(value), type: "string" });
                }
            }
            toast.success("Todas las configuraciones guardadas");
            await refetch();
        } catch (error: any) {
            console.error("Error saving settings:", error);
            toast.error(error?.message || "Error al guardar configuraciones");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Cargando configuraciones...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
            <div className="container mx-auto max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Building className="w-8 h-8" />
                        Configuración General
                    </h1>
                    <Button onClick={handleSaveAll} disabled={updateSettingMutation.isPending}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Todo
                    </Button>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="payments">Pagos</TabsTrigger>
                        <TabsTrigger value="contact">Contacto</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información del Negocio</CardTitle>
                                <CardDescription>Personaliza la información básica de tu tienda.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nombre de la Empresa</Label>
                                    <Input
                                        value={formData["company_name"] || ""}
                                        onChange={(e) => handleChange("company_name", e.target.value)}
                                        placeholder="Heladería Nevado Premium"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        value={formData["company_description"] || ""}
                                        onChange={(e) => handleChange("company_description", e.target.value)}
                                        placeholder="La mejor heladería artesanal..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Logo del Sitio</Label>
                                    <ImageUpload
                                        value={formData["site_logo"]}
                                        onChange={(url) => handleChange("site_logo", url)}
                                        onRemove={() => handleChange("site_logo", "")}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Favicon</Label>
                                    <ImageUpload
                                        value={formData["site_favicon"]}
                                        onChange={(url) => handleChange("site_favicon", url)}
                                        onRemove={() => handleChange("site_favicon", "")}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments">
                        <Card>
                            <CardHeader>
                                <CardTitle>Métodos de Pago</CardTitle>
                                <CardDescription>Configura tus cuentas bancarias y billeteras digitales.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Transferencia Bancaria</h3>
                                    <div className="grid gap-2">
                                        <Label>Nombre del Banco</Label>
                                        <Input
                                            value={formData["bank_name"] || ""}
                                            onChange={(e) => handleChange("bank_name", e.target.value)}
                                            placeholder="BCP / Interbank"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Número de Cuenta</Label>
                                        <Input
                                            value={formData["bank_account_number"] || ""}
                                            onChange={(e) => handleChange("bank_account_number", e.target.value)}
                                            placeholder="123-456789-0-12"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>CCI</Label>
                                        <Input
                                            value={formData["bank_cci"] || ""}
                                            onChange={(e) => handleChange("bank_cci", e.target.value)}
                                            placeholder="002-123-456789-0-12"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Titular de la Cuenta</Label>
                                        <Input
                                            value={formData["bank_account_holder"] || ""}
                                            onChange={(e) => handleChange("bank_account_holder", e.target.value)}
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Billeteras Digitales</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Número Yape</Label>
                                            <Input
                                                value={formData["yape_number"] || ""}
                                                onChange={(e) => handleChange("yape_number", e.target.value)}
                                                placeholder="999 999 999"
                                            />
                                            <Label>QR Yape</Label>
                                            <ImageUpload
                                                value={formData["yape_qr"]}
                                                onChange={(url) => handleChange("yape_qr", url)}
                                                onRemove={() => handleChange("yape_qr", "")}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Número Plin</Label>
                                            <Input
                                                value={formData["plin_number"] || ""}
                                                onChange={(e) => handleChange("plin_number", e.target.value)}
                                                placeholder="999 999 999"
                                            />
                                            <Label>QR Plin</Label>
                                            <ImageUpload
                                                value={formData["plin_qr"]}
                                                onChange={(url) => handleChange("plin_qr", url)}
                                                onRemove={() => handleChange("plin_qr", "")}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">PayPal</h3>
                                    <div className="grid gap-2">
                                        <Label>Correo de PayPal (Business)</Label>
                                        <Input
                                            value={formData["paypal_email"] || ""}
                                            onChange={(e) => handleChange("paypal_email", e.target.value)}
                                            placeholder="pagos@heladeria.com"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>PayPal Client ID</Label>
                                        <Input
                                            value={formData["paypal_client_id"] || ""}
                                            onChange={(e) => handleChange("paypal_client_id", e.target.value)}
                                            placeholder="Tu Client ID de PayPal"
                                        />
                                        <p className="text-xs text-muted-foreground">Obténlo desde el Dashboard de PayPal</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>PayPal Secret</Label>
                                        <Input
                                            type="password"
                                            value={formData["paypal_secret"] || ""}
                                            onChange={(e) => handleChange("paypal_secret", e.target.value)}
                                            placeholder="Tu Secret de PayPal"
                                        />
                                        <p className="text-xs text-muted-foreground">Mantén esto seguro y privado</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="sandbox-mode">Modo Sandbox (Pruebas)</Label>
                                        <select
                                            id="sandbox-mode"
                                            value={formData["paypal_sandbox_mode"] || "true"}
                                            onChange={(e) => handleChange("paypal_sandbox_mode", e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        >
                                            <option value="true">Activado (Modo Pruebas)</option>
                                            <option value="false">Desactivado (Modo Producción)</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            Usa modo Sandbox para pruebas. Cambia a Producción cuando estés listo para pagos reales.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="contact">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Contacto</CardTitle>
                                <CardDescription>Datos visibles para los clientes.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Teléfono / WhatsApp</Label>
                                    <Input
                                        value={formData["contact_phone"] || ""}
                                        onChange={(e) => handleChange("contact_phone", e.target.value)}
                                        placeholder="+51 999 999 999"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email de Contacto</Label>
                                    <Input
                                        value={formData["contact_email"] || ""}
                                        onChange={(e) => handleChange("contact_email", e.target.value)}
                                        placeholder="contacto@heladeria.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Dirección Física</Label>
                                    <Input
                                        value={formData["contact_address"] || ""}
                                        onChange={(e) => handleChange("contact_address", e.target.value)}
                                        placeholder="Av. Principal 123, Lima"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Enlace Google Maps</Label>
                                    <Input
                                        value={formData["contact_maps_url"] || ""}
                                        onChange={(e) => handleChange("contact_maps_url", e.target.value)}
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Horario de Atención</Label>
                                    <Textarea
                                        value={formData["business_hours"] || ""}
                                        onChange={(e) => handleChange("business_hours", e.target.value)}
                                        placeholder={"Lunes - Viernes: 10:00 AM - 10:00 PM\nSábado - Domingo: 11:00 AM - 11:00 PM"}
                                        rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground">Una línea por horario</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Google Maps Iframe (Código Completo)</Label>
                                    <Textarea
                                        value={formData["maps_iframe"] || ""}
                                        onChange={(e) => handleChange("maps_iframe", e.target.value)}
                                        placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450"...></iframe>'
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground">Pega el código iframe completo de Google Maps</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="maps-size">Tamaño del Mapa</Label>
                                    <select
                                        id="maps-size"
                                        value={formData["maps_size"] || "medium"}
                                        onChange={(e) => handleChange("maps_size", e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="small">Pequeño (300px)</option>
                                        <option value="medium">Mediano (450px)</option>
                                        <option value="large">Grande (600px)</option>
                                        <option value="custom">Personalizado</option>
                                    </select>
                                </div>
                                {formData["maps_size"] === "custom" && (
                                    <div className="grid gap-2">
                                        <Label>Altura Personalizada (px)</Label>
                                        <Input
                                            type="number"
                                            value={formData["maps_custom_height"] || "450"}
                                            onChange={(e) => handleChange("maps_custom_height", e.target.value)}
                                            placeholder="450"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
