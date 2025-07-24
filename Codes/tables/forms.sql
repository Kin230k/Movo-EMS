CREATE TABLE FORMS (
    formId     UUID PRIMARY KEY,
    projectId  UUID REFERENCES PROJECTS(projectId),
    locationId UUID REFERENCES LOCATIONS(locationId),
    CHECK (
       (projectId  IS NOT NULL AND locationId IS     NULL)
    OR (projectId  IS     NULL AND locationId IS NOT NULL)
    )
);
