
import 'dotenv/config';
import mysql from 'mysql2/promise';

async function increasePacketSize() {
    const url = process.env.DATABASE_URL;
    if (!url) process.exit(1);

    try {
        const connection = await mysql.createConnection(url);
        console.log("Connected.");

        console.log("Setting global max_allowed_packet to 64MB...");
        await connection.query("SET GLOBAL max_allowed_packet = 67108864");

        console.log("Checking GLOBAL variable value:");
        const [rows]: any = await connection.execute("SHOW GLOBAL VARIABLES LIKE 'max_allowed_packet'");
        console.log("Global Config:", rows);

        await connection.end();

        // Reconnect to verify session pick up
        console.log("Reconnecting to verify session...");
        const conn2 = await mysql.createConnection(url);
        const [rows2]: any = await conn2.execute("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log("New Session Config:", rows2);
        await conn2.end();

    } catch (err) {
        console.error("Failed to set variable:", err);
    }
}

increasePacketSize();
