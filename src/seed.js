import pool from './db.js';

export async function seedCustomers() {
    const client = await pool.connect();
    try {
        
    } catch (err) {
        throw err;
    } finally {
        client.release();
    }
}
