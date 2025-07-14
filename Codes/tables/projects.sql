CREATE TABLE PROJECTS (
    projectId UUID PRIMARY KEY,
    clientId UUID NOT NULL REFERENCES CLIENTS(clientId),
    name VARCHAR(255) NOT NULL UNIQUE,
    badgeBackground VARCHAR(512),
    startingDate DATE NOT NULL DEFAULT CURRENT_DATE,
    endingDate DATE,
    description VARCHAR(2000)
);
