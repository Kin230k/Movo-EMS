CREATE TABLE LOCATIONS (
    locationId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    projectId UUID NOT NULL REFERENCES PROJECTS(projectId),
    siteMap VARCHAR(512),
    longitude NUMERIC,
    latitude NUMERIC,

);