CREATE TABLE submissions (
  submissionId UUID PRIMARY KEY,
  formId UUID NOT NULL
    REFERENCES forms(formId) ON DELETE CASCADE ON UPDATE CASCADE,
  userId UUID NOT NULL
    REFERENCES users(userId) ON DELETE CASCADE ON UPDATE CASCADE,
  interviewId UUID
    REFERENCES interviews(interviewId) ON DELETE CASCADE ON UPDATE CASCADE,
  dateSubmitted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  outcome submission_outcome DEFAULT 'MANUAL_REVIEW'::submission_outcome,
  decisionNotes TEXT,
  answer_count INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT submissions_user_form_unique UNIQUE (userId, formId)
);
  