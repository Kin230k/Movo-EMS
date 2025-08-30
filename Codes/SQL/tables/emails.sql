CREATE TABLE EMAILS (
    emailId   UUID    PRIMARY KEY,
    title     TEXT    NOT NULL,  -- Changed from JSONB to TEXT
    body      TEXT    NOT NULL,  -- Changed from JSONB to TEXT
    formId    UUID    NOT NULL
      REFERENCES FORMS(formId) ON DELETE CASCADE ON UPDATE CASCADE
);