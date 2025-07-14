CREATE TABLE ADMINS (
    adminId UUID PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    qid VARCHAR(20) NOT NULL UNIQUE,
    dateOfBirth DATE,
    jobPosition VARCHAR(100)
);