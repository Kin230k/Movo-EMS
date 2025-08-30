CREATE TABLE QUESTIONS (
    questionId UUID PRIMARY KEY,
    typeCode question_types NOT NULL,
    questionText TEXT NOT NULL,  -- Changed from JSONB to TEXT
    formId UUID  REFERENCES FORMS(formId) ON DELETE CASCADE ON UPDATE CASCADE,
    interviewId UUID  REFERENCES INTERVIEWS(interviewId) ON DELETE CASCADE ON UPDATE CASCADE
    CHECK (
       (formId  IS NOT NULL AND interviewId IS NULL)
    OR (formId  IS     NULL AND interviewId IS NOT NULL)
    )
);

