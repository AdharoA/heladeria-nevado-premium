
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function repro() {
    console.log("Starting reproduction with direct connection...");
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("No DATABASE_URL");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(url);
        console.log("Connected.");

        // 4MB string
        const largeString = "a".repeat(4 * 1024 * 1024);

        console.log("Attempting to send 4MB of data...");
        // Update user ID 1
        await connection.execute('UPDATE users SET profilePicture = ? WHERE id = ?', [largeString, 1]);

        console.log("Success! 4MB update accepted.");
        await connection.end();
    } catch (e: any) {
        console.error("Failed!", e.message);
    }
    process.exit(0);
}

repro();
