import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export async function checkDatabaseConnection() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log(`Database connection tested at: ${res.rows[0].now}`);

    } catch (err) {
        throw err;
    }
}

export default pool;