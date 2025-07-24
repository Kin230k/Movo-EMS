CREATE TABLE USERS (
    userId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    picture VARCHAR(512),
    role userRole NOT NULL,
    status userStatus NOT NULL DEFAULT 'Active',
    twoFaEnabled BOOLEAN NOT NULL DEFAULT FALSE
);