import { faker } from '@faker-js/faker';
import { createWriteStream } from 'fs';

const TOTAL_ACCOUNTS = 200;
const OUTPUT_FILE = './mock-data.csv';

const DISTRIBUTORS = ['TPA - Wealth', 'TPA - Ebusiness', 'TPA - Rampver', 'TPA - Novel Capital', 'PEMI', 'Directors'];
const CATEGORIES = ['Individual', 'Individual with ITF', 'Joint - OR', 'Joint - OR with ITF', 'Joint - AND', 'Joint - AND with ITF'];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateApplicant() {
    const firstName = faker.person.firstName();
    const surname = faker.person.lastName();
    const fullName = `${firstName} ${surname}`;
    const birthdate = faker.date.birthdate({ min: 18, max: 75, mode: 'age' });
    const month = birthdate.getMonth() + 1;
    const day = birthdate.getDate();
    const year = birthdate.getFullYear();

    return {
        fullName,
        firstName,
        surname,
        birthdate: `${month}/${day}/${year}`,
        email: faker.internet.email({ firstName, lastName: surname }).toLowerCase(),
    };
}

function buildAccountName(applicants, category) {
    const titles = ['Mr.', 'Mrs.', 'Ms.'];
    const parts = applicants.map(a => `${randomFrom(titles)} ${a.fullName}`);

    if (category.includes('AND')) return parts.join(' AND ');
    if (category.includes('OR')) return parts.join(' OR ');
    return parts[0];
}

function generateRecord(accountNo) {
    const category = randomFrom(CATEGORIES);
    const isJoint = category.startsWith('Joint');
    const hasITF = category.includes('ITF');

    let numApplicants = 1;
    if (isJoint) numApplicants = faker.number.int({ min: 2, max: 3 });
    if (hasITF) numApplicants = Math.max(numApplicants, 2);

    const applicants = Array.from({ length: numApplicants }, generateApplicant);
    const accountName = buildAccountName(applicants, category);
    const primaryApplicant = applicants[0];

    return {
        accountNo: String(accountNo),
        accountName,
        distributor: randomFrom(DISTRIBUTORS),
        category,
        noOfApplicants: numApplicants,
        activeStatus: 'Active',
        registeredEmail: primaryApplicant.email,
        lastAccountUpdate: '',
        applicants,
    };
}

function padApplicants(applicants, total = 5) {
    const padded = [...applicants];
    while (padded.length < total) {
        padded.push({ fullName: '', firstName: '', surname: '', birthdate: '', email: '' });
    }
    return padded;
}

const writer = createWriteStream(OUTPUT_FILE);

// Row 1: group headers
writer.write('Client Account,,,,,,,,1st Applicant,,,,,2nd Applicant,,,,,3rd Applicant,,,,,4th Applicant,,,,,5th Applicant,,,,\n');

// Row 2: column headers
writer.write('Account No.,Account Name,Distributor,Category,No of Applicants,Active Status,Registered Email Address (CN/SOA),Last Account Update,Applicant Name,First Name,Surname,Birthdate,Email Address,Applicant Name,First Name,Surname,Birthdate,Email Address,Applicant Name,First Name,Surname,Birthdate,Email Address,Applicant Name,First Name,Surname,Birthdate,Email Address,Applicant Name,First Name,Surname,Birthdate,Email Address\n');

let accountNo = 500000;

for (let i = 0; i < TOTAL_ACCOUNTS; i++) {
    accountNo += faker.number.int({ min: 1, max: 50 });
    const record = generateRecord(accountNo);
    const padded = padApplicants(record.applicants);

    const row = [
        record.accountNo,
        `"${record.accountName.replace(/"/g, '""')}"`,
        record.distributor,
        record.category,
        record.noOfApplicants,
        record.activeStatus,
        record.registeredEmail,
        record.lastAccountUpdate,
        ...padded.flatMap(a => [a.fullName, a.firstName, a.surname, a.birthdate, a.email]),
    ];

    writer.write(row.join(',') + '\n');
}

writer.end(() => {
    console.log(`Generated ${TOTAL_ACCOUNTS} mock accounts → ${OUTPUT_FILE}`);
});
