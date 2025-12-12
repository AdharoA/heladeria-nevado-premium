import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { ENV } from './server/_core/env';

async function migrate() {
    console.log('🔄 Running posts table migration...');

    const connection = await mysql.createConnection(ENV.databaseUrl);
    const db = drizzle(connection);

    try {
        console.log('1. Adding images column...');
        await connection.query(`ALTER TABLE posts ADD COLUMN images json DEFAULT ('[]')`);

        console.log('2. Adding layout column...');
        await connection.query(`ALTER TABLE posts ADD COLUMN layout enum('carousel','side_by_side','collage') NOT NULL DEFAULT 'carousel'`);

        console.log('3. Dropping old image column...');
        await connection.query(`ALTER TABLE posts DROP COLUMN image`);

        console.log('✅ Migration completed successfully!');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️  Columns already exist, skipping...');
        } else if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log('⚠️  Column already dropped, skipping...');
        } else {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    } finally {
        await connection.end();
    }
}

migrate().catch(console.error);
