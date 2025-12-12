-- ============================================
-- HELADERÍA NEVADO - SCHEMA DE BASE DE DATOS
-- ============================================
-- Base de datos: heladeria_nevado
-- Motor: MySQL 8.0+
-- Codificación: UTF-8

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS heladeria_nevado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE heladeria_nevado;

-- ============================================
-- TABLA: users (Usuarios del Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_openId (openId),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: categories (Categorías de Productos)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: products (Productos - Helados)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  categoryId INT NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(500),
  isAvailable BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
  INDEX idx_name (name),
  INDEX idx_categoryId (categoryId),
  INDEX idx_isAvailable (isAvailable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: addresses (Direcciones de Entrega)
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(50),
  apartment VARCHAR(50),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100),
  postalCode VARCHAR(20),
  phone VARCHAR(20),
  isDefault BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: cartItems (Carrito de Compras)
-- ============================================
CREATE TABLE IF NOT EXISTS cartItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (userId, productId),
  INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: orders (Pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  userId INT NOT NULL,
  totalAmount INT NOT NULL,
  shippingCost INT DEFAULT 0,
  deliveryAddressId INT,
  paymentMethod VARCHAR(50),
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deliveryAddressId) REFERENCES addresses(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: orderItems (Detalles de Pedidos)
-- ============================================
CREATE TABLE IF NOT EXISTS orderItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  productName VARCHAR(255),
  quantity INT NOT NULL,
  price INT NOT NULL,
  subtotal INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id),
  INDEX idx_orderId (orderId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: transactions (Transacciones de Pago)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  userId INT NOT NULL,
  amount INT NOT NULL,
  paymentMethod VARCHAR(50),
  transactionId VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_orderId (orderId),
  INDEX idx_userId (userId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: contacts (Formularios de Contacto)
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  type ENUM('suggestion', 'complaint', 'inquiry', 'other') DEFAULT 'inquiry',
  status ENUM('new', 'read', 'responded', 'closed') DEFAULT 'new',
  response TEXT,
  respondedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (respondedBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: aiConversations (Historial de IA)
-- ============================================
CREATE TABLE IF NOT EXISTS aiConversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  userMessage TEXT NOT NULL,
  aiResponse TEXT,
  context VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_userId (userId),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERTAR USUARIOS DE PRUEBA
-- ============================================

-- Usuario Admin
INSERT INTO users (openId, name, email, loginMethod, role) VALUES
('admin-001', 'Administrador Heladería', 'admin@heladeria-nevado.com', 'system', 'admin');

-- Usuario Cliente de Prueba
INSERT INTO users (openId, name, email, loginMethod, role) VALUES
('user-001', 'Juan Pérez', 'juan@example.com', 'google', 'user'),
('user-002', 'María García', 'maria@example.com', 'google', 'user'),
('user-003', 'Carlos López', 'carlos@example.com', 'google', 'user');

-- ============================================
-- INSERTAR DATOS DE PRUEBA
-- ============================================

-- Insertar categorías
INSERT INTO categories (name, description, icon) VALUES
('Clásicos', 'Sabores tradicionales y populares', '🍦'),
('Especiales', 'Sabores creativos y únicos', '✨'),
('Sin Azúcar', 'Opciones saludables y dietéticas', '💚'),
('Premium', 'Helados de lujo con ingredientes finos', '👑'),
('Infantiles', 'Sabores divertidos para niños', '🎉');

-- Insertar productos
INSERT INTO products (name, description, price, categoryId, stock, isAvailable) VALUES
('Helado de Vainilla', 'Vainilla pura y cremosa con sabor auténtico', 1000, 1, 50, TRUE),
('Helado de Chocolate', 'Chocolate belga intenso y suave', 1200, 1, 40, TRUE),
('Helado de Fresa', 'Fresa fresca natural sin colorantes', 1100, 1, 35, TRUE),
('Helado de Menta', 'Menta refrescante con chocolate', 1100, 1, 30, TRUE),
('Helado de Cookies', 'Cookies y crema con trozos de galleta', 1300, 2, 25, TRUE),
('Helado de Pistacho', 'Pistacho premium importado', 1400, 2, 20, TRUE),
('Helado de Café', 'Café espresso con leche condensada', 1200, 2, 28, TRUE),
('Helado Sin Azúcar Vainilla', 'Vainilla sin azúcar añadido', 1100, 3, 22, TRUE),
('Helado Sin Azúcar Chocolate', 'Chocolate sin azúcar para diabéticos', 1150, 3, 18, TRUE),
('Helado Lujo Frutos Rojos', 'Mezcla premium de frutos rojos', 1600, 4, 15, TRUE),
('Helado Lujo Oro', 'Helado con laminillas de oro comestible', 2000, 4, 10, TRUE),
('Helado Arcoíris', 'Multicolor con sabores variados', 1300, 5, 32, TRUE),
('Helado Dinosaurio', 'Helado verde con caramelo crujiente', 1200, 5, 28, TRUE);

-- Insertar dirección de prueba para usuario
INSERT INTO addresses (userId, street, number, city, province, postalCode, phone, isDefault) VALUES
(2, 'Calle Principal', '123', 'Lima', 'Lima', '15001', '987654321', TRUE),
(3, 'Avenida Secundaria', '456', 'Arequipa', 'Arequipa', '04001', '987654322', TRUE),
(4, 'Calle Terciaria', '789', 'Cusco', 'Cusco', '08001', '987654323', TRUE);

-- ============================================
-- CREAR ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ============================================

CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_orderNumber ON orders(orderNumber);
CREATE INDEX idx_cartItems_productId ON cartItems(productId);
CREATE INDEX idx_transactions_transactionId ON transactions(transactionId);

-- ============================================
-- CREAR VISTAS ÚTILES
-- ============================================

-- Vista: Resumen de ventas por categoría
CREATE OR REPLACE VIEW sales_by_category AS
SELECT 
  c.id,
  c.name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(oi.quantity) as total_items_sold,
  SUM(oi.subtotal) as total_revenue
FROM categories c
LEFT JOIN products p ON c.id = p.categoryId
LEFT JOIN orderItems oi ON p.id = oi.productId
LEFT JOIN orders o ON oi.orderId = o.id
GROUP BY c.id, c.name;

-- Vista: Productos más vendidos
CREATE OR REPLACE VIEW top_products AS
SELECT 
  p.id,
  p.name,
  COUNT(oi.id) as times_sold,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.subtotal) as total_revenue
FROM products p
LEFT JOIN orderItems oi ON p.id = oi.productId
GROUP BY p.id, p.name
ORDER BY total_quantity DESC;

-- Vista: Clientes más activos
CREATE OR REPLACE VIEW top_customers AS
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.totalAmount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.userId
WHERE u.role = 'user'
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- ============================================
-- CREAR PROCEDIMIENTOS ALMACENADOS
-- ============================================

-- Procedimiento: Obtener resumen de pedido
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS GetOrderSummary(IN orderId INT)
BEGIN
  SELECT 
    o.id,
    o.orderNumber,
    o.totalAmount,
    o.status,
    o.createdAt,
    u.name as customer_name,
    u.email as customer_email,
    COUNT(oi.id) as item_count
  FROM orders o
  JOIN users u ON o.userId = u.id
  LEFT JOIN orderItems oi ON o.id = oi.orderId
  WHERE o.id = orderId
  GROUP BY o.id;
END$$
DELIMITER ;

-- Procedimiento: Actualizar stock después de compra
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS UpdateProductStock(IN productId INT, IN quantity INT)
BEGIN
  UPDATE products 
  SET stock = stock - quantity
  WHERE id = productId AND stock >= quantity;
END$$
DELIMITER ;

-- ============================================
-- CREAR TRIGGERS
-- ============================================

-- Trigger: Actualizar timestamp de actualización en productos
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS products_update_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- Trigger: Actualizar timestamp de actualización en órdenes
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS orders_update_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
  SET NEW.updatedAt = CURRENT_TIMESTAMP;
END$$
DELIMITER ;

-- ============================================
-- PERMISOS Y SEGURIDAD
-- ============================================

-- Crear usuario de aplicación (opcional)
-- CREATE USER 'heladeria_app'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON heladeria_nevado.* TO 'heladeria_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
