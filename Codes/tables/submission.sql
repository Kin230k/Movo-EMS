CREATE TABLE SUBMISSION (
    submissionId UUID PRIMARY KEY,
    formId UUID NOT NULL REFERENCES FORMS(formId),
    userId UUID NOT NULL REFERENCES USERS(userId),
    interviewId UUID NOT NULL REFERENCES INTERVIEW(interviewId),
    dateSubmitted DATE NOT NULL DEFAULT CURRENT_DATE,
    outcome submission_outcome,
    decisionNotes TEXT
);