const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Excel zero-date sentinels used as "no data" fillers in the exports —
// treated as missing rather than invalid.
const dateSentinels = new Set(['12/30/1899', '1/0/1900']);

function birthdateIssue(applicant) {
    if (applicant.birthdate || !applicant.birthdate_raw) return null;
    if (dateSentinels.has(applicant.birthdate_raw)) return null;

    return `invalid birthdate ("${applicant.birthdate_raw}")`;
}

export function emailIssue(value) {
    if (value === null) return 'missing';
    if (/^no data$/i.test(value)) return 'placeholder "No Data"';
    if (/[;,]/.test(value)) return `multiple emails in one cell ("${value}")`;
    if (!emailRe.test(value)) return `invalid format ("${value}")`;

    return null;
}

// Returns a list of data-quality issues for a parsed account record.
// An empty list means the record is safe to seed.
export function getRecordIssues(record) {
    const issues = [];

    const registeredIssue = emailIssue(record.registered_email);
    if (registeredIssue) issues.push(`registered email: ${registeredIssue}`);

    if (!record.active_status) issues.push('missing active status');

    if (!record.no_of_applicants) {
        issues.push('missing/zero no. of applicants');
    } else if (record.no_of_applicants !== record.applicants.length) {
        issues.push(`declared ${record.no_of_applicants} applicant(s) but ${record.applicants.length} found in row`);
    }

    for (const applicant of record.applicants) {
        const who = `applicant ${applicant.applicant_order} (${applicant.full_name})`;

        // only the primary applicant's email matters
        if (applicant.applicant_order === 1) {
            const issue = emailIssue(applicant.email);
            if (issue) issues.push(`${who}: email ${issue}`);
        }

        if (!applicant.first_name) issues.push(`${who}: missing first name`);
        if (!applicant.surname) issues.push(`${who}: missing surname`);

        const bdIssue = birthdateIssue(applicant);
        if (bdIssue) issues.push(`${who}: ${bdIssue}`);
    }

    return issues;
}
