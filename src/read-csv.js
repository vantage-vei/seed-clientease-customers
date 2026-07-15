import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import chalk from 'chalk';

// "0" is used as a no-data filler in the exports, alongside genuinely empty cells
function normalize(value) {
    if (value === undefined || value === null) return null;
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === '0') return null;

    return trimmed;
}

// Accepts only real M/D/YYYY calendar dates with a plausible year.
// Nulls export artifacts: "0", "12/30/1899" / "1/0/1900" (Excel zero-date
// sentinels, caught by the year floor and day check) and mangled
// timestamps like "0077-07-18 00:00:00".
function parseDate(value) {
    const normalized = normalize(value);
    if (!normalized) return null;

    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(normalized);
    if (!match) return null;

    const [month, day, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (year < 1900 || year > 2100) return null;

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

    return normalized;
}

export async function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const records = [];

        createReadStream(filePath)
            .pipe(parse({
                from_line: 2,
                columns: (headers) => {
                    // Legacy layout: 5 columns per applicant block.
                    // Extended layout adds "Client ID" (block start) and
                    // "Last Account Update" (block end), making 7 per block.
                    const blockSize = headers[8] === 'Client ID' ? 7 : 5;

                    return headers.map((h, i) => {
                        if (i < 8) return h;

                        const applicantNo = Math.floor((i - 8) / blockSize) + 1;
                        return `applicant_${applicantNo}_${h}`;
                    });
                }
            }))
            .on('data', (row) => {
                if (!row['Account No.'] || !row['Account Name']) return;

                const applicants = [];

                for (let i = 1; i <= 5; i++) {
                    const fullName = normalize(row[`applicant_${i}_Applicant Name`]);
                    if (!fullName) continue;  // skip empty applicant slots

                    applicants.push({
                        applicant_order: i,
                        full_name: fullName,
                        first_name: normalize(row[`applicant_${i}_First Name`]),
                        surname: normalize(row[`applicant_${i}_Surname`]),
                        birthdate: parseDate(row[`applicant_${i}_Birthdate`]),
                        email: normalize(row[`applicant_${i}_Email Address`]),
                    });
                }

                records.push({
                    account_no: row['Account No.'],
                    account_name: row['Account Name'],
                    distributor: normalize(row['Distributor']),
                    category: normalize(row['Category']),
                    no_of_applicants: parseInt(row['No of Applicants'] ?? row['No. of Applicants']) || null,
                    active_status: normalize(row['Active Status']),
                    registered_email: normalize(row['Registered Email Address (CN/SOA)'] ?? row['Registered Email Address']),
                    last_account_update: parseDate(row['Last Account Update']),
                    applicants
                });
            })
            .on('end', () => {
                console.log(chalk.green(`Finished reading CSV file. Total records: ${records.length}`));
                resolve(records);
            })
            .on('error', (err) => {
                console.error(chalk.red('Error reading CSV file:'), err);
                reject(err);
            });
    });
}
