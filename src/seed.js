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

export async function createClientAccountsTable(){
    try {

        const doesTableExist = await pool.query('SELECT to_regclass(\'public.client_accounts\')');
        if (doesTableExist.rows[0].to_regclass) {
            console.log('client_accounts table already exists. Skipping creation.');
            return;
        }

        console.log('Creating client_accounts table...');
        const res = await pool.query(`
            CREATE TABLE client_accounts (
                id                  SERIAL PRIMARY KEY,
                account_no          VARCHAR(20) UNIQUE NOT NULL,
                account_name        VARCHAR(255) NOT NULL,
                distributor         VARCHAR(100),
                category            VARCHAR(100),
                no_of_applicants    INT,
                active_status       VARCHAR(20),
                registered_email    VARCHAR(255),
                last_account_update DATE
            );`);

        if (res.command === 'CREATE'){
            console.log(`client_accounts table created successfully.`);
        }

    } catch (err) {
        throw err;
    }
}

export async function createApplicantsTable() {
    try {
        const doesTableExist = await pool.query('SELECT to_regclass(\'public.applicants\')');
        if (doesTableExist.rows[0].to_regclass) {
            console.log('applicants table already exists. Skipping creation.');
            return;
        }

        console.log('Creating applicants table...');

        const res = await pool.query(`
            CREATE TABLE applicants (
                id                 SERIAL PRIMARY KEY,
                client_account_id  INT NOT NULL REFERENCES client_accounts(id),
                applicant_order    INT NOT NULL,
                full_name          VARCHAR(255),
                first_name         VARCHAR(100),
                surname            VARCHAR(100),
                birthdate          DATE,
                email              VARCHAR(255)
            );`);

        if (res.command === 'CREATE'){
            console.log(`applicants table created successfully.`);
        }
        
    } catch (err) {
        throw err;
    }
}