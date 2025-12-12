import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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

      // Check for duplicates and update instead of erroring
      const currentCart = await db.getCartItems(ctx.user.id);
      const existingItem = currentCart.find(item => item.productId === input.productId);

      if (existingItem) {
        // Update quantity instead of throwing error
        const newQuantity = existingItem.quantity + input.quantity;

        // Check stock for new total quantity
        if (product.stock < newQuantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Stock insuficiente. Disponible: ${product.stock}, en carrito: ${existingItem.quantity}`,
          });
        }

        await db.updateCartItem(existingItem.id, newQuantity);
        return { success: true, updated: true };
      }

      await db.addToCart(ctx.user.id, input.productId, input.quantity);
      return { success: true, updated: false };
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

  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Solo administradores pueden ver todos los pedidos",
      });
    }
    return await db.getAllOrders();
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
        paymentMethod: z.enum(["bank_transfer", "cash_on_delivery", "yape", "plin", "paypal"]),
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

  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Solo administradores pueden ver usuarios",
      });
    }
    return await db.getAllUsers();
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
      // Update user profile in database
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),

  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden cambiar roles",
        });
      }
      await db.updateUserRole(input.id, input.role);
      return { success: true };
    }),
});


// ============ AI ROUTER ============

const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        message: z.string(),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let adminContext = "";

        // Si el usuario es admin, inyectar datos relevantes
        if (ctx.user?.role === "admin") {
          const stats = await db.getDashboardStats();
          const lowStockProducts = (await db.getProducts()).filter(p => p.stock < 10);

          adminContext = `
Eres Adara, la asistente administrativa de Heladería Nevado.
Datos actuales del sistema:
- Ingresos totales: S/ ${(stats.income / 100).toFixed(2)}
- Pedidos totales: ${stats.ordersCount}
- Usuarios: ${stats.usersCount}
- Productos con bajo stock (<10): ${lowStockProducts.map(p => `${p.name} (${p.stock})`).join(", ")}
- Top productos: ${stats.topProducts.map(p => p.name).join(", ")}
          `;
        }

        const response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemma3:4b", // Updated to match installed model
            prompt: `Contexto: ${input.context || "Eres un asistente de heladería."}\n\n${adminContext}\n\nUsuario: ${input.message}\n\nAsistente:`,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();
        return { response: data.response };
      } catch (error) {
        console.error("AI Error:", error);
        if (error instanceof Error) {
          console.error("AI Error Details:", error.message);
          console.error("AI Error Stack:", error.stack);
        }
        // Fallback if Ollama is not running
        return {
          response: "Lo siento, no puedo conectar con mi cerebro de IA en este momento. Por favor asegúrate de que Ollama esté corriendo en http://localhost:11434."
        };
      }
    }),
});


// ============ REVIEWS ROUTER ============

const reviewsRouter = router({
  list: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      return await db.getProductReviews(input.productId);
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar si el usuario compró el producto (opcional, por ahora lo dejamos abierto)
      return await db.createReview({
        userId: ctx.user.id,
        productId: input.productId,
        rating: input.rating,
        comment: input.comment,
      });
    }),
});

// ============ DASHBOARD ROUTER ============

const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Solo administradores pueden ver el dashboard",
      });
    }
    return await db.getDashboardStats();
  }),
});

// ============ SETTINGS ROUTER ============

const settingsRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getSettings();
  }),

  update: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden actualizar configuraciones",
        });
      }
      await db.updateSetting(input.key, input.value, input.type);
      return { success: true };
    }),
});

// ============ POSTS ROUTER ============

const postsRouter = router({
  list: publicProcedure
    .input(z.object({ publishedOnly: z.boolean().default(true) }))
    .query(async ({ input }) => {
      return await db.getPosts(input.publishedOnly);
    }),

  getById: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const post = await db.getPostById(input);
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Publicación no encontrada",
        });
      }
      return post;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        images: z.array(z.string()).optional(),
        layout: z.enum(["carousel", "side_by_side", "collage"]).default("carousel"),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden crear publicaciones",
        });
      }
      return await db.createPost(input);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        images: z.array(z.string()).optional(),
        layout: z.enum(["carousel", "side_by_side", "collage"]).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden actualizar publicaciones",
        });
      }
      const { id, ...data } = input;
      // @ts-ignore
      await db.updatePost(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Solo administradores pueden eliminar publicaciones",
        });
      }
      await db.deletePost(input);
      return { success: true };
    }),
});

// ============ MAIN ROUTER ============

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions });
      return {
        success: true,
      } as const;
    }),

    loginByEmail: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuario no encontrado",
          });
        }

        if (input.password && user.password && input.password !== user.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Contraseña incorrecta",
          });
        }

        // Create JWT session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user };
      }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["user", "admin"]).default("user"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (process.env.NODE_ENV === 'production') {
          // throw new TRPCError({ code: 'FORBIDDEN', message: 'Registration only available in development' });
        }

        // Check if user exists
        const existingUsers = await db.getUsersByEmail(input.email);
        if (existingUsers && existingUsers.length > 0) {
          throw new TRPCError({ code: 'CONFLICT', message: 'User already exists' });
        }

        const openId = `dev-${Date.now()}`;

        await db.createUser({
          openId,
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
          loginMethod: "email",
        });

        const user = await db.getUserByOpenId(openId);
        if (!user) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create user' });
        }

        // Create JWT session token
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user };
      }),

    devLogin: publicProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (process.env.NODE_ENV === 'production') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Dev login only available in development' });
        }

        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true };
      }),
  }),
  products: productsRouter,
  categories: categoriesRouter,
  cart: cartRouter,
  addresses: addressesRouter,
  orders: ordersRouter,
  contacts: contactsRouter,
  users: usersRouter,
  ai: aiRouter,
  reviews: reviewsRouter,
  dashboard: dashboardRouter,
  settings: settingsRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
