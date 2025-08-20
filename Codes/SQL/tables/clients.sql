CREATE TABLE CLIENTS (
    clientId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    logo VARCHAR(512),
    company JSONB NOT NULL,
    contactEmail VARCHAR(255) NOT NULL UNIQUE,
    contactPhone VARCHAR(20) NOT NULL UNIQUE,
    status client_status NOT NULL DEFAULT 'pending',
);