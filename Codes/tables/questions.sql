CREATE TABLE QUESTIONS (
    questionId UUID PRIMARY KEY,
    typeCode VARCHAR(30) NOT NULL REFERENCES QUESTION_TYPES(typeCode),
    questionText JSONB NOT NULL CHECK (
        questionText ? 'en' AND 
        questionText ? 'ar' AND
        jsonb_typeof(questionText->'en') = 'string' AND
        jsonb_typeof(questionText->'ar') = 'string'
    ),
    formId UUID NOT NULL REFERENCES FORMS(formId),
    interviewId UUID NOT NULL REFERENCES INTERVIEWS(interviewId)
);