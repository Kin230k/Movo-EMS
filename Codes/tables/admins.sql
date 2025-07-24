CREATE TABLE ADMINS (
    adminId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    qid VARCHAR(20) NOT NULL UNIQUE,
    dateOfBirth DATE,
    jobPosition VARCHAR(100)
);
