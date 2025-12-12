# 👥 Usuarios y Roles - Heladería Nevado

## Estructura de Roles

### 1. **ADMIN** (Administrador)
Tiene acceso completo al sistema y puede:

✅ **Gestión de Productos**
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Actualizar stock
- Cambiar categorías
- Subir imágenes

✅ **Gestión de Pedidos**
- Ver todos los pedidos
- Cambiar estado de pedidos (pending → confirmed → preparing → ready → shipped → delivered)
- Agregar notas a pedidos
- Cancelar pedidos
- Generar reportes

✅ **Gestión de Usuarios**
- Ver lista de usuarios
- Cambiar roles de usuarios
- Ver historial de compras
- Contactar usuarios

✅ **Gestión de Contactos**
- Ver formularios de contacto
- Responder consultas
- Marcar como resuelto

✅ **Reportes y Estadísticas**
- Ver dashboard con KPIs
- Productos más vendidos
- Clientes más activos
- Ingresos totales

---

### 2. **USER** (Cliente/Comprador)
Tiene acceso limitado para comprar:

✅ **Permitido**
- Ver catálogo de productos
- Buscar y filtrar productos
- Agregar productos al carrito
- Ver carrito
- Realizar compras
- Ver perfil personal
- Ver historial de pedidos
- Actualizar datos personales
- Guardar direcciones de entrega
- Usar ADARA (asistente de IA)
- Enviar formularios de contacto

❌ **NO Permitido**
- Agregar/editar/eliminar productos
- Ver pedidos de otros usuarios
- Acceder al panel administrativo
- Cambiar roles de usuarios
- Ver reportes administrativos

---

## Usuarios de Prueba

### Usuario Administrador

```
Email: admin@heladeria-nevado.com
OpenID: admin-001
Rol: ADMIN
Contraseña: (Se autentica por Google OAuth)
```

**Acceso:**
- Panel Admin: `/admin`
- Todas las funcionalidades

---

### Usuarios Clientes

```
1. Juan Pérez
   Email: juan@example.com
   OpenID: user-001
   Rol: USER
   Dirección: Calle Principal 123, Lima

2. María García
   Email: maria@example.com
   OpenID: user-002
   Rol: USER
   Dirección: Avenida Secundaria 456, Arequipa

3. Carlos López
   Email: carlos@example.com
   OpenID: user-003
   Rol: USER
   Dirección: Calle Terciaria 789, Cusco
```

---

## Cómo Acceder

### 1. Como Cliente
1. Abre la aplicación: `http://localhost:5173`
2. Haz clic en **"Iniciar Sesión"**
3. Autentica con Google
4. Navega por el catálogo y compra

### 2. Como Administrador
1. Abre la aplicación: `http://localhost:5173`
2. Haz clic en **"Iniciar Sesión"**
3. Autentica con Google (usa cuenta admin)
4. Ve a `/admin` o haz clic en **"Panel Admin"** en la navegación
5. Gestiona productos, pedidos y usuarios

---

## Control de Acceso en el Código

### Backend (tRPC)

```typescript
// Procedimiento público (cualquiera)
publicProcedure.query(...)

// Procedimiento protegido (solo usuarios autenticados)
protectedProcedure.query(...)

// Procedimiento solo admin
adminProcedure.mutation(...)
```

### Frontend (React)

```typescript
// Verificar si es admin
if (user?.role !== "admin") {
  return <AccessDenied />;
}

// Mostrar botón solo para admins
{user?.role === "admin" && (
  <Button>Gestionar Productos</Button>
)}
```

---

## Cambiar Rol de Usuario

### Opción 1: Desde PhpMyAdmin

1. Abre `http://localhost/phpmyadmin`
2. Ve a la tabla `users`
3. Edita el usuario
4. Cambia el campo `role` a `admin` o `user`
5. Guarda

### Opción 2: Desde SQL

```sql
-- Promover a admin
UPDATE users SET role = 'admin' WHERE email = 'usuario@example.com';

-- Degradar a usuario
UPDATE users SET role = 'user' WHERE email = 'usuario@example.com';
```

---

## Permisos por Página

| Página | Admin | User | Visitante |
|--------|-------|------|-----------|
| `/` (Inicio) | ✅ | ✅ | ✅ |
| `/products` (Catálogo) | ✅ | ✅ | ✅ |
| `/cart` (Carrito) | ✅ | ✅ | ❌ |
| `/checkout` (Pago) | ✅ | ✅ | ❌ |
| `/profile` (Perfil) | ✅ | ✅ | ❌ |
| `/contact` (Contacto) | ✅ | ✅ | ✅ |
| `/admin` (Panel Admin) | ✅ | ❌ | ❌ |
| `/ai-assistant` (ADARA) | ✅ | ✅ | ✅ |

---

## Funcionalidades por Rol

### ADMIN - Panel Administrativo

#### Dashboard
- 📊 Estadísticas de ventas
- 📈 Gráficos de ingresos
- 👥 Clientes activos
- 📦 Productos en stock

#### Gestión de Productos
- ➕ Agregar producto
- ✏️ Editar producto
- 🗑️ Eliminar producto
- 📸 Subir imagen
- 📊 Ver stock
- 🏷️ Cambiar categoría

#### Gestión de Pedidos
- 📋 Ver todos los pedidos
- 🔄 Cambiar estado
- 📝 Agregar notas
- ❌ Cancelar pedido
- 📧 Notificar cliente

#### Gestión de Usuarios
- 👥 Ver lista de usuarios
- 🔐 Cambiar roles
- 📊 Ver historial
- 📞 Contactar usuario

#### Reportes
- 💰 Ingresos totales
- 🏆 Productos más vendidos
- ⭐ Clientes VIP
- 📅 Ventas por período

---

### USER - Área de Cliente

#### Compra
- 🛍️ Navegar catálogo
- 🔍 Buscar productos
- 🛒 Carrito de compras
- 💳 Realizar pago
- 📦 Rastrear pedidos

#### Perfil
- 👤 Editar datos personales
- 📍 Guardar direcciones
- 📜 Ver historial de compras
- 💬 Ver notificaciones

#### Interacción
- 💬 Chat con ADARA
- 📧 Formulario de contacto
- ⭐ Dejar reseñas

---

## Seguridad

### Protección de Datos
- ✅ Contraseñas hasheadas (OAuth)
- ✅ JWT para sesiones
- ✅ HTTPS en producción
- ✅ Validación de roles en backend
- ✅ Sanitización de entrada

### Auditoría
- ✅ Registro de cambios
- ✅ Historial de pedidos
- ✅ Log de acceso admin
- ✅ Timestamps en todas las acciones

---

## Troubleshooting

### No puedo acceder al panel admin

**Solución:**
1. Verifica que tu usuario tiene `role = 'admin'`
2. Cierra sesión y vuelve a iniciar
3. Limpia cookies del navegador

### No veo el botón de admin

**Solución:**
1. Recarga la página (F5)
2. Verifica que estás autenticado
3. Comprueba que tu rol es 'admin'

### Cambios en rol no se aplican

**Solución:**
1. Cierra sesión completamente
2. Limpia el cache del navegador
3. Vuelve a iniciar sesión

---

## Próximas Mejoras

- [ ] Sistema de permisos granulares
- [ ] Roles personalizados
- [ ] Auditoría detallada
- [ ] Notificaciones en tiempo real
- [ ] 2FA (autenticación de dos factores)
- [ ] Backup automático
- [ ] Logs de seguridad

---

## Contacto y Soporte

Para problemas con usuarios o roles, contacta al administrador del sistema.

¡Listo! Tu sistema de usuarios y roles está completamente configurado. 🎉
