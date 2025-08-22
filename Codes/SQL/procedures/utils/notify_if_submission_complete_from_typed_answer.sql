CREATE OR REPLACE FUNCTION notify_if_submission_complete_from_typed_answer(sub_id UUID)
RETURNS VOID AS $$
DECLARE
  s_formid      UUID;
  s_interviewid UUID;
  qcount        INT;
  acount        INT;
  cur_outcome   TEXT;
  payload       JSON;
  endpoint_text TEXT;
BEGIN
  -- get endpoint for current env
  SELECT e.endpoint_text
    INTO endpoint_text
    FROM endpoint e
   WHERE e.type = 'DEV';

  -- fetch submission info
  SELECT formid, interviewid, answer_count
    INTO s_formid, s_interviewid, acount
    FROM submissions
   WHERE submissionid = sub_id;

  -- compute expected questions
  IF s_formid IS NOT NULL THEN
    SELECT COUNT(*) INTO qcount FROM questions WHERE formid = s_formid;
  ELSIF s_interviewid IS NOT NULL THEN
    SELECT COUNT(*) INTO qcount FROM questions WHERE interviewid = s_interviewid;
  ELSE
    qcount := 0;
  END IF;

  -- if complete
  IF qcount > 0 AND acount >= qcount THEN
    PERFORM update_submission_outcome(sub_id);

    SELECT outcome::text
      INTO cur_outcome
      FROM submissions
     WHERE submissionid = sub_id;

    payload := json_build_object(
      'submissionId', sub_id::text,
      'outcome', cur_outcome,
      'formId', COALESCE(s_formid::text, NULL),
      'interviewId', COALESCE(s_interviewid::text, NULL)
    );
  
    wrapped_payload := json_build_object('data', payload);
    -- send HTTP POST request (via http extension / dblink+http)
    PERFORM http_post(endpoint_text, wrapped_payload::text, 'application/json');
  END IF;
END;
$$ LANGUAGE plpgsql;
