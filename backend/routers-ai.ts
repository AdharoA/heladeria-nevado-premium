import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { aiConversations } from "./drizzle/schema";
import { generateADARAResponse, isOllamaAvailable } from "./services/ollama";

const aiRouter = router({
  /**
   * Chat con ADARA - Asistente IA contextual usando Ollama
   */
  chat: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(1000),
        userId: z.number().optional(),
        context: z.string().optional(),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const userId = input.userId || ctx.user?.id;

      try {
        const aiResponse = await generateADARAResponse(
          input.message,
          input.context || "general",
          input.conversationHistory || []
        );

        if (userId && db) {
          try {
            await db.insert(aiConversations).values({
              userId,
              userMessage: input.message,
              aiResponse: aiResponse.substring(0, 5000),
              context: input.context || "general",
            });
          } catch (error) {
            console.error("Error saving conversation:", error);
          }
        }

        return {
          response: aiResponse,
          context: input.context,
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("ADARA Error:", error);
        return {
          response:
            "Disculpa, estoy teniendo dificultades en este momento. Por favor, intenta de nuevo más tarde. 😊",
          context: input.context,
          timestamp: new Date(),
        };
      }
    }),

  /**
   * Obtener recomendaciones personalizadas
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(5),
        category: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { recommendations: [] };

      try {
        return {
          recommendations: [
            {
              id: 1,
              name: "Helado de Cookies",
              reason: "Popular entre usuarios como tú",
            },
            {
              id: 2,
              name: "Helado de Pistacho",
              reason: "Nuevo y delicioso",
            },
          ],
        };
      } catch (error) {
        console.error("Error getting recommendations:", error);
        return { recommendations: [] };
      }
    }),

  /**
   * Obtener historial de conversaciones
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { conversations: [] };

      try {
        const conversations = await db
          .select()
          .from(aiConversations)
          .where((t) => t.userId === ctx.user.id)
          .limit(input.limit);

        return { conversations };
      } catch (error) {
        console.error("Error getting history:", error);
        return { conversations: [] };
      }
    }),

  /**
   * Verificar disponibilidad de Ollama
   */
  checkStatus: publicProcedure.query(async () => {
    const available = await isOllamaAvailable();
    return {
      ollamaAvailable: available,
      model: "deepseek-r1:8b",
      message: available 
        ? "ADARA está lista para chatear 🚀" 
        : "ADARA está en modo offline. Asegúrate de que Ollama está ejecutándose.",
    };
  }),
});

export default aiRouter;
