CREATE TABLE ADMINS (
    adminId UUID PRIMARY KEY,
    firstName JSONB NOT NULL CHECK (
        firstName ? 'en' AND 
        firstName ? 'ar' AND
        jsonb_typeof(firstName->'en') = 'string' AND
        jsonb_typeof(firstName->'ar') = 'string'
    ),
    lastName JSONB NOT NULL CHECK (
        lastName ? 'en' AND 
        lastName ? 'ar' AND
        jsonb_typeof(lastName->'en') = 'string' AND
        jsonb_typeof(lastName->'ar') = 'string'
    ),
    qid VARCHAR(20) NOT NULL UNIQUE,
    dateOfBirth DATE,
    jobPosition VARCHAR(100)
);
