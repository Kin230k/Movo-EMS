CREATE OR REPLACE FUNCTION notify_if_submission_complete_from_typed_answer()
RETURNS TRIGGER AS $$
DECLARE
  subid UUID;
  s_formid UUID;
  s_interviewid UUID;
  qcount INT;
  acount INT;
  cur_outcome TEXT;
  payload JSON;
  endpoint TEXT := 'https://<your-cloud-function-url>'; -- replace with your HTTPS callable endpoint
BEGIN
  -- find parent submission
  SELECT submissionid INTO subid FROM answers WHERE answerid = NEW.answerid;
  IF subid IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT formid, interviewid, answer_count INTO s_formid, s_interviewid, acount
  FROM submissions WHERE submissionid = subid;

  -- compute expected questions
  IF s_formid IS NOT NULL THEN
    SELECT COUNT(*) INTO qcount FROM questions WHERE formid = s_formid;
  ELSIF s_interviewid IS NOT NULL THEN
    SELECT COUNT(*) INTO qcount FROM questions WHERE interviewid = s_interviewid;
  ELSE
    qcount := 0;
  END IF;

  -- if complete, recompute outcome and notify backend
  IF qcount > 0 AND acount >= qcount THEN
    PERFORM update_submission_outcome(subid);
    SELECT outcome::text INTO cur_outcome FROM submissions WHERE submissionid = subid;

    payload := json_build_object(
      'submissionId', subid::text,
      'outcome', cur_outcome,
      'formId', COALESCE(s_formid::text, NULL),
      'interviewId', COALESCE(s_interviewid::text, NULL)
    );

    -- send HTTP POST request to Firebase Cloud Function
    PERFORM
      dblink_exec(
        'dbname=' || current_database(),
        'SELECT
           http_post(' ||
           quote_literal(endpoint) || ', ' ||
           quote_literal(payload::text) || ', ''application/json'')'
      );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
