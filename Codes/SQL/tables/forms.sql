CREATE TABLE FORMS (
    formId        UUID PRIMARY KEY,
    projectId     UUID REFERENCES PROJECTS(projectId) ON DELETE CASCADE ON UPDATE CASCADE,
    locationId    UUID REFERENCES LOCATIONS(locationId) ON DELETE CASCADE ON UPDATE CASCADE,
    form_language TEXT NOT NULL,
    form_title    TEXT NOT NULL,
    CHECK (
       (projectId  IS NOT NULL AND locationId IS     NULL)
    OR (projectId  IS     NULL AND locationId IS NOT NULL)
    )
);
