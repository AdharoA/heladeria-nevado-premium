import { eq, and, like, desc, SQL, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  products,
  categories,
  cartItems,
  orders,
  orderItems,
  addresses,
  transactions,
  contacts,
  aiConversations,
  Product,
  Category,
  CartItem,
  Order,
  OrderItem,
  Address,
  Transaction,
  Contact,
  AIConversation,
  Review,
  reviews,
  settings,
  posts,
  Setting,
  InsertSetting,
  Post,
  InsertPost,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER MANAGEMENT ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(user);
  return result;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).where(eq(users.email, email));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users);
}

// ============ PRODUCTS & CATEGORIES ============

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: { name: string; description?: string; image?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<{ name: string; description: string; image: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(categories).where(eq(categories.id, id));
}

export async function getProducts(filters?: { categoryId?: number; search?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  let whereCondition: any = undefined;

  if (filters?.categoryId && filters?.search) {
    whereCondition = and(eq(products.categoryId, filters.categoryId), like(products.name, `%${filters.search}%`));
  } else if (filters?.categoryId) {
    whereCondition = eq(products.categoryId, filters.categoryId);
  } else if (filters?.search) {
    whereCondition = like(products.name, `%${filters.search}%`);
  }

  const productsQuery = db.select({
    id: products.id,
    name: products.name,
    description: products.description,
    price: products.price,
    categoryId: products.categoryId,
    image: products.image,
    stock: products.stock,
    isAvailable: products.isAvailable,
    createdAt: products.createdAt,
    updatedAt: products.updatedAt,
    rating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
  })
    .from(products)
    .leftJoin(reviews, eq(products.id, reviews.productId));

  if (whereCondition) {
    return await productsQuery.where(whereCondition).groupBy(products.id).limit(limit).offset(offset);
  } else {
    return await productsQuery.groupBy(products.id).limit(limit).offset(offset);
  }
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  image?: string;
  stock: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(products).values({
    ...data,
    isAvailable: true,
  });
  return result;
}

export async function updateProduct(id: number, data: Partial<{
  name: string;
  description: string;
  price: number;
  categoryId: number;
  image: string;
  stock: number;
  isAvailable: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(products).where(eq(products.id, id));
}

// ============ CART MANAGEMENT ============

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity });
  }
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.id, id));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// ============ ADDRESSES ============

export async function getUserAddresses(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(addresses).where(eq(addresses.userId, userId));
}

