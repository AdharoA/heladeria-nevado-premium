
import { getDb } from "./db";
import { sql } from "drizzle-orm";

async function checkColumn() {
  try {
    const db = await getDb();
    if (!db) {
        console.error("Failed to connect to DB");
        process.exit(1);
    }
    // Result type from mysql2/promise execute is [rows, fields]
    // Drizzle's db.execute returns that directly
    const result: any = await db.execute(sql`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profilePicture';
    `);
    
    // Check if result has rows
    if (result && result[0]) {
       console.log("Column Info:", result[0]);
    } else {
       console.log("No result found.");
    }
  } catch (error) {
    console.error("Error checking column:", error);
  }
  process.exit(0);
}

checkColumn();
