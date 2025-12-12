import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import aiRouter from "./routers-ai";
import { createPaymentIntent, confirmPayment } from "./services/stripe";
import { sendOrderConfirmation, sendOrderStatusUpdate } from "./services/email";
import reviewsRouter from "./routers-reviews";
import webhooksRouter from "./routers-webhooks";

// ============ PRODUCTS ROUTER ============

const productsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.getProducts({
        categoryId: input.categoryId,
        search: input.search,
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const product = await db.getProductById(input);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Producto no encontrado",
        });
      }
      return product;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().int().positive(),
        categoryId: z.number(),
        image: z.string().optional(),
        stock: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden crear productos",
        });
      }
      return await db.createProduct(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().int().positive().optional(),
        categoryId: z.number().optional(),
        image: z.string().optional(),
        stock: z.number().int().nonnegative().optional(),
        isAvailable: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden actualizar productos",
        });
      }
      const { id, ...data } = input;
      await db.updateProduct(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden eliminar productos",
        });
      }
      await db.deleteProduct(input);
      return { success: true };
    }),
});

// ============ CATEGORIES ROUTER ============

const categoriesRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getCategories();
  }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const category = await db.getCategoryById(input);
      if (!category) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Categoría no encontrada",
        });
      }
      return category;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden crear categorías",
        });
      }
      return await db.createCategory(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden actualizar categorías",
        });
      }
      const { id, ...data } = input;
      await db.updateCategory(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden eliminar categorías",
        });
      }
      await db.deleteCategory(input);
      return { success: true };
    }),
});

// ============ CART ROUTER ============

const cartRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const cartItems = await db.getCartItems(ctx.user.id);
    
    // Enriquecer con información del producto
    const enriched = await Promise.all(
      cartItems.map(async (item) => {
        const product = await db.getProductById(item.productId);
        return {
          ...item,
          product,
        };
      })
    );
    
    return enriched;
  }),

  add: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Producto no encontrado",
        });
      }
      
      if (product.stock < input.quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Stock insuficiente",
        });
      }

      await db.addToCart(ctx.user.id, input.productId, input.quantity);
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        quantity: z.number().int().nonnegative(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateCartItem(input.id, input.quantity);
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await db.removeFromCart(input);
      return { success: true };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    await db.clearCart(ctx.user.id);
    return { success: true };
  }),
});

// ============ ADDRESSES ROUTER ============

const addressesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserAddresses(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        street: z.string().min(1),
        number: z.string().min(1),
        apartment: z.string().optional(),
        city: z.string().min(1),
        province: z.string().min(1),
        postalCode: z.string().min(1),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await db.createAddress({
        userId: ctx.user.id,
        ...input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        street: z.string().optional(),
        number: z.string().optional(),
        apartment: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateAddress(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await db.deleteAddress(input);
      return { success: true };
    }),
});

// ============ ORDERS ROUTER ============

const ordersRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserOrders(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pedido no encontrado",
        });
      }

      // Verificar que el usuario sea el propietario o admin
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permiso para ver este pedido",
        });
      }

      const items = await db.getOrderItems(order.id);
      return {
        ...order,
        items,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        totalAmount: z.number().int().positive(),
        shippingCost: z.number().int().nonnegative().default(0),
        deliveryAddressId: z.number().optional(),
        paymentMethod: z.enum(["credit_card", "debit_card", "bank_transfer", "cash_on_delivery", "yape", "plin"]),
        notes: z.string().optional(),
        items: z.array(
          z.object({
            productId: z.number(),
            productName: z.string(),
            quantity: z.number().int().positive(),
            price: z.number().int().positive(),
            subtotal: z.number().int().positive(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generar número de orden único
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Crear orden
      const orderResult = await db.createOrder({
        userId: ctx.user.id,
        orderNumber,
        totalAmount: input.totalAmount,
        shippingCost: input.shippingCost,
        deliveryAddressId: input.deliveryAddressId,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
      });

      // Obtener el ID de la orden creada
      const order = await db.getOrderByNumber(orderNumber);
      if (!order) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al crear la orden",
        });
      }

      // Crear items de la orden
      for (const item of input.items) {
        await db.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        });
      }

      // Crear transacción
      await db.createTransaction({
        orderId: order.id,
        userId: ctx.user.id,
        amount: input.totalAmount + input.shippingCost,
        paymentMethod: input.paymentMethod,
      });

      // Limpiar carrito
      await db.clearCart(ctx.user.id);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
      };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "preparing", "ready", "shipped", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden actualizar el estado de pedidos",
        });
      }

      await db.updateOrderStatus(input.id, input.status);
      return { success: true };
    }),
});

// ============ CONTACTS ROUTER ============

const contactsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Solo administradores pueden ver contactos",
      });
    }
    return await db.getContacts();
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
        type: z.enum(["suggestion", "complaint", "inquiry", "other"]).default("inquiry"),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createContact(input);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "read", "responded", "closed"]),
        response: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden actualizar contactos",
        });
      }

      await db.updateContactStatus(
        input.id,
        input.status,
        input.response,
        ctx.user.id
      );
      return { success: true };
    }),
});

// ============ USERS ROUTER ============

const usersRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Usuario no encontrado",
      });
    }
    return user;
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        profilePicture: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await db.updateUserProfile(ctx.user.id, input as any);
        return { success: true };
      } catch (error) {
        console.error("Failed to update user profile:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error al actualizar el perfil" });
      }
    }),
});

// ============ MAIN ROUTER ============

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  products: productsRouter,
  categories: categoriesRouter,
  cart: cartRouter,
  addresses: addressesRouter,
  orders: ordersRouter,
  contacts: contactsRouter,
  users: usersRouter,
  reviews: reviewsRouter,
  webhooks: webhooksRouter,
});

export type AppRouter = typeof appRouter;
