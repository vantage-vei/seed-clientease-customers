import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import chalk from 'chalk';

function parseBirthdate(value) {
    if (!value || value.trim() === '12/30/1899') return null;

    return value.trim() || null;
}

export async function readCsv(filePath) {
    return new Promise((resolve, reject) => {
        const records = [];

        createReadStream(filePath)
            .pipe(parse({
                from_line: 2,
                columns: (headers) => headers.map((h, i) => {
                    if (i >= 8 && i <= 12) return `applicant_1_${h}`;
                    if (i >= 13 && i <= 17) return `applicant_2_${h}`;
                    if (i >= 18 && i <= 22) return `applicant_3_${h}`;
                    if (i >= 23 && i <= 27) return `applicant_4_${h}`;
                    if (i >= 28 && i <= 32) return `applicant_5_${h}`;
                    return h;
                })
            }))
            .on('data', (row) => {
                if (!row['Account No.'] || !row['Account Name']) return;

                const applicants = [];

                for (let i = 1; i <= 5; i++) {
                    const fullName = row[`applicant_${i}_Applicant Name`];
                    if (!fullName) continue;  // skip empty applicant slots

                    applicants.push({
                        applicant_order: i,
                        full_name: fullName,
                        first_name: row[`applicant_${i}_First Name`] || null,
                        surname: row[`applicant_${i}_Surname`] || null,
                        birthdate: parseBirthdate(row[`applicant_${i}_Birthdate`]),
                        email: row[`applicant_${i}_Email Address`] || null,
                    });
                }

                records.push({
                    account_no: row['Account No.'],
                    account_name: row['Account Name'],
                    distributor: row['Distributor'] || null,
                    category: row['Category'] || null,
                    no_of_applicants: parseInt(row['No of Applicants']) || null,
                    active_status: row['Active Status'] || null,
                    registered_email: row['Registered Email Address (CN/SOA)'] || null,
                    last_account_update: row['Last Account Update'] || null,
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