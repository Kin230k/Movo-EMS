CREATE TABLE CRITERIA (
    criterionId UUID PRIMARY KEY,
    type criteria_operator NOT NULL,
    value VARCHAR(255) NOT NULL,
    questionId UUID NOT NULL REFERENCES QUESTIONS(questionId) ON DELETE CASCADE ON UPDATE CASCADE,
    effect criterion_effect NOT NULL
    CONSTRAINT criteria_effect_default DEFAULT 'PASS'
);