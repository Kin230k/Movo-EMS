CREATE TABLE ACTIONS (
    actionId UUID PRIMARY KEY,
    actionType VARCHAR(100) NOT NULL UNIQUE,
    display_name JSONB NOT NULL DEFAULT '{"en": "", "ar": ""}'::jsonb CHECK (
        display_name ? 'en' AND 
        display_name ? 'ar' AND
        jsonb_typeof(display_name->'en') = 'string' AND
        jsonb_typeof(display_name->'ar') = 'string'
    )
);
