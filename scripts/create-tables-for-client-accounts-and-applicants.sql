CREATE TABLE public.client_accounts (
                id                  SERIAL PRIMARY KEY,
                account_no          VARCHAR(20) UNIQUE NOT NULL,
                account_name        TEXT NOT NULL,
                distributor         VARCHAR(100),
                category            VARCHAR(100),
                no_of_applicants    INT,
                active_status       VARCHAR(20),
                registered_email    VARCHAR(255),
                last_account_update DATE
            );

CREATE TABLE public.applicants (
                id                 SERIAL PRIMARY KEY,
                client_account_id  INT NOT NULL REFERENCES public.client_accounts(id),
                applicant_order    INT NOT NULL,
                full_name          VARCHAR(255),
                first_name         VARCHAR(100),
                surname            VARCHAR(100),
                birthdate          DATE,
                email              VARCHAR(255)
            );