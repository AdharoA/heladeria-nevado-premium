# 🚀 Características Avanzadas - Heladería Nevado

## 1. 🔗 Webhooks de Stripe

### ¿Qué son?
Los webhooks permiten que Stripe notifique a tu aplicación en tiempo real cuando ocurren eventos de pago, sin necesidad de que el usuario espere o actualice la página.

### Eventos Soportados

| Evento | Descripción | Acción |
|--------|-------------|--------|
| `payment_intent.succeeded` | Pago completado | Actualiza orden a "confirmed" |
| `payment_intent.payment_failed` | Pago fallido | Mantiene orden en "pending" |
| `charge.refunded` | Reembolso procesado | Actualiza orden a "cancelled" |
| `payment_intent.amount_capturable_updated` | Estado de pago cambió | Sincroniza estado |

### Configuración

#### 1. Obtener Webhook Secret

```bash
# En Stripe Dashboard:
# 1. Ve a Developers → Webhooks
# 2. Crea un nuevo endpoint
# 3. URL: https://tu-dominio.com/api/webhooks/stripe
# 4. Copia el "Signing Secret"
```

#### 2. Configurar Variable de Entorno

```bash
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx
```

#### 3. Implementar Endpoint

El endpoint ya está implementado en `routers-webhooks.ts`:

```typescript
// POST /api/trpc/webhooks.stripeWebhook
// Body: { body: string, signature: string }
```

#### 4. Flujo Completo

```
1. Usuario realiza pago
   ↓
2. Stripe procesa el pago
   ↓
3. Stripe envía webhook a tu servidor
   ↓
4. Tu servidor verifica la firma
   ↓
5. Tu servidor procesa el evento
   ↓
6. Base de datos se actualiza automáticamente
   ↓
7. Email de confirmación se envía
```

### Ejemplo de Uso

```typescript
// Frontend
const handleWebhookTest = async () => {
  const result = await trpc.webhooks.stripeWebhook.mutate({
    body: JSON.stringify(stripeEvent),
    signature: "test_signature",
  });
  
  console.log("Webhook procesado:", result);
};

// Backend (automático)
// Cuando Stripe envía un webhook:
// 1. Se verifica la firma
// 2. Se procesa el evento
// 3. Se actualiza la orden
// 4. Se envía email
```

### Troubleshooting

