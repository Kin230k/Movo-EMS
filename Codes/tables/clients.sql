CREATE TABLE CLIENTS (
    clientId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    logo VARCHAR(512),
    company JSONB CHECK (
        company IS NULL OR (
            company ? 'en' AND 
            company ? 'ar' AND
            jsonb_typeof(company->'en') = 'string' AND
            jsonb_typeof(company->'ar') = 'string'
        )
    ),
    contactEmail VARCHAR(255) NOT NULL UNIQUE,
    contactPhone VARCHAR(20) NOT NULL UNIQUE
);