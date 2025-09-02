CREATE TYPE signed_with_type AS ENUM ('BARCODE', 'MANUAL');
CREATE TYPE criteria_operator AS ENUM ('>', '<', '=', '>=', '<=', '!=', 'contains', 'between');
CREATE TYPE user_status AS ENUM ('Active', 'Inactive');
CREATE TYPE submission_outcome AS ENUM ('ACCEPTED', 'REJECTED', 'MANUAL_REVIEW');
CREATE TYPE user_role AS ENUM (
    'User',
    'Marshall', 
    'Supervisor', 
    'Senior Supervisor', 
    'Super Admin', 
    'Main User', 
    'System Admin'
);
CREATE TYPE answer_result_outcome AS ENUM (
      'PASSED',
      'FAILED',
      'MANUAL'
    );
CREATE TYPE criterion_effect AS ENUM ('PASS', 'FAIL');

CREATE TYPE client_status AS ENUM (
    'pending',
    'accepted',
    'rejected'
);
CREATE TYPE question_types AS ENUM
(
'OPEN_ENDED',
'SHORT_ANSWER',
'NUMBER',
'RATE',
'DROPDOWN',
'RADIO',
'MULTIPLE_CHOICE'
)