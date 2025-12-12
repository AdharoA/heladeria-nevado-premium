# 🗄️ Base de Datos - Heladería Nevado

Este directorio contiene toda la configuración y scripts para la base de datos MySQL de Heladería Nevado.

## 📋 Contenido

- `schema.sql` - Script completo para crear la base de datos, tablas, índices, vistas y procedimientos
- `seed-data.sql` - Datos de prueba (opcional)
- `README.md` - Este archivo

## 🚀 Instalación Rápida

### Opción 1: Con XAMPP (Recomendado para Desarrollo)

```bash
# 1. Abre phpMyAdmin
# http://localhost/phpmyadmin/

# 2. Crea una nueva base de datos
# Nombre: heladeria_nevado
# Codificación: utf8mb4_unicode_ci

# 3. Importa el archivo schema.sql
# - Ve a la pestaña "Importar"
# - Selecciona el archivo schema.sql
# - Haz clic en "Ejecutar"
```

### Opción 2: Con Línea de Comandos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar el script
mysql -u root -p < schema.sql

# O si tienes contraseña
mysql -u root -p'tu_contraseña' < schema.sql
```

### Opción 3: Con Docker

```bash
# Si tienes Docker instalado
docker run --name heladeria-db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=heladeria_nevado -p 3306:3306 -d mysql:8.0

# Espera a que se inicie y luego
mysql -h 127.0.0.1 -u root -proot heladeria_nevado < schema.sql
```

## 📊 Estructura de Tablas

### Usuarios
- **users** - Usuarios del sistema (clientes y administradores)

### Productos
- **categories** - Categorías de helados
- **products** - Catálogo de productos

### Pedidos
- **orders** - Pedidos realizados
- **orderItems** - Detalles de cada pedido
- **addresses** - Direcciones de entrega

### Pagos
- **transactions** - Registro de transacciones

### Comunicación
- **contacts** - Formularios de contacto
- **aiConversations** - Historial de conversaciones con IA

## 🔧 Configuración de Conexión

### Para Node.js/Express

```javascript
const mysql = require('mysql2/promise');

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Dejar vacío si no hay contraseña
  database: 'heladeria_nevado'
});
```

### Para Drizzle ORM

```typescript
const DATABASE_URL = "mysql://root:@localhost:3306/heladeria_nevado";
```

### Para PHP

```php
$conn = new mysqli("localhost", "root", "", "heladeria_nevado");
if ($conn->connect_error) {
  die("Error: " . $conn->connect_error);
}
```

## 📈 Vistas Disponibles

### `sales_by_category`
Resumen de ventas por categoría de producto.

```sql
SELECT * FROM sales_by_category;
```

### `top_products`
Productos más vendidos ordenados por cantidad.

```sql
SELECT * FROM top_products LIMIT 10;
```

### `top_customers`
Clientes más activos ordenados por gasto total.

```sql
SELECT * FROM top_customers LIMIT 10;
```

## 🔄 Procedimientos Almacenados

### `GetOrderSummary(orderId)`
Obtiene un resumen completo de un pedido.

```sql
CALL GetOrderSummary(1);
```

### `UpdateProductStock(productId, quantity)`
Actualiza el stock de un producto.

```sql
CALL UpdateProductStock(1, 5);
```

## 📝 Datos de Prueba

El script `schema.sql` incluye datos de prueba automáticamente:

- 5 categorías de helados
- 13 productos de ejemplo
- Precios en centavos (multiplica por 100)

Ejemplo: 1000 = S/ 10.00

## 🔐 Seguridad

### Crear Usuario de Base de Datos

Para producción, crea un usuario específico:

```sql
CREATE USER 'heladeria_app'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON heladeria_nevado.* TO 'heladeria_app'@'localhost';
FLUSH PRIVILEGES;
```

### Hacer Backup

```bash
# Backup completo
mysqldump -u root -p heladeria_nevado > backup.sql

# Backup con compresión
mysqldump -u root -p heladeria_nevado | gzip > backup.sql.gz
```

### Restaurar Backup

```bash
# Restaurar desde archivo
mysql -u root -p heladeria_nevado < backup.sql

# Restaurar desde archivo comprimido
gunzip < backup.sql.gz | mysql -u root -p heladeria_nevado
```

## 📋 Consultas Útiles

### Ver todas las tablas
```sql
SHOW TABLES;
```

### Ver estructura de una tabla
```sql
DESCRIBE products;
```

### Contar registros
```sql
SELECT COUNT(*) FROM products;
```

### Ver órdenes recientes
```sql
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 10;
```

### Ingresos totales
```sql
SELECT SUM(totalAmount) as total_revenue FROM orders WHERE status = 'delivered';
```

### Productos con bajo stock
```sql
SELECT name, stock FROM products WHERE stock < 10;
```

## 🐛 Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
```bash
# Intenta sin contraseña
mysql -u root

# O especifica la contraseña
mysql -u root -p'tu_contraseña'
```

### Error: "Database 'heladeria_nevado' doesn't exist"
```bash
# Verifica que el script se ejecutó correctamente
mysql -u root -p
SHOW DATABASES;
```

### Error: "Can't connect to MySQL server"
```bash
# Verifica que MySQL esté corriendo
# En XAMPP, inicia el servicio MySQL desde el panel de control

# En Linux
sudo systemctl start mysql

# En Mac
brew services start mysql
```

## 📞 Soporte

Para problemas con la base de datos:
1. Verifica que MySQL esté corriendo
2. Comprueba la conexión: `mysql -u root -p`
3. Revisa los logs de MySQL
4. Contacta al equipo de desarrollo

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
