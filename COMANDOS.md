# 🚀 Comandos Rápidos - Heladería Nevado

## Instalación Inicial (Primera Vez)

```bash
# 1. Navega a la carpeta del proyecto
cd heladeria-nevado-ecommerce

# 2. Instala todas las dependencias
pnpm install

# 3. Configura la base de datos
pnpm db:push

# 4. Inicia el servidor
pnpm dev
```

---

## Comandos Principales

### Desarrollo

```bash
# Inicia el servidor de desarrollo (Frontend + Backend)
pnpm dev

# Abre en tu navegador: http://localhost:3000
```

### Base de Datos

```bash
# Crea/actualiza las tablas en MySQL
pnpm db:push

# Genera migraciones de base de datos
pnpm db:generate

# Abre la interfaz de Drizzle Studio
pnpm db:studio
```

### Compilación

```bash
# Compila el proyecto para producción
pnpm build

# Verifica errores de TypeScript
pnpm check

# Formatea el código
pnpm format
```

### Testing

```bash
# Ejecuta los tests
pnpm test

# Ejecuta tests en modo watch
pnpm test:watch
```

---

## Configuración Inicial de MySQL

### Con XAMPP

```bash
# 1. Abre phpMyAdmin
# http://localhost/phpmyadmin/

# 2. Crea la base de datos
# En la consola SQL, ejecuta:
CREATE DATABASE heladeria_nevado;

# 3. Crea el archivo .env.local
echo 'DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"' > .env.local

# 4. Crea las tablas
pnpm db:push
```

### Con MySQL Instalado Localmente

```bash
# 1. Abre la terminal de MySQL
mysql -u root -p

# 2. Crea la base de datos
CREATE DATABASE heladeria_nevado;
EXIT;

# 3. Crea el archivo .env.local
echo 'DATABASE_URL="mysql://root:tu_contraseña@localhost:3306/heladeria_nevado"' > .env.local

# 4. Crea las tablas
pnpm db:push
```

---

## Insertar Datos de Prueba

```bash
# Accede a MySQL
mysql -u root -p heladeria_nevado

# Inserta categorías
INSERT INTO categories (name, description) VALUES 
('Clásicos', 'Sabores tradicionales'),
('Especiales', 'Sabores creativos'),
('Sin Azúcar', 'Opciones saludables');

# Inserta productos
INSERT INTO products (name, description, price, categoryId, stock) VALUES
('Helado de Vainilla', 'Vainilla pura y cremosa', 1000, 1, 50),
('Helado de Chocolate', 'Chocolate belga intenso', 1200, 1, 40),
('Helado de Fresa', 'Fresa fresca natural', 1100, 1, 35),
('Helado de Menta', 'Menta refrescante', 1100, 1, 30),
('Helado de Cookies', 'Cookies y crema', 1300, 2, 25);
```

---

## Acceso a la Aplicación

```bash
# Frontend (Interfaz del Usuario)
http://localhost:3000

# API tRPC (Backend)
http://localhost:3000/api/trpc

# phpMyAdmin (Gestión de Base de Datos)
http://localhost/phpmyadmin/

# Drizzle Studio (Interfaz de Base de Datos)
pnpm db:studio
```

---

## Solución de Problemas Rápida

### El servidor no inicia

```bash
# Verifica que el puerto 3000 esté disponible
# Si no, usa otro puerto:
PORT=3001 pnpm dev

# O mata el proceso que usa el puerto:
# En Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Error de base de datos

```bash
# Verifica que MySQL esté corriendo
# En XAMPP, inicia MySQL desde el panel

# Comprueba la conexión
mysql -u root -p -e "SELECT 1;"

# Recrea la base de datos
mysql -u root -p -e "DROP DATABASE heladeria_nevado; CREATE DATABASE heladeria_nevado;"
pnpm db:push
```

### Dependencias rotas

```bash
# Limpia e reinstala
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm db:push
pnpm dev
```

---

## Flujo de Desarrollo Típico

```bash
# 1. Inicia el servidor
pnpm dev

# 2. Abre http://localhost:3000 en el navegador

# 3. Realiza cambios en los archivos
# El servidor se recarga automáticamente

# 4. Si cambias el schema de base de datos:
pnpm db:push

# 5. Cuando termines, compila para producción:
pnpm build
pnpm start
```

---

## Estructura de Carpetas Importante

```
heladeria-nevado-ecommerce/
├── client/src/pages/          # Páginas (Home, Products, Cart, etc)
├── client/src/components/     # Componentes reutilizables
├── server/routers.ts          # APIs tRPC
├── server/db.ts               # Funciones de base de datos
├── drizzle/schema.ts          # Definición de tablas
├── .env.local                 # Variables de entorno (crear)
└── INSTRUCCIONES.md           # Documentación completa
```

---

## Variables de Entorno (.env.local)

```env
# Base de Datos (REQUERIDO)
DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"

# Autenticación (se generan automáticamente)
JWT_SECRET="tu_secreto_aqui"

# OAuth Google (opcional, para producción)
VITE_APP_ID="tu_app_id"
OAUTH_SERVER_URL="https://api.manus.im"

# Stripe (opcional, para pagos)
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

---

## Rutas Disponibles

```
GET  /                    → Página de inicio
GET  /products            → Catálogo de productos
GET  /cart                → Carrito de compras
GET  /checkout            → Proceso de pago
GET  /profile             → Perfil de usuario
GET  /contact             → Formulario de contacto
GET  /ai-assistant        → Asistente de IA
GET  /api/trpc/*          → APIs REST
```

---

## Atajos Útiles

```bash
# Ver logs en tiempo real
pnpm dev 2>&1 | tee app.log

# Compilar sin iniciar servidor
pnpm build

# Verificar tipos de TypeScript
pnpm check

# Formatear código automáticamente
pnpm format

# Limpiar caché
rm -rf .next dist node_modules/.vite
```

---

## Contacto y Soporte

Si tienes problemas:
1. Revisa INSTRUCCIONES.md
2. Verifica los logs en la consola
3. Contacta a: info@nevado.pe

---

**Última actualización**: Noviembre 2025
