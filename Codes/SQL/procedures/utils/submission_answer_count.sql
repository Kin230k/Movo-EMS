CREATE OR REPLACE FUNCTION submission_answer_count(p_submissionid UUID)
RETURNS VOID AS $$          
BEGIN
  UPDATE submissions
  SET answer_count = COALESCE(answer_count, 0) + 1
  WHERE submissionid = p_submissionid;

  IF NOT FOUND THEN
    RAISE NOTICE 'submission_answer_count: submission % not found', p_submissionid;
  END IF;
END;
$$ LANGUAGE plpgsql;
