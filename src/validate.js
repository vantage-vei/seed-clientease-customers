const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    }

    return issues;
}
