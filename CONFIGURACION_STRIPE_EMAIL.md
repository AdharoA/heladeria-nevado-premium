# 💳 Configuración de Stripe y 📧 Email

## Stripe - Pagos en Línea

### 1. Obtener Claves de Stripe

1. Crea una cuenta en [https://stripe.com](https://stripe.com)
2. Ve a **Dashboard → API Keys**
3. Copia tu **Secret Key** (comienza con `sk_`)
4. Copia tu **Publishable Key** (comienza con `pk_`)

### 2. Configurar Variables de Entorno

En el archivo `.env` o en las variables de entorno del sistema, agrega:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### 3. Instalación de Dependencias

```bash
cd backend
pnpm add stripe
```

### 4. Uso en el Backend

```typescript
import { createPaymentIntent, confirmPayment } from "./services/stripe";

// Crear intención de pago
const paymentIntent = await createPaymentIntent({
  orderId: 123,
  amount: 5000, // en centavos ($50.00)
  description: "Pedido #ORD-123",
});

// Confirmar pago
const result = await confirmPayment({
  paymentIntentId: paymentIntent.paymentIntentId,
});
```

### 5. Flujo de Pago

```
1. Usuario selecciona productos → Carrito
2. Usuario va a Checkout
3. Selecciona dirección de entrega
4. Se crea intención de pago en Stripe
5. Usuario ingresa datos de tarjeta
6. Se confirma el pago
7. Se actualiza estado del pedido
8. Se envía email de confirmación
```

### 6. Prueba con Tarjetas de Prueba

**Tarjeta exitosa:**
- Número: `4242 4242 4242 4242`
- Vencimiento: Cualquier fecha futura (ej: 12/25)
- CVC: Cualquier número (ej: 123)

**Tarjeta rechazada:**
- Número: `4000 0000 0000 0002`
- Vencimiento: Cualquier fecha futura
- CVC: Cualquier número

---

## Email - Notificaciones Automáticas

### 1. Configurar Proveedor de Email

#### Opción A: Gmail (Recomendado para desarrollo)

1. Crea una cuenta de Gmail
2. Ve a **Configuración → Seguridad**
3. Habilita **Verificación en dos pasos**
4. Crea una **Contraseña de aplicación** (16 caracteres)
5. Copia la contraseña generada

#### Opción B: SendGrid

1. Crea cuenta en [https://sendgrid.com](https://sendgrid.com)
2. Ve a **Settings → API Keys**
3. Crea una nueva API Key
4. Copia la clave

#### Opción C: Mailtrap (Para desarrollo)

1. Crea cuenta en [https://mailtrap.io](https://mailtrap.io)
2. Ve a **Inbox → SMTP Settings**
3. Copia las credenciales

### 2. Configurar Variables de Entorno

Para Gmail:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicación
EMAIL_FROM=noreply@heladeria-nevado.com
ADMIN_EMAIL=admin@heladeria-nevado.com
```

Para SendGrid:
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@heladeria-nevado.com
ADMIN_EMAIL=admin@heladeria-nevado.com
```

### 3. Instalación de Dependencias

```bash
cd backend
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

### 4. Uso en el Backend

```typescript
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendContactResponse,
  notifyAdminNewContact,
} from "./services/email";

// Enviar confirmación de pedido
await sendOrderConfirmation({
  customerEmail: "cliente@example.com",
  customerName: "Juan Pérez",
  orderNumber: "ORD-123",
  orderTotal: 5000,
  items: [
    { name: "Helado Vainilla", quantity: 2, price: 1000 },
  ],
  deliveryAddress: "Calle Principal 123",
});

// Notificar cambio de estado
await sendOrderStatusUpdate({
  customerEmail: "cliente@example.com",
  customerName: "Juan Pérez",
  orderNumber: "ORD-123",
  status: "shipped",
  statusMessage: "Tu pedido está en camino",
});

// Responder contacto
await sendContactResponse({
  customerEmail: "cliente@example.com",
  customerName: "Juan Pérez",
  subject: "Consulta sobre productos",
  message: "Gracias por tu consulta...",
});

// Notificar admin
await notifyAdminNewContact({
  name: "Juan Pérez",
  email: "cliente@example.com",
  phone: "+51 999 999 999",
  subject: "Consulta sobre productos",
  message: "¿Tienen helado de chocolate?",
  type: "inquiry",
});
```

### 5. Eventos que Disparan Emails

| Evento | Email Enviado | Destinatario |
|--------|---------------|--------------|
| Pedido creado | Confirmación de pedido | Cliente |
| Pedido confirmado | Actualización de estado | Cliente |
| Pedido en preparación | Actualización de estado | Cliente |
| Pedido listo | Actualización de estado | Cliente |
| Pedido enviado | Actualización de estado | Cliente |
| Pedido entregado | Actualización de estado | Cliente |
| Nuevo contacto | Notificación | Admin |
| Respuesta a contacto | Respuesta | Cliente |

### 6. Prueba de Email

Para probar sin enviar realmente, usa **Mailtrap**:

1. Crea cuenta en [https://mailtrap.io](https://mailtrap.io)
2. Ve a tu **Inbox**
3. Copia las credenciales SMTP
4. Configura las variables de entorno
5. Los emails aparecerán en el dashboard de Mailtrap

---

## Integración Completa

### Backend (routers.ts)

```typescript
// Crear orden con pago
const orderResult = await createOrder.mutateAsync({
  totalAmount: 5000,
  shippingCost: 500,
  deliveryAddressId: 1,
  paymentMethod: "stripe",
  items: [...],
});

// Crear intención de pago
const paymentIntent = await createPaymentIntent({
  orderId: orderResult.id,
  amount: 5500, // total + envío
});

// Confirmar pago
const payment = await confirmPayment({
  paymentIntentId: paymentIntent.paymentIntentId,
});

// Enviar email de confirmación
if (payment.success) {
  await sendOrderConfirmation({
    customerEmail: user.email,
    customerName: user.name,
    orderNumber: orderResult.orderNumber,
    orderTotal: 5500,
    items: [...],
    deliveryAddress: "Dirección",
  });
}
```

### Frontend (CheckoutStripe.tsx)

```typescript
// Seleccionar dirección
const handleCreatePayment = async () => {
  // Crear orden
  const order = await createOrder.mutateAsync({...});
  
  // Crear pago
  const payment = await createPayment.mutateAsync({
    orderId: order.id,
    amount: total,
  });
  
  // Mostrar formulario de Stripe
  setClientSecret(payment.clientSecret);
};

// Confirmar pago
const handleConfirmPayment = async () => {
  const result = await confirmPayment.mutateAsync({
    paymentIntentId,
    orderId,
  });
  
  if (result.success) {
    // Redirigir a perfil
    setLocation("/profile");
  }
};
```

---

## Troubleshooting

### Error: "STRIPE_SECRET_KEY no está configurada"

**Solución:**
1. Verifica que la variable de entorno está configurada
2. Reinicia el servidor: `pnpm dev`
3. Comprueba que la clave comienza con `sk_`

### Error: "Email service not available"

**Solución:**
1. Verifica las credenciales de email
2. Comprueba que el puerto es correcto (587 para TLS, 465 para SSL)
3. Prueba con Mailtrap primero
4. Verifica firewall/proxy

### Emails no llegan

**Solución:**
1. Revisa carpeta de spam/correo no deseado
2. Verifica el email en los logs: `console.log("Email enviado:", info.messageId)`
3. Usa Mailtrap para ver los emails en el dashboard
4. Verifica que `EMAIL_FROM` es válido

### Pago rechazado

**Solución:**
1. Usa tarjetas de prueba de Stripe
2. Verifica que el monto está en centavos (5000 = $50.00)
3. Comprueba los logs de Stripe en el dashboard
4. Verifica que `STRIPE_SECRET_KEY` es correcta

---

## Próximas Mejoras

- [ ] Integrar Stripe Elements para UI personalizado
- [ ] Implementar webhooks de Stripe
- [ ] Agregar reintentos automáticos de email
- [ ] Crear templates de email personalizados
- [ ] Implementar SMS de notificación
- [ ] Agregar soporte para múltiples métodos de pago
- [ ] Crear panel de seguimiento de emails

---

¡Listo! Tu sistema de pagos y notificaciones está completamente configurado. 🎉
