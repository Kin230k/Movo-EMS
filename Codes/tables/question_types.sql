CREATE TABLE QUESTION_TYPES (
    typeCode VARCHAR(30) PRIMARY KEY,
    description JSONB NOT NULL CHECK (
        description ? 'en' AND 
        description ? 'ar' AND
        jsonb_typeof(description->'en') = 'string' AND
        jsonb_typeof(description->'ar') = 'string'
    )
);
