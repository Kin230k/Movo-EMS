CREATE TABLE DECISION_RULES (
    ruleId UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    formId UUID REFERENCES FORMS(formId),
    priority INT NOT NULL DEFAULT 0,
    outcomeOnPass submission_outcome,
    outcomeOnFail submission_outcome
);