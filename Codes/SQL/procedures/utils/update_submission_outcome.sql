CREATE OR REPLACE FUNCTION update_submission_outcome(sub_id UUID)
RETURNS VOID AS $$
DECLARE
  any_failed           BOOLEAN;
  all_passed           BOOLEAN;
  any_manual           BOOLEAN;
  has_answers          BOOLEAN;
  correct_count        INTEGER := 0;
  total_count          INTEGER := 0;
  new_outcome          submission_outcome;
  sub_interview_id     UUID;
  min_score            INTEGER;
BEGIN
  -- Aggregate answer results for this submission
  SELECT
    COALESCE(BOOL_OR(ar.outcome = 'FAILED'), FALSE),
    COALESCE(BOOL_AND(ar.outcome = 'PASSED'), FALSE),
    COALESCE(BOOL_OR(ar.outcome = 'MANUAL'), FALSE),
    COUNT(*) > 0,
    COALESCE(SUM(CASE WHEN ar.outcome = 'PASSED' THEN 1 ELSE 0 END), 0),
    COUNT(*)
  INTO any_failed, all_passed, any_manual, has_answers, correct_count, total_count
  FROM answer_results ar
  JOIN answers a USING (answerid)
  WHERE a.submissionid = sub_id;

  -- Persist counts on the submission record
  UPDATE submissions
     SET answer_count = total_count,
         correct_answer_count = correct_count
   WHERE submissionid = sub_id;

  -- Determine whether this submission is for a form or an interview
  SELECT interviewId INTO sub_interview_id
    FROM submissions
   WHERE submissionId = sub_id;

  IF sub_interview_id IS NOT NULL THEN
    -- Interview case: compare correct answers to interview.minimumScore
    SELECT COALESCE(minimumScore, 0) INTO min_score
      FROM interviews
     WHERE interviewId = sub_interview_id;

    IF NOT has_answers THEN
      new_outcome := 'MANUAL_REVIEW'::submission_outcome;
    ELSIF correct_count >= min_score THEN
      new_outcome := 'ACCEPTED'::submission_outcome;
    ELSE
      new_outcome := 'REJECTED'::submission_outcome;
    END IF;
  ELSE
    -- Form case: original logic based on per-answer outcomes
    IF NOT has_answers THEN
      new_outcome := 'MANUAL_REVIEW'::submission_outcome;
    ELSIF any_failed THEN
      new_outcome := 'REJECTED'::submission_outcome;
    ELSIF all_passed THEN
      new_outcome := 'ACCEPTED'::submission_outcome;
    ELSIF any_manual THEN
      new_outcome := 'MANUAL_REVIEW'::submission_outcome;
    ELSE
      new_outcome := 'MANUAL_REVIEW'::submission_outcome;
    END IF;
  END IF;

  UPDATE submissions
     SET outcome = new_outcome
   WHERE submissionid = sub_id;

END;
$$ LANGUAGE plpgsql;
