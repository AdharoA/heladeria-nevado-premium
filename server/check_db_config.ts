
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function checkConfig() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL not found");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(url);
        console.log("Connected.");

        // Check max_allowed_packet
        const [rows]: any = await connection.execute("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log("Config:", rows);

        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkConfig();
