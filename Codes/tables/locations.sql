CREATE TABLE LOCATIONS (
    locationId UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    projectId UUID NOT NULL REFERENCES PROJECTS(projectId),
    siteMap VARCHAR(512),
    longitude NUMERIC,
    latitude NUMERIC
);