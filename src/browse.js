import './env.js';
import readline from 'node:readline/promises';
import chalk from 'chalk';
import pool, { checkDatabaseConnection } from './db.js';

const PAGE_SIZE = 20;

const HELP = `
${chalk.bold('Commands:')}
  ${chalk.cyan('\\dt')}                  list tables
  ${chalk.cyan('\\d <table>')}           describe table columns
  ${chalk.cyan('\\s <table> [page]')}    show rows (${PAGE_SIZE} per page)
  ${chalk.cyan('\\c <table>')}           count rows
  ${chalk.cyan('\\q')}                   quit
  ${chalk.cyan('<sql>')}                 run any SQL query (e.g. SELECT * FROM applicants LIMIT 5)
  ${chalk.cyan('\\h')}                   show this help
`;

function printRows(rows) {
    if (rows.length === 0) {
        console.log(chalk.yellow('(no rows)'));
        return;
    }
    console.table(rows);
    console.log(chalk.gray(`${rows.length} row(s)`));
}

async function listTables() {
    const res = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    `);
    printRows(res.rows);
}

async function describeTable(table) {
    const res = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
    `, [table]);
    if (res.rows.length === 0) {
        console.log(chalk.red(`Table "${table}" not found.`));
        return;
    }
    printRows(res.rows);
}

async function tableExists(table) {
    const res = await pool.query(`
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
    `, [table]);
    return res.rows.length > 0;
}

async function showRows(table, page = 1) {
    if (!(await tableExists(table))) {
        console.log(chalk.red(`Table "${table}" not found.`));
        return;
    }
    const offset = (page - 1) * PAGE_SIZE;
    // table name is validated against information_schema above, safe to interpolate quoted
    const res = await pool.query(
        `SELECT * FROM "${table}" LIMIT $1 OFFSET $2`,
        [PAGE_SIZE, offset]
    );
    printRows(res.rows);
    console.log(chalk.gray(`page ${page} — use "\\s ${table} ${page + 1}" for the next page`));
}

async function countRows(table) {
    if (!(await tableExists(table))) {
        console.log(chalk.red(`Table "${table}" not found.`));
        return;
    }
    const res = await pool.query(`SELECT COUNT(*) AS count FROM "${table}"`);
    console.log(chalk.green(`${table}: ${res.rows[0].count} row(s)`));
}

async function runSql(sql) {
    const res = await pool.query(sql);
    if (Array.isArray(res.rows) && res.rows.length > 0) {
        printRows(res.rows);
    } else {
        console.log(chalk.green(`OK — ${res.command}${res.rowCount != null ? ` (${res.rowCount} row(s) affected)` : ''}`));
    }
}

async function handle(input) {
    const trimmed = input.trim();
    if (!trimmed) return;

    const [cmd, ...args] = trimmed.split(/\s+/);

    switch (cmd) {
        case '\\dt': return listTables();
        case '\\d':  return describeTable(args[0]);
        case '\\s':  return showRows(args[0], Math.max(1, parseInt(args[1], 10) || 1));
        case '\\c':  return countRows(args[0]);
        case '\\h':  return console.log(HELP);
        default:     return runSql(trimmed);
    }
}

async function main() {
    console.log(chalk.green('ClientEase DB Browser'));
    console.log(chalk.blueBright(`Connected to [${process.env.DB_NAME}] at [${process.env.DB_HOST}:${process.env.DB_PORT}] as [${process.env.DB_USER}]`));

    try {
        await checkDatabaseConnection();
    } catch (err) {
        console.error(chalk.red('Failed to connect to database: '), err.message);
        process.exit(1);
    }

    console.log(HELP);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    while (true) {
        let line;
        try {
            line = await rl.question(chalk.cyan('db> '));
        } catch {
            break; // Ctrl+C / stdin closed
        }
        if (line.trim() === '\\q') break;
        try {
            await handle(line);
        } catch (err) {
            console.error(chalk.red('Error: '), err.message);
        }
    }

    rl.close();
    await pool.end();
    console.log(chalk.green('Bye.'));
    process.exit(0);
}

main().catch(err => {
    console.error(chalk.red('An error occurred:'), err);
    process.exit(1);
});
