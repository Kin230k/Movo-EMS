CREATE TABLE USERS (
    userId UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    picture VARCHAR(512),
    role userRole NOT NULL,
    status userStatus NOT NULL DEFAULT 'Active',
    twoFaEnabled BOOLEAN NOT NULL DEFAULT FALSE
);