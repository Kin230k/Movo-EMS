CREATE OR REPLACE FUNCTION create_submission(
  p_auth_user_id UUID,
  p_form_id UUID,
  p_user_id UUID,
  p_interview_id UUID,
  p_date_submitted TIMESTAMP,
  p_decision_notes TEXT
)
RETURNS TABLE (
  submissionId UUID,
  formId UUID,
  userId UUID,
  interviewId UUID,
  dateSubmitted TIMESTAMP,
  decisionNotes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub_id   UUID;
  v_form_id  UUID;
  v_user_id  UUID;
  v_int_id   UUID;
  v_date_sub TIMESTAMP;
  v_notes    TEXT;
BEGIN
  -- permission check (will raise if unauthorized)
  CALL check_user_permission(p_auth_user_id, 'create_submission');

  -- Call procedure which performs the insert and returns OUT params
  CALL create_submission_proc(
    p_form_id,
    p_user_id,
    p_interview_id,
    p_date_submitted,
    p_decision_notes,
    v_sub_id,
    v_form_id,
    v_user_id,
    v_int_id,
    v_date_sub,
    v_notes
  );

  -- assign into function output columns and return single row
  submissionId  := v_sub_id;
  formId        := v_form_id;
  userId        := v_user_id;
  interviewId   := v_int_id;
  dateSubmitted := v_date_sub;
  decisionNotes := v_notes;

  RETURN NEXT;
END;
$$;


CREATE OR REPLACE PROCEDURE create_submission_proc(
  p_form_id UUID,
  p_user_id UUID,
  p_interview_id UUID,
  p_date_submitted TIMESTAMP,
  p_decision_notes TEXT,
  OUT o_submissionId UUID,
  OUT o_formId UUID,
  OUT o_userId UUID,
  OUT o_interviewId UUID,
  OUT o_dateSubmitted TIMESTAMP,
  OUT o_decisionNotes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_date_submitted IS NULL THEN
    -- omit dateSubmitted to allow table default (CURRENT_TIMESTAMP) to apply
    INSERT INTO SUBMISSIONS (
      submissionId, formId, userId, interviewId, decisionNotes
    )
    VALUES (
      gen_random_uuid(),
      p_form_id,
      p_user_id,
      p_interview_id,
      p_decision_notes
    )
    RETURNING submissionId, formId, userId, interviewId, dateSubmitted, decisionNotes
    INTO o_submissionId, o_formId, o_userId, o_interviewId, o_dateSubmitted, o_decisionNotes;
  ELSE
    INSERT INTO SUBMISSIONS (
      submissionId, formId, userId, interviewId, dateSubmitted, decisionNotes
    )
    VALUES (
      gen_random_uuid(),
      p_form_id,
      p_user_id,
      p_interview_id,
      p_date_submitted,
      p_decision_notes
    )
    RETURNING submissionId, formId, userId, interviewId, dateSubmitted, decisionNotes
    INTO o_submissionId, o_formId, o_userId, o_interviewId, o_dateSubmitted, o_decisionNotes;
  END IF;
END;
$$;