export async function createAddress(data: {
  userId: number;
  street: string;
  number: string;
  apartment?: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(addresses).values(data);
}

export async function updateAddress(id: number, data: Partial<{
  street: string;
  number: string;
  apartment: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(addresses).set(data).where(eq(addresses.id, id));
}

export async function deleteAddress(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(addresses).where(eq(addresses.id, id));
}

// ============ ORDERS ============

export async function createOrder(data: {
  userId: number;
  orderNumber: string;
  totalAmount: number;
  shippingCost: number;
  deliveryAddressId?: number;
  paymentMethod: "bank_transfer" | "cash_on_delivery" | "yape" | "plin" | "paypal";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(orders).values([
    {
      userId: data.userId,
      orderNumber: data.orderNumber,
      totalAmount: data.totalAmount,
      shippingCost: data.shippingCost,
      deliveryAddressId: data.deliveryAddressId || undefined,
      paymentMethod: data.paymentMethod,
      notes: data.notes || undefined,
      status: "pending",
      paymentStatus: "pending",
    },
  ]);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function updateOrderStatus(id: number, status: "pending" | "confirmed" | "preparing" | "ready" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

export async function updateOrderPaymentStatus(id: number, paymentStatus: "pending" | "completed" | "failed" | "refunded") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, id));
}

// ============ ORDER ITEMS ============

export async function createOrderItem(data: {
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(orderItems).values(data);
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ============ TRANSACTIONS ============

export async function createTransaction(data: {
  orderId: number;
  userId: number;
  amount: number;
  currency?: string;
  paymentMethod: string;
  transactionId?: string;
  stripePaymentIntentId?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(transactions).values({
    ...data,
    status: "pending",
  });
}

export async function getTransactionByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(transactions).where(eq(transactions.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTransactionStatus(id: number, status: "pending" | "processing" | "completed" | "failed" | "cancelled", errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(transactions).set({ status, errorMessage }).where(eq(transactions.id, id));
}

// ============ CONTACTS ============

export async function createContact(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type?: "suggestion" | "complaint" | "inquiry" | "other";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    type: data.type || "inquiry",
    status: "new" as const,
  };

  return await db.insert(contacts).values(insertData);
}

export async function getContacts(filters?: { status?: "new" | "read" | "responded" | "closed"; type?: "suggestion" | "complaint" | "inquiry" | "other" }) {
  const db = await getDb();
  if (!db) return [];

  let whereCondition: any = undefined;

  if (filters?.status && filters?.type) {
    whereCondition = and(eq(contacts.status, filters.status), eq(contacts.type, filters.type));
  } else if (filters?.status) {
    whereCondition = eq(contacts.status, filters.status);
  } else if (filters?.type) {
    whereCondition = eq(contacts.type, filters.type);
  }

  if (whereCondition) {
    return await db.select().from(contacts).where(whereCondition).orderBy(desc(contacts.createdAt));
  } else {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateContactStatus(id: number, status: "new" | "read" | "responded" | "closed", response?: string, respondedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(contacts).set({
    status,
    response,
    respondedBy,
    respondedAt: new Date(),
  }).where(eq(contacts.id, id));
}

// ============ AI CONVERSATIONS ============

export async function createAIConversation(data: {
  userId?: number;
  sessionId: string;
  currentPage?: string;
  messages?: any[];
  context?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(aiConversations).values({
    ...data,
    messages: data.messages || [],
    context: data.context || {},
  });
}

export async function getAIConversationBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aiConversations).where(eq(aiConversations.sessionId, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAIConversation(id: number, data: {
  currentPage?: string;
  messages?: any[];
  context?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aiConversations).set(data).where(eq(aiConversations.id, id));
}

// ============ REVIEWS ============

export async function createReview(data: {
  userId: number;
  productId: number;
  rating: number;
  comment?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(reviews).values(data);
}

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select({
    id: reviews.id,
    userId: reviews.userId,
    userName: users.name,
    rating: reviews.rating,
    comment: reviews.comment,
    createdAt: reviews.createdAt,
  })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return {
    income: 0,
    expenses: 0,
    ordersCount: 0,
    usersCount: 0,
    topProducts: [],
    salesByDay: [],
    salesByMonth: [],
    salesByYear: [],
    lowStockProducts: [],
  };

  // Basic stats
  const allOrders = await db.select().from(orders);
  const allUsers = await db.select().from(users);
  const allProducts = await db.select().from(products);

  const income = allOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Mock expenses as 60% of income for now (ingredients, etc)
  const expenses = Math.round(income * 0.6);

  // Top products
  const allOrderItems = await db.select().from(orderItems);
  const productSales = new Map<number, { name: string, quantity: number, total: number }>();

  allOrderItems.forEach(item => {
    const current = productSales.get(item.productId) || { name: item.productName, quantity: 0, total: 0 };
    productSales.set(item.productId, {
      name: item.productName,
      quantity: current.quantity + item.quantity,
      total: current.total + item.subtotal
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Low Stock Products (threshold < 10)
  const lowStockProducts = allProducts
    .filter(p => p.stock < 10)
    .map(p => ({ id: p.id, name: p.name, stock: p.stock }))
    .slice(0, 5);

  // Sales by day (last 7 days)
  const salesByDay = new Map<string, number>();
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    salesByDay.set(d.toISOString().split('T')[0], 0);
  }

  // Sales by Month (last 12 months)
  const salesByMonth = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    salesByMonth.set(key, 0);
  }

  // Sales by Year (last 5 years)
  const salesByYear = new Map<string, number>();
  for (let i = 4; i >= 0; i--) {
    const year = String(today.getFullYear() - i);
    salesByYear.set(year, 0);
  }

  allOrders.forEach(o => {
    if (o.paymentStatus === 'completed' || o.status !== 'cancelled') { // Include confirmed orders too? Let's stick to completed payment or non-cancelled
      // Actually, for sales charts, usually we count valid orders.
      // Let's count non-cancelled orders for now to show activity.
      if (o.status === 'cancelled') return;

      console.log('📊 Counting order:', o.id, 'Date:', o.createdAt, 'Amount:', o.totalAmount, 'Status:', o.status);

      const date = o.createdAt;
      const dayKey = date.toISOString().split('T')[0];
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const yearKey = String(date.getFullYear());

      // Always add to maps, even if key doesn't exist
      salesByDay.set(dayKey, (salesByDay.get(dayKey) || 0) + o.totalAmount);
      salesByMonth.set(monthKey, (salesByMonth.get(monthKey) || 0) + o.totalAmount);
      salesByYear.set(yearKey, (salesByYear.get(yearKey) || 0) + o.totalAmount);
    }
  });

  console.log('📊 Sales by day:', Array.from(salesByDay.entries()));
  console.log('📊 Sales by month:', Array.from(salesByMonth.entries()));

  return {
    income,
    expenses,
    ordersCount: allOrders.length,
    usersCount: allUsers.length,
    topProducts,
    lowStockProducts,
    salesByDay: Array.from(salesByDay.entries()).map(([date, amount]) => ({ date, amount })),
    salesByMonth: Array.from(salesByMonth.entries()).map(([date, amount]) => ({ date, amount })),
    salesByYear: Array.from(salesByYear.entries()).map(([date, amount]) => ({ date, amount })),
  };
}

// ============ SETTINGS ============

export async function getSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(settings);
}

export async function getSettingByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSetting(key: string, value: string, type: string = "string") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(settings).values({ key, value, type }).onDuplicateKeyUpdate({ set: { value, type } });
}

// ============ POSTS (CMS) ============

export async function getPosts(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];

  if (publishedOnly) {
    return await db.select().from(posts).where(eq(posts.published, true)).orderBy(desc(posts.createdAt));
  }
  return await db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function getPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPost(data: { title: string; content?: string; images?: string[]; layout?: "carousel" | "side_by_side" | "collage"; published?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(posts).values(data);
}

export async function updatePost(id: number, data: Partial<{ title: string; content: string; images: string[]; layout: "carousel" | "side_by_side" | "collage"; published: boolean }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(posts).set(data).where(eq(posts.id, id));
}

export async function deletePost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(posts).where(eq(posts.id, id));
}
