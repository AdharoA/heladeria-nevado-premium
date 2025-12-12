import { z } from "zod";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { products, categories } from "./drizzle/schema";
import { eq, like, and } from "drizzle-orm";

const productsRouter = router({
  /**
   * Obtener todos los productos (público)
   */
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { products: [], total: 0 };

      try {
        let query = db.select().from(products);

        if (input.categoryId) {
          query = query.where(eq(products.categoryId, input.categoryId));
        }

        if (input.search) {
          query = query.where(like(products.name, `%${input.search}%`));
        }

        const allProducts = await query;
        const total = allProducts.length;
        const result = allProducts.slice(input.offset, input.offset + input.limit);

        return { products: result, total };
      } catch (error) {
        console.error("Error listing products:", error);
        return { products: [], total: 0 };
      }
    }),

  /**
   * Obtener un producto por ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db
          .select()
          .from(products)
          .where(eq(products.id, input.id))
          .limit(1);

        return result[0] || null;
      } catch (error) {
        console.error("Error getting product:", error);
        return null;
      }
    }),

  /**
   * Crear producto (solo admin)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        price: z.number().min(1),
        categoryId: z.number(),
        stock: z.number().min(0).default(0),
        image: z.string().optional(),
        isAvailable: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await db.insert(products).values({
          name: input.name,
          description: input.description,
          price: input.price,
          categoryId: input.categoryId,
          stock: input.stock,
          image: input.image,
          isAvailable: input.isAvailable,
        });

        return {
          success: true,
          message: "Producto creado exitosamente",
          id: result.insertId,
        };
      } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("No se pudo crear el producto");
      }
    }),

  /**
   * Actualizar producto (solo admin)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        price: z.number().min(1).optional(),
        categoryId: z.number().optional(),
        stock: z.number().min(0).optional(),
        image: z.string().optional(),
        isAvailable: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const { id, ...updateData } = input;

        // Filtrar solo los campos que se van a actualizar
        const updateValues: Record<string, any> = {};
        if (updateData.name !== undefined) updateValues.name = updateData.name;
        if (updateData.description !== undefined) updateValues.description = updateData.description;
        if (updateData.price !== undefined) updateValues.price = updateData.price;
        if (updateData.categoryId !== undefined) updateValues.categoryId = updateData.categoryId;
        if (updateData.stock !== undefined) updateValues.stock = updateData.stock;
        if (updateData.image !== undefined) updateValues.image = updateData.image;
        if (updateData.isAvailable !== undefined) updateValues.isAvailable = updateData.isAvailable;

        await db.update(products).set(updateValues).where(eq(products.id, id));

        return {
          success: true,
          message: "Producto actualizado exitosamente",
        };
      } catch (error) {
        console.error("Error updating product:", error);
        throw new Error("No se pudo actualizar el producto");
      }
    }),

  /**
   * Eliminar producto (solo admin)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(products).where(eq(products.id, input.id));

        return {
          success: true,
          message: "Producto eliminado exitosamente",
        };
      } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("No se pudo eliminar el producto");
      }
    }),

  /**
   * Obtener categorías
   */
  getCategories: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error("Error getting categories:", error);
      return [];
    }
  }),

  /**
   * Crear categoría (solo admin)
   */
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const result = await db.insert(categories).values({
          name: input.name,
          description: input.description,
          icon: input.icon,
        });

        return {
          success: true,
          message: "Categoría creada exitosamente",
          id: result.insertId,
        };
      } catch (error) {
        console.error("Error creating category:", error);
        throw new Error("No se pudo crear la categoría");
      }
    }),

  /**
   * Actualizar categoría (solo admin)
   */
  updateCategory: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        const { id, ...updateData } = input;

        const updateValues: Record<string, any> = {};
        if (updateData.name !== undefined) updateValues.name = updateData.name;
        if (updateData.description !== undefined) updateValues.description = updateData.description;
        if (updateData.icon !== undefined) updateValues.icon = updateData.icon;

        await db.update(categories).set(updateValues).where(eq(categories.id, id));

        return {
          success: true,
          message: "Categoría actualizada exitosamente",
        };
      } catch (error) {
        console.error("Error updating category:", error);
        throw new Error("No se pudo actualizar la categoría");
      }
    }),

  /**
   * Eliminar categoría (solo admin)
   */
  deleteCategory: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        await db.delete(categories).where(eq(categories.id, input.id));

        return {
          success: true,
          message: "Categoría eliminada exitosamente",
        };
      } catch (error) {
        console.error("Error deleting category:", error);
        throw new Error("No se pudo eliminar la categoría");
      }
    }),
});

export default productsRouter;
