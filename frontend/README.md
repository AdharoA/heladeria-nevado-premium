# 🎨 Frontend - Heladería Nevado

Frontend moderno y responsivo construido con React 19, Tailwind CSS y TypeScript.

## 📋 Características

- ✅ Interfaz moderna con tema claro/oscuro
- ✅ Glassmorphism y transparencias épicas
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ Catálogo de productos con búsqueda y filtrado
- ✅ Carrito de compras funcional
- ✅ Checkout con múltiples métodos de pago
- ✅ Perfil de usuario y historial de pedidos
- ✅ Asistente de IA contextual
- ✅ Formulario de contacto
- ✅ Autenticación con Google OAuth

## 🚀 Instalación

### Requisitos Previos

- Node.js v18+
- pnpm v10+ (o npm)

### Pasos de Instalación

```bash
# 1. Navega a la carpeta frontend
cd frontend

# 2. Instala las dependencias
pnpm install

# 3. Configura las variables de entorno
# Crea un archivo .env.local en la raíz del frontend
echo 'VITE_API_URL=http://localhost:3000' > .env.local

# 4. Inicia el servidor de desarrollo
pnpm dev
```

El frontend estará disponible en: **http://localhost:5173**

## 📁 Estructura de Carpetas

```
frontend/
├── src/
│   ├── pages/              # Páginas principales
│   │   ├── Home.tsx        # Página de inicio
│   │   ├── Products.tsx    # Catálogo de productos
│   │   ├── Cart.tsx        # Carrito de compras
│   │   ├── Checkout.tsx    # Proceso de pago
│   │   ├── Profile.tsx     # Perfil de usuario
│   │   ├── Contact.tsx     # Formulario de contacto
│   │   ├── AIAssistant.tsx # Asistente de IA
│   │   └── NotFound.tsx    # Página 404
│   │
│   ├── components/         # Componentes reutilizables
│   │   ├── Navigation.tsx  # Barra de navegación
│   │   ├── AIFloatingButton.tsx # Botón flotante IA
│   │   └── ui/            # Componentes de UI (shadcn)
│   │
│   ├── contexts/          # React Contexts
│   │   └── ThemeContext.tsx # Contexto de tema
│   │
│   ├── hooks/             # Custom hooks
│   │   └── useAuth.ts     # Hook de autenticación
│   │
│   ├── lib/               # Utilidades
│   │   ├── trpc.ts       # Cliente tRPC
│   │   └── utils.ts      # Funciones auxiliares
│   │
│   ├── App.tsx            # Componente raíz
│   ├── main.tsx           # Punto de entrada
│   └── index.css          # Estilos globales
│
├── public/                # Archivos estáticos
├── package.json           # Dependencias
├── tsconfig.json          # Configuración TypeScript
├── vite.config.ts         # Configuración Vite
└── tailwind.config.ts     # Configuración Tailwind
```

## 🎨 Páginas Disponibles

| Página | Ruta | Descripción |
|--------|------|-------------|
| Inicio | `/` | Landing page con información de la heladería |
| Productos | `/products` | Catálogo con búsqueda y filtrado |
| Carrito | `/cart` | Gestión del carrito de compras |
| Checkout | `/checkout` | Proceso de compra y pago |
| Perfil | `/profile` | Datos del usuario y historial de pedidos |
| Contacto | `/contact` | Formulario de contacto y sugerencias |
| IA | `/ai-assistant` | Chatbot contextual |

## 🔧 Configuración

### Variables de Entorno (.env.local)

```env
# API Backend
VITE_API_URL=http://localhost:3000

# OAuth Google (opcional)
VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui

# Stripe (opcional)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Analytics (opcional)
VITE_ANALYTICS_ID=tu_analytics_id
```

## 🎯 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo

# Compilación
pnpm build            # Compila para producción
pnpm preview          # Vista previa de producción

# Calidad de código
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formatea código con Prettier
pnpm lint             # Ejecuta linter (si está configurado)

# Testing
pnpm test             # Ejecuta tests
pnpm test:watch      # Tests en modo watch
```

## 🎨 Tema Claro/Oscuro

El tema se puede cambiar usando el botón en la barra de navegación:

- **Modo Claro**: Fondo blanco, colores brillantes
- **Modo Oscuro**: Fondo oscuro, colores suaves

El tema se guarda en localStorage automáticamente.

## 🌐 Integración con Backend

El frontend se conecta al backend mediante tRPC:

```typescript
import { trpc } from "@/lib/trpc";

// Obtener datos
const { data: products } = trpc.products.list.useQuery();

// Enviar datos
const mutation = trpc.orders.create.useMutation({
  onSuccess: (data) => {
    console.log("Pedido creado:", data);
  }
});
```

## 📱 Responsividad

El diseño es completamente responsivo:

- **Móvil**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

Todos los componentes se adaptan automáticamente.

## 🔐 Autenticación

La autenticación se maneja automáticamente:

```typescript
import { useAuth } from "@/_core/hooks/useAuth";

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>;
  }
  
  return <div>Bienvenido, {user?.name}</div>;
}
```

## 🚀 Despliegue

### Vercel (Recomendado)

```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega
vercel
```

### Netlify

```bash
# Instala Netlify CLI
npm i -g netlify-cli

# Despliega
netlify deploy --prod --dir=dist
```

### Servidor Propio

```bash
# Compila
pnpm build

# Sirve los archivos estáticos de dist/
# Puedes usar nginx, Apache, o cualquier servidor web
```

## 🐛 Solución de Problemas

### El servidor no inicia

```bash
# Verifica que el puerto 5173 esté disponible
# O usa un puerto diferente
pnpm dev --port 3001
```

### Errores de TypeScript

```bash
# Verifica los tipos
pnpm check

# Limpia y reinstala
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### No se conecta con el backend

```bash
# Verifica que el backend esté corriendo en http://localhost:3000
# Comprueba la variable VITE_API_URL en .env.local
```

## 📚 Recursos

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [tRPC](https://trpc.io)
- [Vite](https://vitejs.dev)

## 📞 Soporte

Para problemas o preguntas:
- Revisa la documentación en INSTRUCCIONES.md
- Contacta al equipo de desarrollo
- Email: info@nevado.pe

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
