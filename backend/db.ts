import { eq, and, like, desc, SQL } from "drizzle-orm";
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(id: number, data: Partial<{ name: string; email: string; phone: string; profilePicture: string }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name ?? null;
  if (data.email !== undefined) updateData.email = data.email ?? null;
  if (data.phone !== undefined) updateData.phone = data.phone ?? null;
  if (data.profilePicture !== undefined) updateData.profilePicture = data.profilePicture ?? null;

  await db.update(users).set(updateData).where(eq(users.id, id));
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

  if (whereCondition) {
    return await db.select().from(products).where(whereCondition).limit(limit).offset(offset);
  } else {
    return await db.select().from(products).limit(limit).offset(offset);
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
  paymentMethod: "credit_card" | "debit_card" | "bank_transfer" | "cash_on_delivery" | "yape" | "plin";
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
