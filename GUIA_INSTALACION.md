# 📖 Guía de Instalación Completa - Heladería Nevado

Este documento explica cómo instalar y ejecutar el e-commerce de Heladería Nevado con las tres partes separadas: Frontend, Backend y Base de Datos.

## 📦 Estructura del Proyecto

```
heladeria-nevado-ecommerce/
├── frontend/          # React 19 + Tailwind CSS
├── backend/           # Node.js + Express + tRPC
├── database/          # Scripts SQL + Documentación
├── GUIA_INSTALACION.md
├── INSTRUCCIONES.md
└── COMANDOS.md
```

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Herramienta | Versión | Descargar |
|-------------|---------|-----------|
| Node.js | v18+ | https://nodejs.org/ |
| pnpm | v10+ | `npm install -g pnpm` |
| MySQL | 8.0+ | https://www.mysql.com/ o XAMPP |
| Git | Cualquiera | https://git-scm.com/ |

### Verificar Instalación

```bash
# Verifica las versiones instaladas
node --version      # v18.0.0 o superior
pnpm --version      # 10.0.0 o superior
mysql --version     # 8.0.0 o superior
```

---

## 🗄️ Paso 1: Configurar la Base de Datos

### Opción A: Con XAMPP (Recomendado para Desarrollo)

```bash
# 1. Abre XAMPP Control Panel
# 2. Haz clic en "Start" para Apache y MySQL
# 3. Abre phpMyAdmin: http://localhost/phpmyadmin/

# 4. En la consola SQL, ejecuta:
CREATE DATABASE heladeria_nevado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Opción B: Con MySQL en Línea de Comandos

```bash
# Conecta a MySQL
mysql -u root -p

# Ejecuta el script
mysql -u root -p < database/schema.sql

# O importa el archivo manualmente
mysql -u root -p heladeria_nevado < database/schema.sql
```

### Opción C: Con Docker

```bash
# Crea un contenedor MySQL
docker run --name heladeria-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=heladeria_nevado \
  -p 3306:3306 \
  -d mysql:8.0

# Espera a que se inicie (30 segundos) y luego
mysql -h 127.0.0.1 -u root -proot heladeria_nevado < database/schema.sql
```

### Verificar la Base de Datos

```bash
# Conecta a MySQL
mysql -u root -p

# Selecciona la base de datos
USE heladeria_nevado;

# Verifica las tablas
SHOW TABLES;

# Deberías ver:
# - users
# - products
# - categories
# - orders
# - cartItems
# - addresses
# - transactions
# - contacts
# - aiConversations
```

---

## 🔧 Paso 2: Configurar el Backend

### Instalación

```bash
# 1. Navega a la carpeta backend
cd backend

# 2. Instala las dependencias
pnpm install

# 3. Crea el archivo .env.local
cat > .env.local << EOF
DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"
JWT_SECRET="tu_secreto_jwt_super_seguro_aqui_minimo_32_caracteres"
VITE_APP_ID="tu_app_id_aqui"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"
OWNER_NAME="Tu Nombre"
OWNER_OPEN_ID="tu_open_id"
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="tu_api_key"
EOF

# 4. Sincroniza la base de datos
pnpm db:push

# 5. Inicia el servidor
pnpm dev
```

### Verificar que el Backend Funciona

```bash
# El servidor debe estar en http://localhost:3000
# Abre en el navegador:
http://localhost:3000/api/trpc/auth.me

# Deberías ver una respuesta JSON
```

---

## 🎨 Paso 3: Configurar el Frontend

### Instalación

```bash
# 1. Abre una NUEVA terminal (mantén el backend corriendo)
# 2. Navega a la carpeta frontend
cd frontend

# 3. Instala las dependencias
pnpm install

# 4. Crea el archivo .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:3000
EOF

# 5. Inicia el servidor de desarrollo
pnpm dev
```

### Verificar que el Frontend Funciona

```bash
# El servidor debe estar en http://localhost:5173
# Abre en el navegador:
http://localhost:5173

# Deberías ver la página de inicio de Heladería Nevado
```

---

## ✅ Verificación Completa

Si todo está funcionando correctamente, deberías poder:

### 1. **Acceder a la Página de Inicio**
```
http://localhost:5173
```
Deberías ver:
- ✅ Logo de Heladería Nevado
- ✅ Navegación con botón de tema (sol/luna)
- ✅ Botón flotante de IA en la esquina inferior derecha
- ✅ Hero section con información

### 2. **Cambiar Tema**
- Haz clic en el icono de sol/luna en la navegación
- El tema debe cambiar entre claro y oscuro

### 3. **Acceder a Productos**
```
http://localhost:5173/products
```
Deberías ver:
- ✅ Lista de helados
- ✅ Búsqueda funcional
- ✅ Filtrado por categorías

### 4. **Usar el Asistente de IA**
- Haz clic en el botón flotante de IA (esquina inferior derecha)
- Escribe un mensaje
- Deberías recibir una respuesta contextual

### 5. **Iniciar Sesión**
- Haz clic en "Iniciar Sesión"
- Usa tu cuenta de Google
- Deberías ver tu nombre en la navegación

### 6. **Agregar al Carrito**
- Ve a Productos
- Haz clic en "Agregar" en un helado
- El carrito debe actualizarse

### 7. **Ir al Checkout**
```
http://localhost:5173/checkout
```
Deberías ver:
- ✅ Formulario de dirección
- ✅ Métodos de pago
- ✅ Resumen de pedido

---

## 🎯 Flujo Completo de Compra

1. **Navega a http://localhost:5173**
2. **Haz clic en "Productos"**
3. **Busca o filtra helados**
4. **Agrega productos al carrito**
5. **Haz clic en el carrito (icono en la navegación)**
6. **Haz clic en "Proceder al Pago"**
7. **Selecciona dirección y método de pago**
8. **Haz clic en "Confirmar Pedido"**
9. **Verifica el pedido en tu perfil**

---

## 📱 Acceso a Diferentes Partes

| Componente | URL | Puerto | Comando |
|-----------|-----|--------|---------|
| Frontend | http://localhost:5173 | 5173 | `cd frontend && pnpm dev` |
| Backend | http://localhost:3000 | 3000 | `cd backend && pnpm dev` |
| Base de Datos | localhost:3306 | 3306 | MySQL corriendo |
| phpMyAdmin | http://localhost/phpmyadmin | 80 | XAMPP corriendo |

---

## 🔄 Comandos Rápidos

### Terminal 1: Base de Datos
```bash
# Asegúrate de que MySQL esté corriendo
# En XAMPP: Haz clic en "Start" para MySQL
# O en línea de comandos:
mysql -u root -p
```

### Terminal 2: Backend
```bash
cd backend
pnpm install
pnpm db:push
pnpm dev
# Esperará en http://localhost:3000
```

### Terminal 3: Frontend
```bash
cd frontend
pnpm install
pnpm dev
# Esperará en http://localhost:5173
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to MySQL"

