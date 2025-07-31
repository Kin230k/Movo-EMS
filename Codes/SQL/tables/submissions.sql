CREATE TABLE SUBMISSIONS (
    submissionId UUID PRIMARY KEY,
    formId UUID NOT NULL REFERENCES FORMS(formId),
    userId UUID NOT NULL REFERENCES USERS(userId),
    interviewId UUID NOT NULL REFERENCES INTERVIEWS(interviewId),
    dateSubmitted TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    outcome submission_outcome,
    decisionNotes TEXT
);