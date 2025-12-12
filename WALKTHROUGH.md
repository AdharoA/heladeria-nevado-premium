
# Heladería Nevado Premium - Walkthrough

## Cambios Realizados

### 1. Corrección de Doble Navbar
Se eliminaron las barras de navegación hardcodeadas en `Home.tsx` y `Products.tsx`. Ahora la aplicación utiliza únicamente el componente `Navigation` global definido en `App.tsx`, eliminando la duplicidad visual.

### 2. Base de Datos y Productos
Se creó y ejecutó un script de "semilla" (`server/seed.ts`) que pobló la base de datos con:
- **Usuarios de prueba**: Admin, Juan, María, Carlos.
- **Categorías**: Clásicos, Especiales, Sin Azúcar, etc.
- **Productos**: Helados de vainilla, chocolate, pistacho, etc.

Esto soluciona el problema de que no se mostraban productos en la página.

### 3. Asistente de IA (Ollama)
- **Modal Flotante**: Se reemplazó la redirección a una página separada por un **chat flotante** (`AIChatModal.tsx`) que se abre al hacer clic en el botón de la esquina inferior derecha.
- **Estabilidad**: Se simplificó el componente para evitar errores de animación que causaban caídas.
- **Prueba de Conexión**: Se agregó un botón "Probar Conexión" dentro del chat para verificar si Ollama está respondiendo.
- **Backend**: Se implementó un router de IA en el servidor (`server/routers.ts`) que se comunica con una instancia local de **Ollama**.

**Requisito**: Debes tener [Ollama](https://ollama.com/) ejecutándose localmente (`ollama serve`) y haber descargado el modelo `llama3` (o puedes cambiar el modelo en `server/routers.ts`).
```bash
ollama run llama3
```

### 4. Autenticación y Registro (Modo Desarrollo)
Se mejoró la página `/dev-login` para facilitar el desarrollo:
- **Registro de Usuarios**: Ahora puedes crear nuevos usuarios con rol "User" o "Admin" directamente desde la interfaz.
- **Inicio de Sesión**: Selecciona un usuario existente o uno recién creado para entrar sin contraseñas.
- **Redirección**: El carrito y el botón de login redirigen automáticamente a esta página.

### 5. Panel de Administración
Se creó un panel básico para administradores:
- **Ruta**: `/admin`
- **Acceso**: Solo visible en el menú si el usuario tiene rol "admin".
- **Contenido**: Muestra estadísticas básicas (mockeadas) y enlaces a gestión (futura).

## Cómo Probar

1.  **Iniciar el Servidor**:
    ```bash
    pnpm dev
    ```
2.  **Ver Productos**: Navega a la página de inicio o productos. Deberías ver la lista de helados.
3.  **Probar IA**:
    - Asegúrate de que Ollama esté corriendo.
    - Abre el chat flotante.
    - Haz clic en "Probar Conexión" para verificar.
    - Pregunta: "¿Qué sabores tienes?".
4.  **Registro y Login**:
    - Ve a "Iniciar Sesión".
    - Haz clic en "Registrarse" y crea un usuario "Admin".
    - Inicia sesión con ese usuario.
5.  **Admin Panel**:
    - Al estar logueado como admin, verás un enlace "Admin" en la barra superior.
    - Haz clic para ver el dashboard.
6.  **Carrito**:
    - Agrega productos al carrito.
    - Ve a la página de carrito para ver tus items.

## Archivos Clave Modificados
- `client/src/App.tsx`: Rutas y estructura global.
- `client/src/components/Navigation.tsx`: Enlace a login y admin.
- `client/src/pages/DevLogin.tsx`: Formulario de registro y login.
- `client/src/pages/AdminDashboard.tsx`: Nuevo panel de admin.
- `client/src/components/AIChatModal.tsx`: Chat con botón de prueba.
- `server/routers.ts`: Lógica de backend para IA, Auth y Registro.

## Solución de Problemas

### Error: OAUTH_SERVER_URL is not configured
Si ves este error en la consola, significa que faltan variables de entorno en el archivo `.env`.
Asegúrate de que tu archivo `.env` contenga:
```env
VITE_APP_ID="dummy-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://dummy-oauth.example.com"
```
**Importante**: Después de modificar el archivo `.env`, debes **reiniciar el servidor** (`Ctrl+C` y luego `pnpm dev`) para que los cambios surtan efecto.

