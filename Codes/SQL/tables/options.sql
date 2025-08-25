CREATE TABLE OPTIONS (
    optionId UUID PRIMARY KEY,
    optionText JSONB NOT NULL CHECK (
        optionText ? 'en' AND 
        optionText ? 'ar' AND
        jsonb_typeof(optionText->'en') = 'string' AND
        jsonb_typeof(optionText->'ar') = 'string'
    ),
    questionId UUID NOT NULL REFERENCES QUESTIONS(questionId) ON DELETE CASCADE ON UPDATE CASCADE,
    isCorrect BOOLEAN NOT NULL DEFAULT FALSE,
    displayOrder INT NOT NULL DEFAULT 0
);