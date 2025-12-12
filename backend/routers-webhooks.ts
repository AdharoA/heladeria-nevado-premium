import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  verifyWebhookSignature,
  processWebhookEvent,
  listWebhookEndpoints,
  createWebhookEndpoint,
  deleteWebhookEndpoint,
} from "./services/stripe-webhooks";

const webhooksRouter = router({
  /**
   * Endpoint para recibir webhooks de Stripe
   * Este debe ser accesible desde Internet
   */
  stripeWebhook: publicProcedure
    .input(
      z.object({
        body: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
          console.warn("STRIPE_WEBHOOK_SECRET not configured");
          return { success: false, message: "Webhook secret not configured" };
        }

        // Verificar firma del webhook
        const event = verifyWebhookSignature(input.body, input.signature, secret);
        if (!event) {
          return { success: false, message: "Invalid webhook signature" };
        }

        // Procesar evento
        const result = await processWebhookEvent(event);

        return { success: true, ...result };
      } catch (error) {
        console.error("Error processing webhook:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Listar endpoints de webhook configurados
   */
  listEndpoints: publicProcedure.query(async () => {
    try {
      const endpoints = await listWebhookEndpoints();
      return {
        success: true,
        endpoints: endpoints.map((ep) => ({
          id: ep.id,
          url: ep.url,
          status: ep.status,
          enabledEvents: ep.enabled_events,
        })),
      };
    } catch (error) {
      console.error("Error listing webhook endpoints:", error);
      return { success: false, endpoints: [] };
    }
  }),

  /**
   * Crear nuevo endpoint de webhook
   */
  createEndpoint: publicProcedure
    .input(z.object({ url: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        const endpoint = await createWebhookEndpoint(input.url);
        return {
          success: true,
          endpoint: {
            id: endpoint.id,
            url: endpoint.url,
            secret: endpoint.secret,
            status: endpoint.status,
          },
        };
      } catch (error) {
        console.error("Error creating webhook endpoint:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Error creating endpoint",
        };
      }
    }),

  /**
   * Eliminar endpoint de webhook
   */
  deleteEndpoint: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteWebhookEndpoint(input.id);
        return { success: true, message: "Endpoint deleted" };
      } catch (error) {
        console.error("Error deleting webhook endpoint:", error);
        return {
          success: false,
          message: error instanceof Error ? error.message : "Error deleting endpoint",
        };
      }
    }),
});

export default webhooksRouter;
