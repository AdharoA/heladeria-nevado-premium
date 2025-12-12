import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, User, Calendar, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type ContactStatus = "new" | "read" | "responded" | "closed";
type ContactType = "suggestion" | "complaint" | "inquiry" | "other";

export default function AdminContacts() {
    const { user, isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const { data: contacts, refetch } = trpc.contacts.list.useQuery();
    const updateStatusMutation = trpc.contacts.updateStatus.useMutation();

    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [response, setResponse] = useState("");
    const [filterStatus, setFilterStatus] = useState<ContactStatus | "all">("all");

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

    const handleMarkAsRead = async (id: number) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status: "read" });
            toast.success("Marcado como leído");
            refetch();
        } catch (error) {
            toast.error("Error al actualizar");
        }
    };

    const handleRespond = async () => {
        if (!selectedContact || !response.trim()) {
            toast.error("Debes escribir una respuesta");
            return;
        }

        try {
            await updateStatusMutation.mutateAsync({
                id: selectedContact.id,
                status: "responded",
                response: response,
            });
            toast.success("Respuesta enviada");
            setResponse("");
            setSelectedContact(null);
            refetch();
        } catch (error) {
            toast.error("Error al enviar respuesta");
        }
    };

    const handleClose = async (id: number) => {
        try {
            await updateStatusMutation.mutateAsync({ id, status: "closed" });
            toast.success("Contacto cerrado");
            refetch();
        } catch (error) {
            toast.error("Error al cerrar");
        }
    };

    const getStatusBadge = (status: ContactStatus) => {
        const variants: Record<ContactStatus, { color: string; label: string }> = {
            new: { color: "bg-blue-500", label: "Nuevo" },
            read: { color: "bg-yellow-500", label: "Leído" },
            responded: { color: "bg-green-500", label: "Respondido" },
            closed: { color: "bg-gray-500", label: "Cerrado" },
        };
        const variant = variants[status];
        return (
            <Badge className={`${variant.color} text-white`}>
                {variant.label}
            </Badge>
        );
    };

    const getTypeBadge = (type: ContactType) => {
        const labels: Record<ContactType, string> = {
            suggestion: "Sugerencia",
            complaint: "Reclamo",
            inquiry: "Consulta",
            other: "Otro",
        };
        return <Badge variant="outline">{labels[type]}</Badge>;
    };

    const filteredContacts = contacts?.filter(c =>
        filterStatus === "all" || c.status === filterStatus
    ) || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-8">
            <div className="container mx-auto max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-8 h-8" />
                        Gestión de Contactos
                    </h1>
                </div>

                {/* Filtros */}
                <div className="mb-6 flex gap-2">
                    <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        onClick={() => setFilterStatus("all")}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={filterStatus === "new" ? "default" : "outline"}
                        onClick={() => setFilterStatus("new")}
                    >
                        Nuevos
                    </Button>
                    <Button
                        variant={filterStatus === "read" ? "default" : "outline"}
                        onClick={() => setFilterStatus("read")}
                    >
                        Leídos
                    </Button>
                    <Button
                        variant={filterStatus === "responded" ? "default" : "outline"}
                        onClick={() => setFilterStatus("responded")}
                    >
                        Respondidos
                    </Button>
                    <Button
                        variant={filterStatus === "closed" ? "default" : "outline"}
                        onClick={() => setFilterStatus("closed")}
                    >
                        Cerrados
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Lista de contactos */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Mensajes ({filteredContacts.length})</h2>
                        {filteredContacts.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-gray-500">
                                    No hay contactos para mostrar
                                </CardContent>
                            </Card>
                        ) : (
                            filteredContacts.map((contact) => (
                                <Card
                                    key={contact.id}
                                    className={`cursor-pointer hover:shadow-md transition-shadow ${selectedContact?.id === contact.id ? "ring-2 ring-blue-500" : ""
                                        }`}
                                    onClick={() => {
                                        setSelectedContact(contact);
                                        if (contact.status === "new") {
                                            handleMarkAsRead(contact.id);
                                        }
                                    }}
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{contact.subject}</CardTitle>
                                                <div className="flex gap-2 mt-2">
                                                    {getStatusBadge(contact.status)}
                                                    {getTypeBadge(contact.type)}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">{contact.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                <span>{contact.email}</span>
                                            </div>
                                            {contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{contact.phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(contact.createdAt).toLocaleDateString("es-ES")}</span>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {contact.message}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Panel de detalles */}
                    <div className="sticky top-8">
                        {selectedContact ? (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{selectedContact.subject}</CardTitle>
                                            <div className="flex gap-2 mt-2">
                                                {getStatusBadge(selectedContact.status)}
                                                {getTypeBadge(selectedContact.type)}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Información del contacto */}
                                    <div className="space-y-2 pb-4 border-b">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">{selectedContact.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                                                {selectedContact.email}
                                            </a>
                                        </div>
                                        {selectedContact.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">
                                                    {selectedContact.phone}
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">
                                                {new Date(selectedContact.createdAt).toLocaleString("es-ES")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mensaje */}
                                    <div>
                                        <h3 className="font-semibold mb-2">Mensaje:</h3>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {selectedContact.message}
                                        </p>
                                    </div>

                                    {/* Respuesta anterior si existe */}
                                    {selectedContact.response && (
                                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Respuesta enviada:
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {selectedContact.response}
                                            </p>
                                            {selectedContact.respondedAt && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {new Date(selectedContact.respondedAt).toLocaleString("es-ES")}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Formulario de respuesta */}
                                    {selectedContact.status !== "closed" && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">
                                                Responder al cliente:
                                            </label>
                                            <Textarea
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                                placeholder="Escribe tu respuesta aquí..."
                                                rows={6}
                                                className="w-full"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={handleRespond}
                                                    disabled={!response.trim() || updateStatusMutation.isPending}
                                                    className="flex-1"
                                                >
                                                    Enviar Respuesta
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleClose(selectedContact.id)}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    Cerrar
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center text-gray-500">
                                    Selecciona un contacto para ver los detalles
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
