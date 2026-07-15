# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-07-15

Initial production release.

### Added

- Pre-seed data validation (`src/validate.js`): accounts with data-quality issues are skipped and reported instead of being seeded. Checks include:
  - missing, placeholder ("No Data"), multi-value, or malformed registered/applicant emails (primary applicant only)
  - missing active status
  - missing/zero declared applicant count, or a mismatch between the declared count and the applicants actually present in the row
  - applicants missing a first name or surname
  - applicants with an unparseable birthdate (e.g. mangled timestamps like `0077-07-18 00:00:00`); Excel zero-date sentinels still count as merely missing
- Data-issues report script (`npm run report-issues -- <input.csv> [output.csv]`): writes a CSV of flagged accounts with per-account remarks.
- Interactive database browser (`npm run browse`): list/describe/count tables, page through rows, and run ad-hoc SQL against the ClientEase database.
- Additional mock dataset for testing (`mock-data1.csv`).

### Changed

- CSV reader hardening (`src/read-csv.js`):
  - auto-detects the export layout — legacy 5-column applicant blocks vs the extended 7-column layout that adds "Client ID" and "Last Account Update" per applicant
  - normalizes `"0"` filler values and blank cells to `null` across all fields
  - strict date parsing: only real `M/D/YYYY` calendar dates with plausible years are accepted; Excel zero-date sentinels (`12/30/1899`, `1/0/1900`) and mangled timestamps are nulled
  - accepts header variants for the applicant-count and registered-email columns
  - "Last Account Update" is now validated as a date instead of stored raw
- Seeder (`src/seed.js`) now filters records through validation before inserting and logs a summary of skipped accounts.
- Trimmed `mock-data.csv` down to a small representative sample.
