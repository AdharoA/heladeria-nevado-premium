/**
 * Servicio de Stripe para procesar pagos
 * Documentación: https://stripe.com/docs
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export interface CreatePaymentIntentInput {
  orderId: number;
  amount: number; // en centavos
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
  paymentMethodId?: string;
}

/**
 * Crear una intención de pago en Stripe
 */
export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: input.currency || "usd",
      description: input.description || `Pedido #${input.orderId}`,
      metadata: {
        orderId: input.orderId.toString(),
        ...input.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw new Error("No se pudo crear la intención de pago");
  }
}

/**
 * Confirmar un pago
 */
export async function confirmPayment(input: ConfirmPaymentInput) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return {
        success: true,
        status: "completed",
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount,
      };
    }

    if (paymentIntent.status === "requires_payment_method") {
      if (input.paymentMethodId) {
        const confirmed = await stripe.paymentIntents.confirm(input.paymentIntentId, {
          payment_method: input.paymentMethodId,
        });

        return {
          success: confirmed.status === "succeeded",
          status: confirmed.status,
          transactionId: confirmed.id,
        };
      }
    }

    return {
      success: false,
      status: paymentIntent.status,
      message: "El pago no se pudo completar",
    };
  } catch (error) {
    console.error("Error confirming payment:", error);
    throw new Error("No se pudo confirmar el pago");
  }
}

/**
 * Obtener detalles de un pago
 */
export async function getPaymentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      clientSecret: paymentIntent.client_secret,
      metadata: paymentIntent.metadata,
    };
  } catch (error) {
    console.error("Error getting payment status:", error);
    throw new Error("No se pudo obtener el estado del pago");
  }
}

/**
 * Reembolsar un pago
 */
export async function refundPayment(paymentIntentId: string, amount?: number) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // en centavos, si no se especifica reembolsa todo
    });

    return {
      success: refund.status === "succeeded",
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount,
    };
  } catch (error) {
    console.error("Error refunding payment:", error);
    throw new Error("No se pudo procesar el reembolso");
  }
}

/**
 * Crear un cliente en Stripe
 */
export async function createStripeCustomer(input: {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const customer = await stripe.customers.create({
      email: input.email,
      name: input.name,
      phone: input.phone,
      metadata: input.metadata,
    });

    return {
      success: true,
      customerId: customer.id,
      email: customer.email,
    };
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new Error("No se pudo crear el cliente en Stripe");
  }
}

/**
 * Obtener lista de métodos de pago de un cliente
 */
export async function getCustomerPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      type: pm.type,
      card: pm.card,
    }));
  } catch (error) {
    console.error("Error getting payment methods:", error);
    return [];
  }
}

/**
 * Webhook para manejar eventos de Stripe
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("✅ Pago completado:", event.data.object);
      return { success: true, action: "payment_succeeded" };

    case "payment_intent.payment_failed":
      console.log("❌ Pago fallido:", event.data.object);
      return { success: false, action: "payment_failed" };

    case "charge.refunded":
      console.log("💰 Reembolso procesado:", event.data.object);
      return { success: true, action: "refund_processed" };

    default:
      console.log("Evento no manejado:", event.type);
      return { success: true, action: "unhandled" };
  }
}

/**
 * Verificar disponibilidad de Stripe
 */
export async function isStripeAvailable(): Promise<boolean> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("STRIPE_SECRET_KEY no está configurada");
      return false;
    }
    // Intentar obtener la cuenta de Stripe
    await stripe.account.retrieve();
    return true;
  } catch (error) {
    console.error("Stripe no está disponible:", error);
    return false;
  }
}
