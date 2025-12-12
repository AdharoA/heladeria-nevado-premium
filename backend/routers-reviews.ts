import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { reviews, products } from "./drizzle/schema";
import { eq, and, desc, avg } from "drizzle-orm";

const reviewsRouter = router({
  /**
   * Obtener reseñas de un producto
   */
  listByProduct: publicProcedure
    .input(
      z.object({
        productId: z.number(),
        limit: z.number().default(10),
        offset: z.number().default(0),
        sortBy: z.enum(["recent", "helpful", "rating"]).default("recent"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { reviews: [], total: 0, averageRating: 0 };

      try {
        let query = db
          .select()
          .from(reviews)
          .where(eq(reviews.productId, input.productId));

        // Ordenar según el parámetro
        switch (input.sortBy) {
          case "helpful":
            query = query.orderBy(desc(reviews.helpful));
            break;
          case "rating":
            query = query.orderBy(desc(reviews.rating));
            break;
          case "recent":
          default:
            query = query.orderBy(desc(reviews.createdAt));
        }

        const allReviews = await query;
        const total = allReviews.length;
        const result = allReviews.slice(input.offset, input.offset + input.limit);

        // Calcular calificación promedio
        const avgResult = await db
          .select({ avg: avg(reviews.rating) })
          .from(reviews)
          .where(eq(reviews.productId, input.productId));

        const averageRating = avgResult[0]?.avg ? parseFloat(avgResult[0].avg.toString()) : 0;

        return { reviews: result, total, averageRating };
      } catch (error) {
        console.error("Error listing reviews:", error);
        return { reviews: [], total: 0, averageRating: 0 };
      }
    }),

  /**
   * Obtener estadísticas de reseñas de un producto
   */
  getStats: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { totalReviews: 0, averageRating: 0, ratingDistribution: {} };

      try {
        const allReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.productId, input.productId));

        const totalReviews = allReviews.length;

        // Calcular promedio
        const avgRating =
          totalReviews > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        // Distribución de calificaciones
        const ratingDistribution = {
          5: allReviews.filter((r) => r.rating === 5).length,
          4: allReviews.filter((r) => r.rating === 4).length,
          3: allReviews.filter((r) => r.rating === 3).length,
          2: allReviews.filter((r) => r.rating === 2).length,
          1: allReviews.filter((r) => r.rating === 1).length,
        };

        return {
          totalReviews,
          averageRating: Math.round(avgRating * 10) / 10,
          ratingDistribution,
        };
      } catch (error) {
        console.error("Error getting review stats:", error);
        return { totalReviews: 0, averageRating: 0, ratingDistribution: {} };
      }
    }),

  /**
   * Crear reseña (solo usuarios autenticados)
   */
  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().min(5).max(255),
        comment: z.string().min(10).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar que el producto existe
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, input.productId))
          .limit(1);

        if (!product[0]) {
          throw new Error("Producto no encontrado");
        }

        // Verificar que el usuario no haya reseñado este producto
        const existingReview = await db
          .select()
          .from(reviews)
          .where(
            and(
              eq(reviews.productId, input.productId),
              eq(reviews.userId, ctx.user.id)
            )
          )
          .limit(1);

        if (existingReview[0]) {
          throw new Error("Ya has reseñado este producto");
        }

        // Crear reseña
        const result = await db.insert(reviews).values({
          productId: input.productId,
          userId: ctx.user.id,
          rating: input.rating,
          title: input.title,
          comment: input.comment,
        });

        return {
          success: true,
          message: "Reseña creada exitosamente",
          id: result.insertId,
        };
      } catch (error) {
        console.error("Error creating review:", error);
        throw new Error(error instanceof Error ? error.message : "Error al crear reseña");
      }
    }),

  /**
   * Actualizar reseña (solo el autor)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().min(5).max(255).optional(),
        comment: z.string().min(10).max(1000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar que la reseña existe y pertenece al usuario
        const review = await db
          .select()
          .from(reviews)
          .where(eq(reviews.id, input.id))
          .limit(1);

        if (!review[0]) {
          throw new Error("Reseña no encontrada");
        }

        if (review[0].userId !== ctx.user.id) {
          throw new Error("No tienes permiso para editar esta reseña");
        }

        // Actualizar reseña
        const updateValues: Record<string, any> = {};
        if (input.rating !== undefined) updateValues.rating = input.rating;
        if (input.title !== undefined) updateValues.title = input.title;
        if (input.comment !== undefined) updateValues.comment = input.comment;

        await db.update(reviews).set(updateValues).where(eq(reviews.id, input.id));

        return {
          success: true,
          message: "Reseña actualizada exitosamente",
        };
      } catch (error) {
        console.error("Error updating review:", error);
        throw new Error(error instanceof Error ? error.message : "Error al actualizar reseña");
      }
    }),

  /**
   * Eliminar reseña (solo el autor o admin)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Verificar que la reseña existe
        const review = await db
          .select()
          .from(reviews)
          .where(eq(reviews.id, input.id))
          .limit(1);

        if (!review[0]) {
          throw new Error("Reseña no encontrada");
        }

        // Verificar permisos
        if (review[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("No tienes permiso para eliminar esta reseña");
        }

        // Eliminar reseña
        await db.delete(reviews).where(eq(reviews.id, input.id));

        return {
          success: true,
          message: "Reseña eliminada exitosamente",
        };
      } catch (error) {
        console.error("Error deleting review:", error);
        throw new Error(error instanceof Error ? error.message : "Error al eliminar reseña");
      }
    }),

  /**
   * Marcar reseña como útil
   */
  markHelpful: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Incrementar contador de útiles
        const review = await db
          .select()
          .from(reviews)
          .where(eq(reviews.id, input.id))
          .limit(1);

        if (!review[0]) {
          throw new Error("Reseña no encontrada");
        }

        await db
          .update(reviews)
          .set({
            helpful: (review[0].helpful || 0) + 1,
          })
          .where(eq(reviews.id, input.id));

        return {
          success: true,
          message: "Reseña marcada como útil",
        };
      } catch (error) {
        console.error("Error marking review as helpful:", error);
        throw new Error("Error al marcar reseña como útil");
      }
    }),

  /**
   * Obtener reseña por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(reviews)
          .where(eq(reviews.id, input.id))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Error getting review:", error);
        return null;
      }
    }),

  /**
   * Obtener reseñas del usuario
   */
  getUserReviews: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { reviews: [], total: 0 };

      try {
        const allReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.userId, ctx.user.id))
          .orderBy(desc(reviews.createdAt));

        const total = allReviews.length;
        const result = allReviews.slice(input.offset, input.offset + input.limit);

        return { reviews: result, total };
      } catch (error) {
        console.error("Error getting user reviews:", error);
        return { reviews: [], total: 0 };
      }
    }),
});

export default reviewsRouter;
