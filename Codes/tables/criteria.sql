CREATE TABLE CRITERIA (
    criterionId UUID PRIMARY KEY,
    type criteria_operator NOT NULL,
    value VARCHAR(255),
    questionId UUID NOT NULL REFERENCES QUESTIONS(questionId)
);