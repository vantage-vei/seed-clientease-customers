import './env.js';
import { checkDatabaseConnection } from './db.js';
import {
    createClientAccountsTable,
    createApplicantsTable,
    seedCustomers
} from './seed.js';
import chalk from 'chalk';
import pool from './db.js';

async function main() {
    console.log(chalk.green('Starting application...'));
    displayDatabaseConfig();

    try {
        await checkDatabaseConnection();

        await createClientAccountsTable();
        await createApplicantsTable();

        if (!process.env.CSV_FILE){
            console.log(chalk.red('CSV_FILE environment variable is not set. Please provide the path to the CSV file.'));
            process.exit(1);
        }

        await seedCustomers();
    } catch (err) {
        console.error(chalk.red('Failed to process: '), err);
        process.exit(1);
    } finally {
        await pool.end();
    }
    process.exit(0);
}

function displayDatabaseConfig() {
    console.log(chalk.blueBright('Database Configuration:'));
    console.log(chalk.blueBright(`Host: [${process.env.DB_HOST}]`));
    console.log(chalk.blueBright(`Port: [${process.env.DB_PORT}]`));
    console.log(chalk.blueBright(`Database Name: [${process.env.DB_NAME}]`));
    console.log(chalk.blueBright(`User: [${process.env.DB_USER}]`));
}

main().catch(err => {
    console.error(chalk.red('An error occurred:'), err);
});