CREATE OR REPLACE PROCEDURE create_submission(
    p_form_id UUID,
    p_user_id UUID,
    p_interview_id UUID,
    p_date_submitted DATE,
    p_outcome submission_outcome,
    p_decision_notes TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO SUBMISSION (
        formId, 
        userId, 
        interviewId, 
        dateSubmitted, 
        outcome, 
        decisionNotes
    ) VALUES (
        p_form_id,
        p_user_id,
        p_interview_id,
        p_date_submitted,
        p_outcome,
        p_decision_notes
    ) RETURNING *;
END;
$$;