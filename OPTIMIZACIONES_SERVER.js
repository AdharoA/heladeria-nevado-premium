// Optimizaciones para Express Server (_core/index.ts)
// Agregar estas configuraciones para optimizar el servidor

import compression from 'compression';
import helmet from 'helmet';

// ============ MIDDLEWARE DE COMPRESIÓN Y SEGURIDAD ============

// 1. Compresión GZIP/Brotli
app.use(compression({
  filter: (req, res) => {
    // No comprimir si el cliente lo especifica
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Compression.filter por defecto (text/*, */json, etc)
    return compression.filter(req, res);
  },
  level: 6, // Nivel 6 es buen balance entre velocidad y compresión
  threshold: 1024 * 2, // Solo comprimir si > 2KB
}));

// 2. Security Headers (con helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
}));

// ============ CACHE HEADERS ============

// 3. Cache Control Headers
app.use((req, res, next) => {
  // Assets estáticos: cache 1 año (immutable)
  if (req.url.match(/\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg|webp)$/i)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', 'W/"' + Date.now() + '"');
    return res.end(fs.readFileSync(path.join(process.cwd(), req.url)));
  }
  
  // API: no cache o short cache
  if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }
  
  // HTML: revalidate
  if (req.url.endsWith('.html') || req.url === '/') {
    res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  
  next();
});

// ============ OPTIMIZACIONES DE RESPUESTA ============

// 4. JSON Compression Middleware
app.use(express.json({
  limit: '10mb',
}));

// 5. URL Encoded Compression
app.use(express.urlencoded({
  limit: '10mb',
  extended: true,
}));

// ============ DATABASE CONNECTION POOLING ============

// 6. Optimizar conexiones MySQL
// En db.ts, usar connection pooling:

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max connections
  queueLimit: 0,
  enableConnectionPooling: true,
  enableTimer: false, // Reducir overhead
  timezone: 'Z', // UTC
});

// ============ QUERY OPTIMIZATION ============

// 7. Ejemplos de optimización en queries

// ❌ MAL: SELECT * sin límite
async function getProductsBAD() {
  return db.select().from(products); // Carga TODO
}

// ✅ BIEN: SELECT específico con índices
async function getProductsGOOD(categoryId?: number, limit = 20, offset = 0) {
  let query = db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      image: products.image,
    })
    .from(products)
    .limit(limit)
    .offset(offset);
  
  if (categoryId) {
    query = query.where(eq(products.categoryId, categoryId)); // Usa índice
  }
  
  return query;
}

// 8. Agregar índices en schema.sql:
/*
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE products ADD INDEX idx_name (name(50)); -- Índice en nombre
ALTER TABLE orders ADD INDEX idx_user_id (user_id);
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE order_items ADD INDEX idx_order_id (order_id);
ALTER TABLE reviews ADD INDEX idx_product_id (product_id);
ALTER TABLE reviews ADD INDEX idx_user_id (user_id);
*/

// ============ REQUEST LOGGING OPTIMIZATION ============

// 9. Logging optimizado (sin detalles en producción)
const morgan = require('morgan');

app.use(morgan(process.env.NODE_ENV === 'production' 
  ? 'combined'  // Menos detallado en prod
  : 'dev'       // Más detallado en dev
));

// ============ ERROR HANDLING ============

// 10. Error handler optimizado
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error'
    : err.message;
  
  res.status(status).json({
    error: {
      status,
      message,
    },
  });
});

// ============ RATE LIMITING ============

// 11. Limitar requests por IP
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// ============ ETAG Y CONDITIONAL REQUESTS ============

// 12. Implementar ETags
app.set('etag', 'weak');

// ============ GZIP DE ARCHIVOS ESTÁTICOS ============

// 13. En package.json scripts, agregar:
/*
{
  "scripts": {
    "build:compress": "pnpm build && gzip -r dist/"
  }
}
*/

// ============ TIMING HEADERS ============

// 14. Agregar Server-Timing headers
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('Server-Timing', `total;dur=${duration}`);
  });
  next();
});

// ============ CHECKLIST DE INSTALACIÓN ============

/*
Paquetes adicionales a instalar:

npm install compression helmet express-rate-limit

Entonces en backend/package.json agregar:
{
  "dependencies": {
    "compression": "^1.7.4",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.0.0"
  }
}
*/

// ============ VARIABLES DE ENTORNO ============

/*
Agregar a .env:

# Database
DATABASE_URL="mysql://user:pass@localhost:3306/db"
DB_POOL_LIMIT=10
DB_QUEUE_LIMIT=0

# Server
SERVER_PORT=3000
NODE_ENV=production
COMPRESSION_LEVEL=6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
*/

// ============ MONITOREO ============

// 15. Agregar herramientas de monitoreo
/*
npm install prom-client  # Prometheus metrics
npm install newrelic      # NewRelic APM
npm install dd-trace      # Datadog APM
*/

// Ejemplo con prom-client:
import promClient from 'prom-client';

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Exponer métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
