CREATE TABLE ACTIONS (
    actionId UUID PRIMARY KEY,
    actionType VARCHAR(100) NOT NULL UNIQUE,
    displayName JSONB NOT NULL DEFAULT '{"en": "", "ar": ""}'::jsonb CHECK (
        displayName ? 'en' AND 
        displayName ? 'ar' AND
        jsonb_typeof(displayName->'en') = 'string' AND
        jsonb_typeof(displayName->'ar') = 'string'
    )
);
