CREATE TYPE signed_with_type AS ENUM ('BARCODE', 'MANUAL');
CREATE TYPE criteria_operator AS ENUM ('>', '<', '=', '>=', '<=', '!=', 'contains', 'between');
CREATE TYPE user_status AS ENUM ('Active', 'Inactive');
CREATE TYPE submission_outcome AS ENUM ('ACCEPTED', 'REJECTED', 'MANUAL_REVIEW');
CREATE TYPE user_role AS ENUM (
    'Marshall', 
    'Supervisor', 
    'Senior Supervisor', 
    'Super Admin', 
    'Main User', 
    'System Admin'
);