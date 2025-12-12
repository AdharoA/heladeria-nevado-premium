# 🔧 Backend - Heladería Nevado

Backend robusto construido con Node.js, Express, tRPC y Drizzle ORM.

## 📋 Características

- ✅ APIs REST con tRPC (type-safe)
- ✅ Autenticación con Google OAuth + JWT
- ✅ Base de datos MySQL con Drizzle ORM
- ✅ Validación de datos con Zod
- ✅ Manejo de errores robusto
- ✅ Procedimientos almacenados
- ✅ Migraciones automáticas
- ✅ Tests unitarios con Vitest

## 🚀 Instalación

### Requisitos Previos

- Node.js v18+
- pnpm v10+ (o npm)
- MySQL 8.0+
- XAMPP (opcional, para desarrollo local)

### Pasos de Instalación

```bash
# 1. Navega a la carpeta backend
cd backend

# 2. Instala las dependencias
pnpm install

# 3. Configura la base de datos
# Crea un archivo .env.local en la raíz del backend
cat > .env.local << EOF
DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"
JWT_SECRET="tu_secreto_jwt_super_seguro_aqui"
VITE_APP_ID="tu_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
EOF

# 4. Crea las tablas en la base de datos
pnpm db:push

# 5. Inicia el servidor
pnpm dev
```

El backend estará disponible en: **http://localhost:3000**

## 📁 Estructura de Carpetas

```
backend/
├── db.ts                  # Funciones de base de datos
├── routers.ts             # Definición de APIs tRPC
├── storage.ts             # Gestión de archivos S3
├── auth.logout.test.ts    # Tests de autenticación
│
├── _core/                 # Configuración interna
│   ├── index.ts          # Punto de entrada del servidor
│   ├── context.ts        # Contexto de tRPC
│   ├── trpc.ts           # Configuración de tRPC
│   ├── env.ts            # Variables de entorno
│   ├── oauth.ts          # Configuración OAuth
│   ├── cookies.ts        # Gestión de cookies
│   ├── llm.ts            # Integración con IA
│   ├── notification.ts   # Notificaciones
│   ├── map.ts            # Integración con Maps
│   ├── imageGeneration.ts # Generación de imágenes
│   ├── voiceTranscription.ts # Transcripción de voz
│   └── systemRouter.ts   # Rutas del sistema
│
├── drizzle/              # Migraciones y esquema
│   ├── schema.ts         # Definición de tablas
│   ├── migrations/       # Archivos de migración
│   └── meta/             # Metadata de migraciones
│
├── package.json          # Dependencias
├── tsconfig.json         # Configuración TypeScript
├── vite.config.ts        # Configuración Vite
└── drizzle.config.ts     # Configuración Drizzle
```

## 🔌 APIs Disponibles

### Productos

```typescript
// Obtener lista de productos
GET /api/trpc/products.list?limit=10&offset=0

// Obtener producto por ID
GET /api/trpc/products.getById?id=1

// Buscar productos
GET /api/trpc/products.search?query=chocolate

// Crear producto (admin)
POST /api/trpc/products.create
{
  "name": "Helado de Vainilla",
  "description": "Vainilla pura",
  "price": 1000,
  "categoryId": 1,
  "stock": 50
}
```

### Categorías

```typescript
// Obtener todas las categorías
GET /api/trpc/categories.list

// Crear categoría (admin)
POST /api/trpc/categories.create
{
  "name": "Clásicos",
  "description": "Sabores tradicionales"
}
```

### Carrito

```typescript
// Obtener carrito del usuario
GET /api/trpc/cart.list

// Agregar producto al carrito
POST /api/trpc/cart.add
{
  "productId": 1,
  "quantity": 2
}

// Actualizar cantidad
POST /api/trpc/cart.update
{
  "cartItemId": 1,
  "quantity": 3
}

// Eliminar del carrito
POST /api/trpc/cart.remove
{
  "cartItemId": 1
}
```

### Pedidos

```typescript
// Obtener pedidos del usuario
GET /api/trpc/orders.list

// Crear pedido
POST /api/trpc/orders.create
{
  "totalAmount": 5000,
  "deliveryAddressId": 1,
  "paymentMethod": "credit_card",
  "items": [...]
}

// Obtener detalles del pedido
GET /api/trpc/orders.getById?id=1

// Actualizar estado (admin)
POST /api/trpc/orders.updateStatus
{
  "orderId": 1,
  "status": "shipped"
}
```

### Direcciones

```typescript
// Obtener direcciones del usuario
GET /api/trpc/addresses.list

// Crear dirección
POST /api/trpc/addresses.create
{
  "street": "Calle Principal",
  "number": "123",
  "city": "Huaraz",
  "province": "Ancash"
}

// Actualizar dirección
POST /api/trpc/addresses.update
{
  "id": 1,
  "street": "Nueva Calle"
}

// Eliminar dirección
POST /api/trpc/addresses.delete
{
  "id": 1
}
```

### Contacto

```typescript
// Crear contacto
POST /api/trpc/contacts.create
{
  "name": "Juan",
  "email": "juan@example.com",
  "subject": "Consulta",
  "message": "Tengo una pregunta..."
}

// Obtener contactos (admin)
GET /api/trpc/contacts.list

// Actualizar estado (admin)
POST /api/trpc/contacts.updateStatus
{
  "id": 1,
  "status": "responded"
}
```

