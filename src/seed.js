import pool from './db.js';
import { readCsv } from './read-csv.js';
import chalk from 'chalk';

export async function seedCustomers() {
    const client = await pool.connect();

    try {
        const records = await readCsv(process.env.CSV_FILE);

        console.log(chalk.yellow(`Seeding ${records.length} client accounts and their applicants...`));

        await client.query('BEGIN');

        for (const record of records) {

            console.log(chalk.yellow(`Processing account [${record.account_no}] - [${record.account_name}]...`));

            const result = await client.query(`
                INSERT INTO public.client_accounts (
                    account_no,
                    account_name,
                    distributor,
                    category,
                    no_of_applicants,
                    active_status,
                    registered_email,
                    last_account_update
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (account_no) DO NOTHING
                RETURNING id
                `, [record.account_no,
                    record.account_name,
                    record.distributor,
                    record.category,
                    record.no_of_applicants,
                    record.active_status,
                    record.registered_email,
                    record.last_account_update]);

            const clientAccountId = result.rows[0]?.id;

            if (!clientAccountId) {
                console.log(chalk.yellow(`Account ${record.account_no} already exists. Skipping.`));
                continue;
            }

            for (const applicant of record.applicants) {
                const applicantResult = await client.query(`
                    INSERT INTO public.applicants (
                        client_account_id,
                        applicant_order,
                        full_name,
                        first_name,
                        surname,
                        birthdate,
                        email
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [clientAccountId,
                    applicant.applicant_order,
                    applicant.full_name,
                    applicant.first_name,
                    applicant.surname,
                    applicant.birthdate,
                    applicant.email]);

                if (applicantResult.rowCount > 0) {
                    console.log(chalk.green(`Inserted applicant [${applicant.full_name}] for account [${record.account_no}]`));
                }
            }
        }

        await client.query('COMMIT');
        console.log(chalk.green('Seeding completed successfully.'));
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

export async function createClientAccountsTable() {
    try {

        const doesTableExist = await pool.query('SELECT to_regclass(\'public.client_accounts\')');
        if (doesTableExist.rows[0].to_regclass) {
            console.log(chalk.yellow('client_accounts table already exists. Skipping creation.'));
            return true;
        }

        console.log(chalk.green('Creating client_accounts table...'));
        const res = await pool.query(`
            CREATE TABLE public.client_accounts (
                id                  SERIAL PRIMARY KEY,
                account_no          VARCHAR(20) UNIQUE NOT NULL,
                account_name        TEXT NOT NULL,
                distributor         VARCHAR(100),
                category            VARCHAR(100),
                no_of_applicants    INT,
                active_status       VARCHAR(20),
                registered_email    VARCHAR(255),
                last_account_update DATE
            );`);

        if (res.command === 'CREATE') {
            console.log(chalk.green(`client_accounts table created successfully.`));
        }

        return true;

    } catch (err) {
        throw err;
    }
}

export async function createApplicantsTable() {
    try {
        const doesTableExist = await pool.query('SELECT to_regclass(\'public.applicants\')');
        if (doesTableExist.rows[0].to_regclass) {
            console.log(chalk.yellow('applicants table already exists. Skipping creation.'));
            return true;
        }

        console.log(chalk.green('Creating applicants table...'));

        const res = await pool.query(`
            CREATE TABLE public.applicants (
                id                 SERIAL PRIMARY KEY,
                client_account_id  INT NOT NULL REFERENCES public.client_accounts(id),
                applicant_order    INT NOT NULL,
                full_name          VARCHAR(255),
                first_name         VARCHAR(100),
                surname            VARCHAR(100),
                birthdate          DATE,
                email              VARCHAR(255)
            );`);

        if (res.command === 'CREATE') {
            console.log(chalk.green(`applicants table created successfully.`));
        }

        return true;
    } catch (err) {
        throw err;
    }
}