CREATE TABLE IF NOT EXISTS ANSWER_RESULTS (
  answerResultId UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
  answerId       UUID                    NOT NULL UNIQUE
    REFERENCES ANSWERS(answerId) ON DELETE CASCADE,
  outcome        answer_result_outcome   NOT NULL
);