```bash
# Verifica que MySQL esté corriendo
mysql -u root -p

# Si no funciona, reinicia MySQL
# En XAMPP: Haz clic en "Stop" y luego "Start"

# En Linux
sudo systemctl restart mysql

# En Mac
brew services restart mysql
```

### Error: "Port 3000 already in use"

```bash
# Usa un puerto diferente
cd backend
PORT=3001 pnpm dev
```

### Error: "Port 5173 already in use"

```bash
# Usa un puerto diferente
cd frontend
pnpm dev --port 5174
```

### Error: "Database doesn't exist"

```bash
# Recrea la base de datos
mysql -u root -p -e "DROP DATABASE heladeria_nevado; CREATE DATABASE heladeria_nevado;"

# Luego sincroniza desde el backend
cd backend
pnpm db:push
```

### El frontend no se conecta con el backend

```bash
# Verifica que el backend esté corriendo en http://localhost:3000
# Abre la consola del navegador (F12)
# Busca errores de conexión

# Verifica el archivo .env.local en frontend
cat frontend/.env.local
# Debe tener: VITE_API_URL=http://localhost:3000
```

### Tema claro/oscuro no funciona

```bash
# Limpia el localStorage del navegador
# Abre la consola (F12) y ejecuta:
localStorage.clear()

# Recarga la página
```

---

## 📊 Estructura de Carpetas Final

```
heladeria-nevado-ecommerce/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── README.md
│
├── backend/
│   ├── db.ts
│   ├── routers.ts
│   ├── storage.ts
│   ├── _core/
│   │   ├── index.ts
│   │   ├── context.ts
│   │   ├── trpc.ts
│   │   ├── env.ts
│   │   └── ...
│   ├── drizzle/
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   └── README.md
│
├── database/
│   ├── schema.sql
│   └── README.md
│
├── GUIA_INSTALACION.md (este archivo)
├── INSTRUCCIONES.md
└── COMANDOS.md
```

---

## 🎓 Próximos Pasos

Después de instalar exitosamente:

1. **Explorar el Código**
   - Revisa `frontend/src/pages/Home.tsx` para ver la estructura
   - Revisa `backend/routers.ts` para ver las APIs
   - Revisa `database/schema.sql` para ver las tablas

2. **Agregar Datos de Prueba**
   - Los datos ya están incluidos en `schema.sql`
   - Puedes agregar más productos manualmente

3. **Personalizar**
   - Cambia los colores en `frontend/src/index.css`
   - Modifica el logo en `frontend/public/`
   - Actualiza la información de contacto

4. **Integrar Stripe** (Próximo paso)
   - Obtén claves de Stripe
   - Configura las variables de entorno
   - Implementa el flujo de pago

5. **Desplegar a Producción**
   - Usa Vercel para el frontend
   - Usa Heroku o Railway para el backend
   - Usa un servicio de MySQL en la nube

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs**
   - Frontend: Consola del navegador (F12)
   - Backend: Terminal donde ejecutaste `pnpm dev`
   - Base de Datos: Logs de MySQL

2. **Consulta la documentación**
   - `frontend/README.md` - Documentación del frontend
   - `backend/README.md` - Documentación del backend
   - `database/README.md` - Documentación de la base de datos

3. **Contacta al equipo**
   - Email: info@nevado.pe
   - WhatsApp: https://wa.me/51943123456

---

## ✅ Checklist de Instalación

- [ ] Node.js v18+ instalado
- [ ] pnpm v10+ instalado
- [ ] MySQL 8.0+ instalado y corriendo
- [ ] Base de datos creada y tablas importadas
- [ ] Backend instalado y corriendo en puerto 3000
- [ ] Frontend instalado y corriendo en puerto 5173
- [ ] Puedo acceder a http://localhost:5173
- [ ] Puedo ver la página de inicio
- [ ] Puedo cambiar el tema claro/oscuro
- [ ] Puedo ver el botón flotante de IA
- [ ] Puedo ver los productos
- [ ] Puedo agregar productos al carrito
- [ ] Puedo ir al checkout

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0

¡Felicidades! 🎉 Tu e-commerce de Heladería Nevado está listo para usar.
