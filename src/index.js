import './env.js';
import { checkDatabaseConnection } from './db.js';

async function main(){
    displayDatabaseConfig();

    try {
        await checkDatabaseConnection();
    } catch (err) {
        console.error('Failed to connect to the database:', err);
    }

    process.exit(0);
}

function displayDatabaseConfig() {
    console.log('Database Configuration:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database Name: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
}

main().catch(err => {
    console.error('An error occurred:', err);
});