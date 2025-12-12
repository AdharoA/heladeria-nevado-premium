# 📊 Instalación de Base de Datos - Heladería Nevado

## Requisitos

- **XAMPP** instalado y ejecutándose (Apache + MySQL)
- **MySQL 8.0+** o MariaDB
- **PhpMyAdmin** (incluido en XAMPP)

---

## Opción 1: Importar SQL desde PhpMyAdmin (Recomendado)

### Paso 1: Iniciar XAMPP

1. Abre **XAMPP Control Panel**
2. Haz clic en **Start** para Apache y MySQL
3. Espera a que ambos servicios estén en verde ✅

### Paso 2: Acceder a PhpMyAdmin

1. Abre tu navegador
2. Ve a: `http://localhost/phpmyadmin`
3. Deberías ver la interfaz de PhpMyAdmin

### Paso 3: Crear Base de Datos

1. En PhpMyAdmin, haz clic en **"Nueva"** (lado izquierdo)
2. Nombre: `heladeria_nevado`
3. Cotejamiento: `utf8mb4_unicode_ci`
4. Haz clic en **"Crear"**

### Paso 4: Importar Script SQL

1. Selecciona la base de datos `heladeria_nevado`
2. Haz clic en la pestaña **"Importar"**
3. Haz clic en **"Seleccionar archivo"**
4. Busca y selecciona: `database/schema.sql`
5. Haz clic en **"Ejecutar"**
6. ¡Listo! La base de datos está creada con todos los datos de prueba

---

## Opción 2: Importar desde Línea de Comandos

### Paso 1: Abrir Terminal/CMD

**Windows:**
```bash
cd "C:\xampp\mysql\bin"
```

**Mac/Linux:**
```bash
cd /Applications/XAMPP/bin
```

### Paso 2: Conectar a MySQL

```bash
mysql -u root -p
```

Presiona Enter cuando pida contraseña (por defecto es vacía en XAMPP)

### Paso 3: Importar el Script

```bash
mysql -u root heladeria_nevado < ruta/a/database/schema.sql
```

O desde dentro de MySQL:

```sql
SOURCE /ruta/completa/a/database/schema.sql;
```

---

## Opción 3: Copiar y Pegar en PhpMyAdmin

1. Abre `database/schema.sql` con un editor de texto
2. Copia todo el contenido
3. En PhpMyAdmin, ve a la pestaña **"SQL"**
4. Pega el contenido
5. Haz clic en **"Ejecutar"**

---

## Verificar Instalación

### Desde PhpMyAdmin

1. En el lado izquierdo, expande `heladeria_nevado`
2. Deberías ver estas tablas:
   - ✅ users
   - ✅ categories
   - ✅ products
   - ✅ addresses
   - ✅ cartItems
   - ✅ orders
   - ✅ orderItems
   - ✅ transactions
   - ✅ contacts
   - ✅ aiConversations

### Desde Línea de Comandos

```bash
mysql -u root -e "USE heladeria_nevado; SHOW TABLES;"
```

Deberías ver todas las tablas listadas.

---

## Configurar Conexión en la Aplicación

### Backend (.env)

Crea un archivo `.env` en la carpeta `backend/`:

```env
DATABASE_URL="mysql://root:@localhost:3306/heladeria_nevado"
OLLAMA_API_URL="http://localhost:11434"
OLLAMA_MODEL="deepseek-r1:8b"
```

### Verificar Conexión

Ejecuta en la carpeta backend:

```bash
pnpm db:push
```

Si todo está bien, verás:

```
✅ Database connected successfully
```

---

## Datos de Prueba

La base de datos viene con datos de ejemplo:

### Categorías
- 🍦 Clásicos
- ✨ Especiales
- 💚 Sin Azúcar
- 👑 Premium
- 🎉 Infantiles

### Productos
- 13 helados diferentes con precios y stock

### Usuarios
- Ninguno al inicio (se crean con Google OAuth)

---

## Vistas Disponibles

La BD incluye 3 vistas útiles para reportes:

1. **sales_by_category** - Ventas por categoría
2. **top_products** - Productos más vendidos
3. **top_customers** - Clientes más activos

Accede en PhpMyAdmin → Vista

---

## Procedimientos Almacenados

1. **GetOrderSummary** - Obtener resumen de pedido
2. **UpdateProductStock** - Actualizar stock

---

## Troubleshooting

### Error: "Access denied for user 'root'"

**Solución:**
- Asegúrate de que MySQL está ejecutándose en XAMPP
- La contraseña por defecto en XAMPP es vacía

### Error: "Database already exists"

**Solución:**
- Elimina la BD existente en PhpMyAdmin
- O cambia el nombre en el script SQL

### Error: "Syntax error"

**Solución:**
- Asegúrate de que MySQL 8.0+ está instalado
- Intenta importar en PhpMyAdmin en lugar de línea de comandos

### Conexión lenta

**Solución:**
- Aumenta `max_connections` en `my.ini`
- Reinicia MySQL

---

## Backup de la Base de Datos

### Desde PhpMyAdmin

1. Selecciona `heladeria_nevado`
2. Haz clic en **"Exportar"**
3. Selecciona **"SQL"**
4. Haz clic en **"Ejecutar"**
5. Se descargará un archivo `.sql`

### Desde Línea de Comandos

```bash
mysqldump -u root heladeria_nevado > backup.sql
```

---

## Restaurar desde Backup

```bash
mysql -u root heladeria_nevado < backup.sql
```

---

## Notas Importantes

⚠️ **Seguridad:**
- En producción, cambia la contraseña del usuario `root`
- Crea un usuario específico para la aplicación
- Usa SSL/TLS para conexiones remotas

⚠️ **Performance:**
- Los índices ya están creados para optimización
- Haz backups regularmente
- Monitorea el tamaño de la BD

---

## Contacto y Soporte

Si tienes problemas:
1. Verifica que XAMPP está ejecutándose
2. Comprueba los logs en `XAMPP/mysql/data/`
3. Intenta reiniciar MySQL
4. Consulta la documentación de MySQL

¡Listo! Tu base de datos está instalada y lista para usar. 🎉
