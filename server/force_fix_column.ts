
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function fix() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL not found in environment variables.");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(url);
        console.log("Connected to database.");

        // Check current state
        const [rows]: any = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profilePicture'
    `);
        console.log("Current column info:", rows[0]);

        // Force update
        console.log("Executing: ALTER TABLE users MODIFY profilePicture LONGTEXT");
        await connection.execute(`ALTER TABLE users MODIFY profilePicture LONGTEXT`);

        // Verify update
        const [newRows]: any = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'profilePicture'
    `);
        console.log("New column info:", newRows[0]);

        console.log("Done.");
        await connection.end();
    } catch (err) {
        console.error("Failed to update column:", err);
        process.exit(1);
    }
}

fix();
