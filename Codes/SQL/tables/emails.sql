CREATE TABLE EMAILS (
    emailId   UUID    PRIMARY KEY,
    title     JSONB   NOT NULL CHECK (
        title  ? 'en' AND
        title  ? 'ar' AND
        jsonb_typeof(title -> 'en') = 'string' AND
        jsonb_typeof(title -> 'ar') = 'string'
    ),
    body      JSONB   NOT NULL CHECK (
        body   ? 'en' AND
        body   ? 'ar' AND
        jsonb_typeof(body  -> 'en') = 'string' AND
        jsonb_typeof(body  -> 'ar') = 'string'
    ),
    formId    UUID    NOT NULL
      REFERENCES FORMS(formId) ON DELETE CASCADE ON UPDATE CASCADE
);