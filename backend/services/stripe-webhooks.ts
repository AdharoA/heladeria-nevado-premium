/**
 * Servicio de Webhooks de Stripe
 * Sincroniza eventos de pago en tiempo real
 */

import Stripe from "stripe";
import { getDb } from "../db";
import { orders, transactions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendOrderStatusUpdate } from "./email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Verificar firma de webhook
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return null;
  }
}

/**
 * Manejar evento de pago completado
 */
export async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const orderId = parseInt(paymentIntent.metadata?.orderId || "0");
    if (!orderId) {
      console.warn("No orderId in payment intent metadata");
      return;
    }

    // Obtener la orden
    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult[0]) {
      console.warn(`Order ${orderId} not found`);
      return;
    }

    const order = orderResult[0];

    // Actualizar estado de la orden
    await db
      .update(orders)
      .set({
        status: "confirmed",
        paymentMethod: "stripe",
      })
      .where(eq(orders.id, orderId));

    // Actualizar o crear transacción
    const transactionResult = await db
      .select()
      .from(transactions)
      .where(eq(transactions.orderId, orderId))
      .limit(1);

    if (transactionResult[0]) {
      await db
        .update(transactions)
        .set({
          status: "completed",
          transactionId: paymentIntent.id,
        })
        .where(eq(transactions.id, transactionResult[0].id));
    } else {
      await db.insert(transactions).values({
        orderId,
        userId: order.userId,
        amount: paymentIntent.amount,
        paymentMethod: "stripe",
        transactionId: paymentIntent.id,
        status: "completed",
      });
    }

    console.log(`✅ Payment succeeded for order ${orderId}`);
    return { success: true, orderId };
  } catch (error) {
    console.error("Error handling payment succeeded:", error);
    throw error;
  }
}

/**
 * Manejar evento de pago fallido
 */
export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const orderId = parseInt(paymentIntent.metadata?.orderId || "0");
    if (!orderId) {
      console.warn("No orderId in payment intent metadata");
      return;
    }

    // Actualizar estado de la orden
    await db
      .update(orders)
      .set({
        status: "pending",
      })
      .where(eq(orders.id, orderId));

    // Actualizar transacción
    const transactionResult = await db
      .select()
      .from(transactions)
      .where(eq(transactions.orderId, orderId))
      .limit(1);

    if (transactionResult[0]) {
      await db
        .update(transactions)
        .set({
          status: "failed",
        })
        .where(eq(transactions.id, transactionResult[0].id));
    }

    console.log(`❌ Payment failed for order ${orderId}`);
    return { success: false, orderId };
  } catch (error) {
    console.error("Error handling payment failed:", error);
    throw error;
  }
}

/**
 * Manejar evento de reembolso
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Obtener el payment intent
    if (!charge.payment_intent) {
      console.warn("No payment_intent in charge");
      return;
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      charge.payment_intent as string
    );

    const orderId = parseInt(paymentIntent.metadata?.orderId || "0");
    if (!orderId) {
      console.warn("No orderId in payment intent metadata");
      return;
    }

    // Actualizar estado de la orden
    await db
      .update(orders)
      .set({
        status: "cancelled",
      })
      .where(eq(orders.id, orderId));

    // Actualizar transacción
    const transactionResult = await db
      .select()
      .from(transactions)
      .where(eq(transactions.orderId, orderId))
      .limit(1);

    if (transactionResult[0]) {
      await db
        .update(transactions)
        .set({
          status: "refunded",
        })
        .where(eq(transactions.id, transactionResult[0].id));
    }

    console.log(`💰 Refund processed for order ${orderId}`);
    return { success: true, orderId };
  } catch (error) {
    console.error("Error handling charge refunded:", error);
    throw error;
  }
}

/**
 * Manejar evento de cambio de estado de pago
 */
export async function handlePaymentIntentAmountCapturableUpdated(
  paymentIntent: Stripe.PaymentIntent
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const orderId = parseInt(paymentIntent.metadata?.orderId || "0");
    if (!orderId) {
      console.warn("No orderId in payment intent metadata");
      return;
    }

    // Obtener la orden
    const orderResult = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!orderResult[0]) {
      console.warn(`Order ${orderId} not found`);
      return;
    }

    const order = orderResult[0];

    // Actualizar estado según el status del payment intent
    let newStatus = order.status;
    switch (paymentIntent.status) {
      case "succeeded":
        newStatus = "confirmed";
        break;
      case "processing":
        newStatus = "pending";
        break;
      case "requires_payment_method":
        newStatus = "pending";
        break;
      case "requires_action":
        newStatus = "pending";
        break;
    }

    await db
      .update(orders)
      .set({
        status: newStatus,
      })
      .where(eq(orders.id, orderId));

    console.log(`🔄 Payment intent updated for order ${orderId}: ${paymentIntent.status}`);
    return { success: true, orderId, status: paymentIntent.status };
  } catch (error) {
    console.error("Error handling payment intent updated:", error);
    throw error;
  }
}

/**
 * Procesar evento de webhook
 */
export async function processWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        return await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);

      case "payment_intent.payment_failed":
        return await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);

      case "charge.refunded":
        return await handleChargeRefunded(event.data.object as Stripe.Charge);

      case "payment_intent.amount_capturable_updated":
        return await handlePaymentIntentAmountCapturableUpdated(
          event.data.object as Stripe.PaymentIntent
        );

      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { success: true, message: "Unhandled event type" };
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
    throw error;
  }
}

/**
 * Crear endpoint de webhook
 */
export async function createWebhookEndpoint(url: string) {
  try {
    const endpoint = await stripe.webhookEndpoints.create({
      url,
      enabled_events: [
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "charge.refunded",
        "payment_intent.amount_capturable_updated",
      ],
    });

    console.log("✅ Webhook endpoint created:", endpoint.id);
    console.log("Signing secret:", endpoint.secret);
    return endpoint;
  } catch (error) {
    console.error("Error creating webhook endpoint:", error);
    throw error;
  }
}

/**
 * Listar endpoints de webhook
 */
export async function listWebhookEndpoints() {
  try {
    const endpoints = await stripe.webhookEndpoints.list();
    return endpoints.data;
  } catch (error) {
    console.error("Error listing webhook endpoints:", error);
    return [];
  }
}

/**
 * Eliminar endpoint de webhook
 */
export async function deleteWebhookEndpoint(endpointId: string) {
  try {
    await stripe.webhookEndpoints.del(endpointId);
    console.log("✅ Webhook endpoint deleted:", endpointId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting webhook endpoint:", error);
    throw error;
  }
}
