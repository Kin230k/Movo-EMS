CREATE TABLE PROJECTS (
    projectId UUID PRIMARY KEY,
    clientId UUID NOT NULL REFERENCES CLIENTS(clientId),
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    badgeBackground VARCHAR(512),
    startingDate DATE NOT NULL DEFAULT CURRENT_DATE,
    endingDate DATE,
    description JSONB CHECK (
        description IS NULL OR (
            description ? 'en' AND 
            description ? 'ar' AND
            jsonb_typeof(description->'en') = 'string' AND
            jsonb_typeof(description->'ar') = 'string'
        )
    ),
);