### Autenticación

```typescript
// Obtener usuario actual
GET /api/trpc/auth.me

// Cerrar sesión
POST /api/trpc/auth.logout
```

## 🗄️ Base de Datos

### Tablas Principales

- **users** - Usuarios del sistema
- **products** - Catálogo de helados
- **categories** - Categorías de productos
- **cartItems** - Carrito de compras
- **orders** - Pedidos realizados
- **orderItems** - Detalles de pedidos
- **addresses** - Direcciones de entrega
- **transactions** - Transacciones de pago
- **contacts** - Formularios de contacto
- **aiConversations** - Historial de IA

### Migraciones

```bash
# Generar migración después de cambiar schema.ts
pnpm db:generate

# Aplicar migraciones a la base de datos
pnpm db:push

# Ver estado de migraciones
pnpm db:status

# Abrir Drizzle Studio (UI para base de datos)
pnpm db:studio
```

## 🔧 Configuración

### Variables de Entorno (.env.local)

```env
# Base de Datos
DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"

# Autenticación
JWT_SECRET="tu_secreto_super_seguro_aqui"

# OAuth
VITE_APP_ID="tu_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Propietario
OWNER_NAME="Tu Nombre"
OWNER_OPEN_ID="tu_open_id"

# APIs Internas
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="tu_api_key"

# Stripe (opcional)
STRIPE_SECRET_KEY="sk_test_..."

# Email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu_email@gmail.com"
SMTP_PASS="tu_contraseña"
```

## 🎯 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor con hot reload

# Base de Datos
pnpm db:push          # Crea/actualiza tablas
pnpm db:generate      # Genera migraciones
pnpm db:studio        # Abre UI de base de datos
pnpm db:migrate       # Ejecuta migraciones

# Compilación
pnpm build            # Compila para producción
pnpm start            # Inicia servidor en producción

# Calidad
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formatea código
pnpm test             # Ejecuta tests
pnpm test:watch      # Tests en modo watch
```

## 🔐 Autenticación y Seguridad

### Google OAuth

El flujo de autenticación es automático:

1. Usuario hace clic en "Iniciar Sesión"
2. Se redirige a Google OAuth
3. Después de autorizar, vuelve a `/api/oauth/callback`
4. Se crea/actualiza el usuario en la BD
5. Se genera un JWT y se guarda en cookie

### Proteger Rutas

```typescript
import { protectedProcedure } from "./_core/trpc";

export const protectedRouter = router({
  myData: protectedProcedure.query(({ ctx }) => {
    // ctx.user contiene los datos del usuario autenticado
    return { userId: ctx.user.id, name: ctx.user.name };
  }),
});
```

### Rutas de Admin

```typescript
import { adminProcedure } from "./_core/trpc";

export const adminRouter = router({
  deleteProduct: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      // Solo admins pueden ejecutar esto
      return deleteProduct(input.id);
    }),
});
```

## 📊 Validación de Datos

Se usa Zod para validar todos los inputs:

```typescript
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  price: z.number().positive(),
  categoryId: z.number().positive(),
  stock: z.number().nonnegative(),
});

export const createProduct = publicProcedure
  .input(createProductSchema)
  .mutation(({ input }) => {
    // input está validado y tipado
    return db.insertProduct(input);
  });
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests específicos
pnpm test auth.logout.test.ts

# Modo watch
pnpm test:watch

# Con cobertura
pnpm test --coverage
```

Ejemplo de test:

```typescript
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("auth.logout", () => {
  it("should clear session cookie", async () => {
    const caller = appRouter.createCaller(mockContext);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
```

## 🚀 Despliegue

### Heroku

```bash
# Instala Heroku CLI
npm i -g heroku

# Crea la app
heroku create heladeria-nevado

# Configura variables de entorno
heroku config:set DATABASE_URL="tu_url_mysql"
heroku config:set JWT_SECRET="tu_secreto"

# Despliega
git push heroku main
```

### Railway

```bash
# Instala Railway CLI
npm i -g @railway/cli

# Login
railway login

# Despliega
railway up
```

### Servidor Propio

```bash
# Compila
pnpm build

# Inicia en producción
NODE_ENV=production pnpm start

# O usa PM2 para mantenerlo corriendo
npm i -g pm2
pm2 start dist/index.js --name "heladeria-api"
```

## 🐛 Solución de Problemas

### Error: "Cannot find module"

```bash
# Reinstala dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Database connection failed"

```bash
# Verifica que MySQL esté corriendo
mysql -u root -p

# Comprueba la URL en .env.local
# Recrea la base de datos
mysql -u root -p -e "DROP DATABASE heladeria_nevado; CREATE DATABASE heladeria_nevado;"
pnpm db:push
```

### Error: "Port 3000 already in use"

```bash
# Usa un puerto diferente
PORT=3001 pnpm dev

# O mata el proceso
lsof -i :3000
kill -9 <PID>
```

## 📚 Recursos

- [Express.js](https://expressjs.com)
- [tRPC](https://trpc.io)
- [Drizzle ORM](https://orm.drizzle.team)
- [Zod](https://zod.dev)
- [TypeScript](https://www.typescriptlang.org)

## 📞 Soporte

Para problemas o preguntas:
- Revisa la documentación en INSTRUCCIONES.md
- Contacta al equipo de desarrollo
- Email: info@nevado.pe

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
