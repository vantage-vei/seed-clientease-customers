import './env.js';
import { checkDatabaseConnection } from './db.js';
import { 
    createClientAccountsTable, 
    createApplicantsTable, 
    seedCustomers 
} from './seed.js';
import { readCsv } from './read-csv.js';

async function main(){
    displayDatabaseConfig();

    try {
        await checkDatabaseConnection();

        const records = await readCsv('./iwf-client-list.csv');

        console.log(JSON.stringify(records[0], null, 2));
    } catch (err) {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    }

    // await createClientAccountsTable();
    // await createApplicantsTable();
    // await seedCustomers();

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