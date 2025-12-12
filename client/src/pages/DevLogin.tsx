
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, User, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export default function DevLogin() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "register">("login");
    const [rememberMe, setRememberMe] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // REMOVED: Auto-login on page load - this was causing auto-login after logout

    // Registration state
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regRole, setRegRole] = useState<"user" | "admin">("user");

    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            toast.success("Usuario creado exitosamente");
            // Set rememberMe flag if checked
            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            }
            window.location.href = "/";
        },
        onError: (error) => {
            toast.error(error.message || "Error al registrar usuario");
            setIsLoading(false);
        }
    });

    const devLoginMutation = trpc.auth.devLogin.useMutation({
        onSuccess: () => {
            // Set rememberMe flag if checked
            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            }
            window.location.href = "/";
        },
        onError: (error) => {
            toast.error(error.message || "Error al iniciar sesión");
            setIsLoading(false);
        }
    });

    const loginByEmailMutation = trpc.auth.loginByEmail.useMutation({
        onSuccess: (data) => {
            // Set rememberMe flag if checked
            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            }
            window.location.href = "/";
        },
        onError: (error) => {
            toast.error(error.message || "Error al iniciar sesión");
            setIsLoading(false);
        }
    });

    const testUsers = [
        { id: 1, name: "Administrador", email: "admin@heladeria-nevado.com", role: "admin" },
        { id: 2, name: "Juan Pérez", email: "juan@example.com", role: "user" },
        { id: 3, name: "María García", email: "maria@example.com", role: "user" },
        { id: 4, name: "Carlos López", email: "carlos@example.com", role: "user" },
    ];

    const handleLogin = async (userId: number) => {
        setIsLoading(true);
        devLoginMutation.mutate({ userId });
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginEmail) {
            toast.error("Ingresa tu email");
            return;
        }
        setIsLoading(true);
        loginByEmailMutation.mutate({ email: loginEmail, password: loginPassword });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regName || !regEmail) {
            toast.error("Completa todos los campos");
            return;
        }
        setIsLoading(true);
        registerMutation.mutate({
            name: regName,
            email: regEmail,
            password: regPassword,
            role: regRole,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Modo Desarrollo</CardTitle>
                    <CardDescription>
                        {mode === "login"
                            ? "Selecciona un usuario para simular el inicio de sesión."
                            : "Crea un nuevo usuario de prueba."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={mode === "login" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setMode("login")}
                        >
                            Iniciar Sesión
                        </Button>
                        <Button
                            variant={mode === "register" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => setMode("register")}
                        >
                            Registrarse
                        </Button>
                    </div>

                    {mode === "login" ? (
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-4">
                                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(c) => setRememberMe(!!c)} />
                                <label
                                    htmlFor="remember"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Recordarme (Inicio de sesión rápido)
                                </label>
                            </div>

                            <form onSubmit={handleEmailLogin} className="space-y-2 border-b pb-4 mb-4">
                                <Label>Ingresar con Email</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="tu@email.com"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Contraseña"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                    />
                                    <Button type="submit" disabled={isLoading}>Entrar</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Ingresa tu email y contraseña.</p>
                            </form>

                            <div className="text-sm font-medium mb-2">Usuarios de Prueba:</div>
                            {testUsers.map((u) => (
                                <Button
                                    key={u.id}
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3"
                                    onClick={() => handleLogin(u.id)}
                                    disabled={isLoading}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.email} ({u.role})</div>
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                    placeholder="Ej: Nuevo Usuario"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                    placeholder="******"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={regRole === "user"}
                                            onChange={() => setRegRole("user")}
                                        /> Usuario
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="role"
                                            checked={regRole === "admin"}
                                            onChange={() => setRegRole("admin")}
                                        /> Admin
                                    </label>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                Crear Usuario
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

