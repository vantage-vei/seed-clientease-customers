import { writeFileSync } from 'fs';
import chalk from 'chalk';
import { readCsv } from '../src/read-csv.js';
import { getRecordIssues } from '../src/validate.js';

function csvCell(value) {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

async function main() {
    const input = process.argv[2];
    if (!input) {
        console.error(chalk.red('Usage: node scripts/generate-issues-report.js <input.csv> [output.csv]'));
        process.exit(1);
    }

    const output = process.argv[3] ?? `${input.replace(/\.csv$/i, '')}-issues.csv`;

    const records = await readCsv(input);
    const lines = ['Account No.,Account Name,No. of Applicants,Remarks'];

    const flagged = records
        .map(record => ({ record, issues: getRecordIssues(record) }))
        .filter(({ issues }) => issues.length > 0)
        .sort((a, b) => a.record.account_name.localeCompare(b.record.account_name));

    for (const { record, issues } of flagged) {
        lines.push([
            record.account_no,
            record.account_name,
            record.no_of_applicants ?? 0,
            issues.map(capitalize).join('; ')
        ].map(csvCell).join(','));
    }

    writeFileSync(output, lines.join('\n') + '\n');
    console.log(chalk.green(`${flagged.length} of ${records.length} account(s) have issues — report written to ${output}`));
}

main().catch(err => {
    console.error(chalk.red('Failed to generate report:'), err);
    process.exit(1);
});
