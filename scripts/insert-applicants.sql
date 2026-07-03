-- ============================================================
-- INSERT CLIENT ACCOUNTS
-- ============================================================

insert into public.client_accounts (account_no, account_name, distributor, category, no_of_applicants, active_status, registered_email, last_account_update)
values
	('560111', '', 'PEMI', 'Joint - OR', 5, 'Active', 'cyrine.valois@philequity.net', now()),
	('560112', '', 'PEMI', 'Joint - OR with ITF', 4, 'Active', 'cyrine.valois@philequity.net', now()),
	('560113', '', 'PEMI', 'Joint - AND', 5, 'Active', 'cyrine.valois@philequity.net', now()),
	('560114', '', 'PEMI', 'Joint - AND with ITF', 4, 'Active', 'cyrine.valois@philequity.net', now());

-- ============================================================
-- INSERT APPLICANTS for the 4 client accounts
-- 
-- Rules applied:
--   - applicant_order starts at 1 up to no_of_applicants
--   - For "with ITF" accounts, the LAST applicant is a minor
--     (born after 2008-06-26, i.e. under 18 as of 2026-06-26)
-- ============================================================

-- Account 1: 560111 — Joint - OR (5 applicants, no ITF → all adults)
INSERT INTO public.applicants (client_account_id, applicant_order, full_name, first_name, surname, birthdate, email)
SELECT ca.id, v.*
FROM public.client_accounts ca
CROSS JOIN (VALUES
    (1, 'Cyrine Valois',    'Cyrine',   'Valois',    '1990-03-15'::date, 'cyrine.valois@philequity.net'),
    (2, 'Marcus Tan',       'Marcus',   'Tan',       '1985-07-22'::date, 'marcus.tan@email.com'),
    (3, 'Sophia Reyes',     'Sophia',   'Reyes',     '1992-11-08'::date, 'sophia.reyes@email.com'),
    (4, 'David Cruz',       'David',    'Cruz',      '1988-04-30'::date, 'david.cruz@email.com'),
    (5, 'Angela Santos',    'Angela',   'Santos',    '1995-09-12'::date, 'angela.santos@email.com')
) AS v(applicant_order, full_name, first_name, surname, birthdate, email)
WHERE ca.account_no = '560111' AND ca.category = 'Joint - OR';

-- Account 2: 560112 — Joint - OR with ITF (4 applicants, last is minor)
INSERT INTO public.applicants (client_account_id, applicant_order, full_name, first_name, surname, birthdate, email)
SELECT ca.id, v.*
FROM public.client_accounts ca
CROSS JOIN (VALUES
    (1, 'Henry Lim',        'Henry',     'Lim',       '1983-06-14'::date, 'henry.lim@email.com'),
    (2, 'Grace Torres',     'Grace',     'Torres',    '1991-01-25'::date, 'grace.torres@email.com'),
    (3, 'Robert Chen',      'Robert',    'Chen',      '1987-10-03'::date, 'robert.chen@email.com'),
    (4, 'Lily Mae Garcia',  'Lily Mae',  'Garcia',    '2010-05-20'::date, 'lily.garcia@email.com')  -- ~16 yrs old, minor
) AS v(applicant_order, full_name, first_name, surname, birthdate, email)
WHERE ca.account_no = '560112' AND ca.category = 'Joint - OR with ITF';

-- Account 3: 560113 — Joint - AND (5 applicants, no ITF → all adults)
INSERT INTO public.applicants (client_account_id, applicant_order, full_name, first_name, surname, birthdate, email)
SELECT ca.id, v.*
FROM public.client_accounts ca
CROSS JOIN (VALUES
    (1, 'Miguel Alvarez',   'Miguel',    'Alvarez',   '1986-12-01'::date, 'miguel.alvarez@email.com'),
    (2, 'Patricia Gomez',   'Patricia',  'Gomez',     '1993-08-17'::date, 'patricia.gomez@email.com'),
    (3, 'Joseph Ramos',     'Joseph',    'Ramos',     '1984-05-29'::date, 'joseph.ramos@email.com'),
    (4, 'Katherine Diaz',   'Katherine', 'Diaz',      '1990-07-14'::date, 'katherine.diaz@email.com'),
    (5, 'Michael Flores',   'Michael',   'Flores',    '1989-02-20'::date, 'michael.flores@email.com')
) AS v(applicant_order, full_name, first_name, surname, birthdate, email)
WHERE ca.account_no = '560113' AND ca.category = 'Joint - AND';

-- Account 4: 560114 — Joint - AND with ITF (4 applicants, last is minor)
INSERT INTO public.applicants (client_account_id, applicant_order, full_name, first_name, surname, birthdate, email)
SELECT ca.id, v.*
FROM public.client_accounts ca
CROSS JOIN (VALUES
    (1, 'Christopher Bautista', 'Christopher', 'Bautista',    '1982-09-08'::date, 'christopher.bautista@email.com'),
    (2, 'Jennifer Villanueva',  'Jennifer',    'Villanueva',  '1994-04-16'::date, 'jennifer.villanueva@email.com'),
    (3, 'Patrick Navarro',      'Patrick',     'Navarro',     '1988-11-25'::date, 'patrick.navarro@email.com'),
    (4, 'Zoey Marie Castillo',  'Zoey Marie',  'Castillo',    '2011-08-10'::date, 'zoey.castillo@email.com')  -- ~15 yrs old, minor
) AS v(applicant_order, full_name, first_name, surname, birthdate, email)
WHERE ca.account_no = '560114' AND ca.category = 'Joint - AND with ITF';