**Problema: "Webhook secret not configured"**
```bash
# Solución: Configura STRIPE_WEBHOOK_SECRET
export STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

**Problema: "Invalid webhook signature"**
```bash
# Solución: Verifica que el secret es correcto
# Compara con el que aparece en Stripe Dashboard
```

---

## 2. ⭐ Reseñas y Calificaciones

### Características

- ⭐ Calificaciones de 1-5 estrellas
- 📝 Comentarios detallados
- 👍 Sistema de "útil"
- 📊 Estadísticas de reseñas
- 🔒 Solo usuarios autenticados pueden reseñar
- 🚫 Un usuario = una reseña por producto

### Base de Datos

```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  userId INT NOT NULL,
  rating INT NOT NULL (1-5),
  title VARCHAR(255),
  comment TEXT,
  helpful INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (productId) REFERENCES products(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### API Endpoints

#### Obtener reseñas de un producto

```typescript
// GET /api/trpc/reviews.listByProduct
const { data } = trpc.reviews.listByProduct.useQuery({
  productId: 1,
  limit: 10,
  offset: 0,
  sortBy: "recent", // "recent" | "helpful" | "rating"
});

// Respuesta:
// {
//   reviews: [...],
//   total: 45,
//   averageRating: 4.5
// }
```

#### Obtener estadísticas

```typescript
// GET /api/trpc/reviews.getStats
const { data } = trpc.reviews.getStats.useQuery({
  productId: 1,
});

// Respuesta:
// {
//   totalReviews: 45,
//   averageRating: 4.5,
//   ratingDistribution: {
//     5: 30,
//     4: 10,
//     3: 3,
//     2: 1,
//     1: 1
//   }
// }
```

#### Crear reseña

```typescript
// POST /api/trpc/reviews.create
const { mutate } = trpc.reviews.create.useMutation();

mutate({
  productId: 1,
  rating: 5,
  title: "¡Excelente helado!",
  comment: "El mejor helado que he probado, muy cremoso y delicioso.",
});
```

#### Actualizar reseña

```typescript
// POST /api/trpc/reviews.update
const { mutate } = trpc.reviews.update.useMutation();

mutate({
  id: 123,
  rating: 4,
  title: "Muy bueno",
  comment: "Actualizado después de probarlo de nuevo",
});
```

#### Eliminar reseña

```typescript
// POST /api/trpc/reviews.delete
const { mutate } = trpc.reviews.delete.useMutation();

mutate({ id: 123 });
```

#### Marcar como útil

```typescript
// POST /api/trpc/reviews.markHelpful
const { mutate } = trpc.reviews.markHelpful.useMutation();

mutate({ id: 123 });
```

### Componente Frontend (Ejemplo)

```tsx
import { trpc } from "@/lib/trpc";
import { Star, ThumbsUp } from "lucide-react";

export function ProductReviews({ productId }: { productId: number }) {
  const { data: stats } = trpc.reviews.getStats.useQuery({ productId });
  const { data: reviews } = trpc.reviews.listByProduct.useQuery({
    productId,
    limit: 10,
  });

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{stats?.averageRating}</div>
          <div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(stats?.averageRating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {stats?.totalReviews} reseñas
            </p>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <div className="space-y-4">
        {reviews?.reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <h4 className="font-bold mt-1">{review.title}</h4>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 mb-3">{review.comment}</p>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
              <ThumbsUp className="w-4 h-4" />
              Útil ({review.helpful})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 3. 💾 Carrito Persistente

### ¿Por qué es importante?

Permite que los usuarios recuperen su carrito incluso después de cerrar sesión o cambiar de dispositivo.

### Características

- 💾 Guardado automático en BD
- 🔄 Sincronización en tiempo real
- 📱 Funciona en múltiples dispositivos
- ⏰ Persiste por tiempo indefinido
- 🔐 Solo el usuario puede ver su carrito

### Base de Datos

```sql
CREATE TABLE cartItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  addedAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW(),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

### API Endpoints

#### Obtener carrito

```typescript
// GET /api/trpc/cart.list
const { data: cartItems } = trpc.cart.list.useQuery(undefined, {
  enabled: !!user, // Solo si está autenticado
});

// Respuesta:
// [
//   {
//     id: 1,
//     userId: 123,
//     productId: 5,
//     quantity: 2,
//     product: {
//       id: 5,
//       name: "Helado Vainilla",
//       price: 1000,
//       ...
//     }
//   },
//   ...
// ]
```

#### Agregar al carrito

```typescript
// POST /api/trpc/cart.add
const { mutate } = trpc.cart.add.useMutation();

mutate({
  productId: 5,
  quantity: 2,
});
```

#### Actualizar cantidad

```typescript
// POST /api/trpc/cart.update
const { mutate } = trpc.cart.update.useMutation();

mutate({
  id: 1, // ID del item en carrito
  quantity: 3,
});
```

#### Eliminar del carrito

```typescript
// POST /api/trpc/cart.remove
const { mutate } = trpc.cart.remove.useMutation();

mutate(1); // ID del item en carrito
```

#### Limpiar carrito

```typescript
// POST /api/trpc/cart.clear
const { mutate } = trpc.cart.clear.useMutation();

mutate();
```

### Flujo Completo

```
1. Usuario inicia sesión
   ↓
2. Carrito se carga de la BD
   ↓
3. Usuario agrega producto
   ↓
4. Se guarda en BD automáticamente
   ↓
5. Usuario cierra sesión
   ↓
6. Usuario inicia sesión desde otro dispositivo
   ↓
7. Carrito se carga nuevamente (mismo contenido)
   ↓
8. Usuario procede al checkout
   ↓
9. Carrito se limpia después del pago
```

### Componente Frontend (Ejemplo)

```tsx
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Trash2, Plus, Minus } from "lucide-react";

export function CartView() {
  const { user } = useAuth();
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, {
    enabled: !!user,
  });
  
  const addMutation = trpc.cart.add.useMutation();
  const updateMutation = trpc.cart.update.useMutation();
  const removeMutation = trpc.cart.remove.useMutation();

  if (!user) {
    return <p>Inicia sesión para ver tu carrito</p>;
  }

  const total = cartItems?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  ) || 0;

  return (
    <div className="space-y-4">
      {cartItems?.map((item) => (
        <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
          <div className="flex-1">
            <h3 className="font-bold">{item.product?.name}</h3>
            <p className="text-gray-600">${(item.product?.price || 0) / 100}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateMutation.mutate({
                  id: item.id,
                  quantity: Math.max(1, item.quantity - 1),
                })
              }
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() =>
                updateMutation.mutate({
                  id: item.id,
                  quantity: item.quantity + 1,
                })
              }
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => removeMutation.mutate(item.id)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <div className="text-right text-2xl font-bold">
        Total: ${(total / 100).toFixed(2)}
      </div>
    </div>
  );
}
```

### Sincronización en Tiempo Real

```typescript
// El carrito se sincroniza automáticamente:
// 1. Cuando el usuario agrega/actualiza/elimina items
// 2. Cuando carga la página (se obtiene de BD)
// 3. Cuando se completa un pago (se limpia)

// Para forzar una actualización:
const { invalidate } = trpc.useUtils();

const handleAddToCart = async (productId: number) => {
  await addMutation.mutateAsync({ productId, quantity: 1 });
  // Invalidar caché para obtener datos frescos
  await invalidate(trpc.cart.list);
};
```

---

## Resumen de Características

| Característica | Beneficio | Estado |
|---|---|---|
| Webhooks Stripe | Pagos en tiempo real | ✅ Implementado |
| Reseñas 5⭐ | Confianza de clientes | ✅ Implementado |
| Carrito Persistente | Mejor UX | ✅ Implementado |
| Estadísticas | Análisis de productos | ✅ Implementado |
| Email automático | Notificaciones | ✅ Implementado |
| ADARA IA | Asistente inteligente | ✅ Implementado |
| Panel Admin | Gestión completa | ✅ Implementado |

---

## Próximas Mejoras

- [ ] Notificaciones push en tiempo real
- [ ] Carrito compartido entre dispositivos
- [ ] Reseñas con fotos
- [ ] Filtro de reseñas por calificación
- [ ] Respuestas del vendedor a reseñas
- [ ] Análisis de sentimiento en reseñas
- [ ] Recomendaciones basadas en reseñas

---

¡Listo! Tu sistema de características avanzadas está completamente configurado. 🎉
