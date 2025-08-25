CREATE TABLE DECISION_RULES (
    ruleId UUID PRIMARY KEY,
    name JSONB NOT NULL CHECK (
        name ? 'en' AND 
        name ? 'ar' AND
        jsonb_typeof(name->'en') = 'string' AND
        jsonb_typeof(name->'ar') = 'string'
    ),
    description JSONB CHECK (
        description IS NULL OR (
            description ? 'en' AND 
            description ? 'ar' AND
            jsonb_typeof(description->'en') = 'string' AND
            jsonb_typeof(description->'ar') = 'string'
        )
    ),
    formId UUID REFERENCES FORMS(formId) ON DELETE CASCADE ON UPDATE CASCADE,
    priority INT NOT NULL DEFAULT 0,
    outcomeOnPass submission_outcome,
    outcomeOnFail submission_outcome
);