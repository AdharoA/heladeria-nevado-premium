
import 'dotenv/config';
import { getDb } from "./db";
import { categories, products, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function seed() {
    const db = await getDb();
    if (!db) {
        console.error("Failed to connect to database");
        process.exit(1);
    }
    console.log("🌱 Seeding database...");

    // 1. Users
    console.log("Creating users...");
    try {
        await db.insert(users).values([
            {
                openId: 'admin-001',
                name: 'Administrador Heladería',
                email: 'admin@heladeria-nevado.com',
                loginMethod: 'system',
                role: 'admin'
            },
            {
                openId: 'user-001',
                name: 'Juan Pérez',
                email: 'juan@example.com',
                loginMethod: 'google',
                role: 'user'
            },
            {
                openId: 'user-002',
                name: 'María García',
                email: 'maria@example.com',
                loginMethod: 'google',
                role: 'user'
            },
            {
                openId: 'user-003',
                name: 'Carlos López',
                email: 'carlos@example.com',
                loginMethod: 'google',
                role: 'user'
            }
        ]).onDuplicateKeyUpdate({ set: { openId: 'admin-001' } });
    } catch (e: any) {
        console.log("Users already exist or error:", e.message);
    }

    // 2. Categories
    console.log("Creating categories...");
    try {
        await db.insert(categories).values([
            { name: 'Clásicos', description: 'Sabores tradicionales y populares', image: '🍦' },
            { name: 'Especiales', description: 'Sabores creativos y únicos', image: '✨' },
            { name: 'Sin Azúcar', description: 'Opciones saludables y dietéticas', image: '💚' },
            { name: 'Premium', description: 'Helados de lujo con ingredientes finos', image: '👑' },
            { name: 'Infantiles', description: 'Sabores divertidos para niños', image: '🎉' }
        ]).onDuplicateKeyUpdate({ set: { name: 'Clásicos' } });
    } catch (e: any) {
        console.log("Categories already exist or error:", e.message);
    }

    // 3. Products
    console.log("Creating products...");
    try {
        await db.insert(products).values([
            { name: 'Helado de Vainilla', description: 'Vainilla pura y cremosa con sabor auténtico', price: 1000, categoryId: 1, stock: 50, isAvailable: true },
            { name: 'Helado de Chocolate', description: 'Chocolate belga intenso y suave', price: 1200, categoryId: 1, stock: 40, isAvailable: true },
            { name: 'Helado de Fresa', description: 'Fresa fresca natural sin colorantes', price: 1100, categoryId: 1, stock: 35, isAvailable: true },
            { name: 'Helado de Menta', description: 'Menta refrescante con chocolate', price: 1100, categoryId: 1, stock: 30, isAvailable: true },
            { name: 'Helado de Cookies', description: 'Cookies y crema con trozos de galleta', price: 1300, categoryId: 2, stock: 25, isAvailable: true },
            { name: 'Helado de Pistacho', description: 'Pistacho premium importado', price: 1400, categoryId: 2, stock: 20, isAvailable: true },
            { name: 'Helado de Café', description: 'Café espresso con leche condensada', price: 1200, categoryId: 2, stock: 28, isAvailable: true },
            { name: 'Helado Sin Azúcar Vainilla', description: 'Vainilla sin azúcar añadido', price: 1100, categoryId: 3, stock: 22, isAvailable: true },
            { name: 'Helado Sin Azúcar Chocolate', description: 'Chocolate sin azúcar para diabéticos', price: 1150, categoryId: 3, stock: 18, isAvailable: true },
            { name: 'Helado Lujo Frutos Rojos', description: 'Mezcla premium de frutos rojos', price: 1600, categoryId: 4, stock: 15, isAvailable: true },
            { name: 'Helado Lujo Oro', description: 'Helado con laminillas de oro comestible', price: 2000, categoryId: 4, stock: 10, isAvailable: true },
            { name: 'Helado Arcoíris', description: 'Multicolor con sabores variados', price: 1300, categoryId: 5, stock: 32, isAvailable: true },
            { name: 'Helado Dinosaurio', description: 'Helado verde con caramelo crujiente', price: 1200, categoryId: 5, stock: 28, isAvailable: true }
        ]).onDuplicateKeyUpdate({ set: { name: 'Helado de Vainilla' } });
    } catch (e: any) {
        console.log("Products already exist or error:", e.message);
    }

    console.log("✅ Seeding completed!");
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
