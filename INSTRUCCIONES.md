# Heladería Nevado - E-commerce Completo

## 📋 Descripción del Proyecto

Sistema de comercio electrónico completo para la Heladería Nevado con:
- **Frontend**: React 19 + Tailwind CSS + TypeScript
- **Backend**: Express + tRPC + Node.js
- **Base de Datos**: MySQL
- **Autenticación**: Google OAuth + JWT
- **Asistente de IA**: Chatbot contextual con recomendaciones
- **Pagos**: Integración con Stripe (lista para implementar)

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18+ (descargar de https://nodejs.org/)
- **pnpm** v10+ (gestor de paquetes)
  ```bash
  npm install -g pnpm
  ```
- **MySQL** (XAMPP o instalación local)
  ```bash
  # Si usas XAMPP, inicia Apache y MySQL desde el panel de control
  ```
- **Git** (opcional, para clonar el repositorio)

---

## 📦 Instalación y Configuración

### Paso 1: Descargar el Proyecto

```bash
# Si tienes el archivo comprimido, extrae primero
unzip heladeria-nevado-ecommerce.zip
cd heladeria-nevado-ecommerce
```

### Paso 2: Instalar Dependencias

```bash
# Instala todas las dependencias del proyecto
pnpm install
```

### Paso 3: Configurar la Base de Datos

#### Opción A: Usando XAMPP (Recomendado)

1. **Inicia XAMPP**:
   - Abre el panel de control de XAMPP
   - Inicia los servicios de Apache y MySQL

2. **Crea la base de datos**:
   ```bash
   # Abre phpMyAdmin en http://localhost/phpmyadmin/
   # O usa la línea de comandos:
   mysql -u root -p
   # Luego ejecuta:
   CREATE DATABASE heladeria_nevado;
   ```

3. **Configura la variable de entorno**:
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Agrega la siguiente línea:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"
   ```
   
   Si tu MySQL tiene contraseña:
   ```
   DATABASE_URL="mysql://root:tu_contraseña@localhost:3306/heladeria_nevado"
   ```

#### Opción B: Usando MySQL Instalado Localmente

```bash
# Crea la base de datos
mysql -u root -p -e "CREATE DATABASE heladeria_nevado;"

# Configura el archivo .env.local con tus credenciales
DATABASE_URL="mysql://usuario:contraseña@localhost:3306/heladeria_nevado"
```

### Paso 4: Crear las Tablas en la Base de Datos

```bash
# Genera las migraciones y crea las tablas
pnpm db:push
```

Este comando:
- Genera los archivos de migración
- Crea todas las tablas en MySQL
- Configura las relaciones entre tablas

---

## 🏃 Ejecutar el Proyecto

### Modo Desarrollo

```bash
# Inicia el servidor de desarrollo
pnpm dev
```

El proyecto estará disponible en:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/trpc

### Compilar para Producción

```bash
# Compila el frontend y backend
pnpm build

# Inicia el servidor en producción
pnpm start
```

---

## 📁 Estructura del Proyecto

```
heladeria-nevado-ecommerce/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas principales
│   │   │   ├── Home.tsx            # Página de inicio
│   │   │   ├── Products.tsx        # Catálogo de productos
│   │   │   ├── Cart.tsx            # Carrito de compras
│   │   │   ├── Checkout.tsx        # Proceso de pago
│   │   │   ├── Profile.tsx         # Perfil de usuario
│   │   │   ├── Contact.tsx         # Formulario de contacto
│   │   │   └── AIAssistant.tsx     # Asistente de IA
│   │   ├── components/             # Componentes reutilizables
│   │   ├── lib/                    # Utilidades y configuración
│   │   ├── App.tsx                 # Componente principal
│   │   └── index.css               # Estilos globales
│   └── public/                     # Archivos estáticos
│
├── server/                          # Backend Node.js
│   ├── routers.ts                  # Definición de APIs tRPC
│   ├── db.ts                       # Funciones de base de datos
│   └── _core/                      # Configuración interna
│
├── drizzle/                        # Migraciones de base de datos
│   └── schema.ts                   # Definición de tablas
│
├── package.json                    # Dependencias del proyecto
├── tsconfig.json                   # Configuración de TypeScript
├── tailwind.config.ts              # Configuración de Tailwind CSS
└── vite.config.ts                  # Configuración de Vite
```

---

## 🔑 Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"

# Autenticación (se generan automáticamente)
JWT_SECRET="tu_secreto_jwt_aqui"

# OAuth (configura en la plataforma Manus)
VITE_APP_ID="tu_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Stripe (para pagos)
STRIPE_SECRET_KEY="sk_test_..."
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

---

## 🎯 Funcionalidades Principales

### 1. **Página de Inicio**
- Hero section con call-to-action
- Información sobre la heladería
- Navegación principal
- Footer con contacto

### 2. **Catálogo de Productos**
- Listado de helados con búsqueda
- Filtrado por categorías
- Información de precio y stock
- Agregar al carrito

### 3. **Carrito de Compras**
- Visualizar productos agregados
- Modificar cantidades
- Eliminar productos
- Resumen de precios

### 4. **Checkout**
- Seleccionar dirección de entrega
- Elegir método de pago
- Confirmar pedido
- Resumen final

### 5. **Perfil de Usuario**
- Ver información personal
- Editar perfil
- Historial de pedidos
- Estado de pedidos

### 6. **Asistente de IA**
- Chat contextual con recomendaciones
- Respuestas sobre productos
- Información de entregas
- Ayuda con pedidos

### 7. **Formulario de Contacto**
- Enviar consultas
- Reportar problemas
- Sugerencias y reclamos
- Integración con WhatsApp

---

## 🔐 Autenticación

### Google OAuth

El sistema incluye autenticación con Google OAuth. Para configurarlo:

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega las URLs autorizadas:
   - http://localhost:3000
   - http://localhost:3000/api/oauth/callback

6. Configura las variables de entorno con tus credenciales

### JWT

Los tokens JWT se generan automáticamente y se almacenan en cookies seguras.

---

## 💳 Integración de Pagos (Stripe)

Para habilitar pagos con Stripe:

1. Crea una cuenta en https://stripe.com/
2. Obtén tus claves de API
3. Agrega las variables de entorno:
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   VITE_STRIPE_PUBLIC_KEY="pk_test_..."
   ```

4. Implementa el webhook de Stripe para confirmaciones de pago

---

## 📊 Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema
- **products**: Catálogo de helados
- **categories**: Categorías de productos
- **cartItems**: Carrito de compras
- **orders**: Pedidos realizados
- **orderItems**: Detalles de cada pedido
- **addresses**: Direcciones de entrega
- **transactions**: Registro de pagos
- **contacts**: Formularios de contacto
- **aiConversations**: Historial de IA

### Consultas Útiles

```sql
-- Ver todos los productos
SELECT * FROM products;

-- Ver órdenes de un usuario
SELECT * FROM orders WHERE userId = 1;

-- Ver contactos sin responder
SELECT * FROM contacts WHERE status = 'new';

-- Estadísticas de ventas
SELECT COUNT(*) as total_ordenes, SUM(totalAmount) as ingresos FROM orders;
```

---

## 🧪 Pruebas

### Crear Datos de Prueba

```bash
# Accede a la consola de MySQL
mysql -u root -p heladeria_nevado

# Inserta categorías de ejemplo
INSERT INTO categories (name, description) VALUES 
('Clásicos', 'Sabores tradicionales'),
('Especiales', 'Sabores únicos y creativos'),
('Sin Azúcar', 'Opciones saludables');

# Inserta productos de ejemplo
INSERT INTO products (name, description, price, categoryId, stock) VALUES
('Helado de Vainilla', 'Vainilla pura y cremosa', 1000, 1, 50),
('Helado de Chocolate', 'Chocolate belga intenso', 1200, 1, 40),
('Helado de Fresa', 'Fresa fresca natural', 1100, 1, 35);
```

### Flujo de Prueba Completo

1. **Registro e Inicio de Sesión**
   - Haz clic en "Iniciar Sesión"
   - Usa tu cuenta de Google

2. **Explorar Productos**
   - Ve a "Productos"
   - Busca o filtra por categoría
   - Haz clic en un producto

3. **Agregar al Carrito**
   - Haz clic en "Agregar"
   - Verifica que aparezca en el carrito

4. **Checkout**
   - Ve a "Carrito"
   - Haz clic en "Proceder al Pago"
   - Selecciona dirección y método de pago
   - Confirma el pedido

5. **Ver Perfil**
   - Haz clic en "Mi Perfil"
   - Verifica tu pedido en el historial

6. **Usar Asistente de IA**
   - Ve a "Asistente de IA"
   - Haz preguntas sobre productos
   - Solicita recomendaciones

---

## 🐛 Solución de Problemas

### Error: "Cannot find module"

```bash
# Reinstala las dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "Database connection failed"

1. Verifica que MySQL esté corriendo
2. Comprueba la URL de conexión en `.env.local`
3. Verifica que la base de datos exista

```bash
# Crea la base de datos nuevamente
mysql -u root -p -e "CREATE DATABASE heladeria_nevado;"
pnpm db:push
```

### Error: "Port 3000 already in use"

```bash
# Usa un puerto diferente
PORT=3001 pnpm dev
```

### El frontend no se conecta con el backend

1. Verifica que el servidor esté corriendo en http://localhost:3000
2. Abre la consola del navegador (F12) y revisa los errores
3. Reinicia el servidor: `pnpm dev`

---

## 📱 Características Móviles

El proyecto es completamente responsive:
- Diseño mobile-first
- Navegación adaptativa
- Formularios optimizados para móvil
- Botones grandes y accesibles

---

## 🚀 Despliegue en Producción

### Opción 1: Vercel (Recomendado para Frontend)

```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega
vercel
```

### Opción 2: Heroku

```bash
# Instala Heroku CLI
npm i -g heroku

# Crea la app
heroku create heladeria-nevado

# Configura variables de entorno
heroku config:set DATABASE_URL="tu_url_mysql"

# Despliega
git push heroku main
```

### Opción 3: Servidor Propio

```bash
# Compila el proyecto
pnpm build

# Inicia en producción
NODE_ENV=production pnpm start
```

---

## 📞 Soporte y Contacto

Para problemas o preguntas:
- 📧 Email: info@nevado.pe
- 📱 WhatsApp: https://wa.me/51943123456
- 🌐 Sitio web: https://nevado.pe

---

## 📄 Licencia

Este proyecto es propiedad de Heladería Nevado. Todos los derechos reservados.

---

## ✅ Checklist de Implementación

- [x] Base de datos MySQL configurada
- [x] APIs REST con tRPC implementadas
- [x] Autenticación con Google OAuth
- [x] Página de inicio
- [x] Catálogo de productos
- [x] Carrito de compras
- [x] Checkout
- [x] Perfil de usuario
- [x] Formulario de contacto
- [x] Asistente de IA
- [ ] Integración de Stripe (próximamente)
- [ ] Panel administrativo (próximamente)
- [ ] Notificaciones por email (próximamente)

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
