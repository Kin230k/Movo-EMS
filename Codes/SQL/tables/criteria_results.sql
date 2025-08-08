CREATE TABLE CRITERIA_RESULTS (
    criterionResultId UUID PRIMARY KEY,
    answerId         UUID NOT NULL
                        REFERENCES ANSWERS(answerId)
                        ON DELETE CASCADE ON UPDATE CASCADE,
    criterionId      UUID NOT NULL
                        REFERENCES CRITERIA(criterionId)
                        ON DELETE CASCADE ON UPDATE CASCADE,
    outcome          answer_result_outcome NOT NULL,
    evaluatedAt      TIMESTAMP    NOT NULL
                        DEFAULT CURRENT_TIMESTAMP
);

