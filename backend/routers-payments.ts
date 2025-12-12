import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { orders, transactions } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  refundPayment,
  isStripeAvailable,
} from "./services/stripe";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "./services/email";

const paymentsRouter = router({
  /**
   * Crear intención de pago en Stripe
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        amount: z.number().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar que el pedido pertenece al usuario
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order[0] || order[0].userId !== ctx.user?.id) {
          throw new Error("Pedido no encontrado");
        }

        // Crear intención de pago en Stripe
        const paymentIntent = await createPaymentIntent({
          orderId: input.orderId,
          amount: input.amount,
          description: input.description,
          metadata: {
            userId: ctx.user.id.toString(),
            orderNumber: order[0].orderNumber,
          },
        });

        return paymentIntent;
      } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new Error("No se pudo crear la intención de pago");
      }
    }),

  /**
   * Confirmar pago
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        orderId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar que el pedido pertenece al usuario
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order[0] || order[0].userId !== ctx.user?.id) {
          throw new Error("Pedido no encontrado");
        }

        // Confirmar pago en Stripe
        const payment = await confirmPayment({
          paymentIntentId: input.paymentIntentId,
        });

        if (payment.success) {
          // Actualizar estado del pedido
          await db
            .update(orders)
            .set({
              status: "confirmed",
              paymentMethod: "stripe",
            })
            .where(eq(orders.id, input.orderId));

          // Guardar transacción
          await db.insert(transactions).values({
            orderId: input.orderId,
            userId: ctx.user.id,
            amount: order[0].totalAmount,
            paymentMethod: "stripe",
            transactionId: payment.transactionId,
            status: "completed",
          });

          // Enviar email de confirmación
          const user = ctx.user;
          if (user?.email) {
            await sendOrderConfirmation({
              customerEmail: user.email,
              customerName: user.name || "Cliente",
              orderNumber: order[0].orderNumber,
              orderTotal: order[0].totalAmount,
              items: [], // Se obtendría de orderItems
              deliveryAddress: "Dirección de entrega",
            });
          }

          return {
            success: true,
            message: "Pago completado exitosamente",
            orderId: input.orderId,
          };
        }

        return {
          success: false,
          message: "El pago no se pudo completar",
        };
      } catch (error) {
        console.error("Error confirming payment:", error);
        throw new Error("No se pudo confirmar el pago");
      }
    }),

  /**
   * Obtener estado del pago
   */
  getPaymentStatus: protectedProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .query(async ({ input }) => {
      try {
        const status = await getPaymentStatus(input.paymentIntentId);
        return status;
      } catch (error) {
        console.error("Error getting payment status:", error);
        throw new Error("No se pudo obtener el estado del pago");
      }
    }),

  /**
   * Reembolsar pago
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        orderId: z.number(),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar que el pedido pertenece al usuario
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order[0] || order[0].userId !== ctx.user?.id) {
          throw new Error("Pedido no encontrado");
        }

        // Procesar reembolso
        const refund = await refundPayment(input.paymentIntentId, input.amount);

        if (refund.success) {
          // Actualizar estado del pedido
          await db
            .update(orders)
            .set({ status: "cancelled" })
            .where(eq(orders.id, input.orderId));

          // Actualizar transacción
          const transaction = await db
            .select()
            .from(transactions)
            .where(eq(transactions.orderId, input.orderId))
            .limit(1);

          if (transaction[0]) {
            await db
              .update(transactions)
              .set({ status: "refunded" })
              .where(eq(transactions.id, transaction[0].id));
          }

          return {
            success: true,
            message: "Reembolso procesado exitosamente",
            refundId: refund.refundId,
          };
        }

        return {
          success: false,
          message: "No se pudo procesar el reembolso",
        };
      } catch (error) {
        console.error("Error refunding payment:", error);
        throw new Error("No se pudo procesar el reembolso");
      }
    }),

  /**
   * Verificar disponibilidad de Stripe
   */
  checkStatus: publicProcedure.query(async () => {
    const available = await isStripeAvailable();
    return {
      stripeAvailable: available,
      message: available
        ? "Stripe está listo para procesar pagos"
        : "Stripe no está configurado",
    };
  }),
});

export default paymentsRouter;
