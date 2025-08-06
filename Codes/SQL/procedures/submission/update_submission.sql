CREATE OR REPLACE PROCEDURE update_submission(p_auth_user_id UUID, 
    p_submission_id UUID,
    p_form_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_interview_id UUID DEFAULT NULL,
    p_date_submitted TIMESTAMP DEFAULT NULL,
    p_outcome submission_outcome DEFAULT NULL,
    p_decision_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_submission');

UPDATE SUBMISSIONS
    SET 
        formId = COALESCE(p_form_id, formId),
        userId = COALESCE(p_user_id, userId),
        interviewId = COALESCE(p_interview_id, interviewId),
        dateSubmitted = COALESCE(p_date_submitted, dateSubmitted),
        outcome = COALESCE(p_outcome, outcome),
        decisionNotes = COALESCE(p_decision_notes, decisionNotes)
    WHERE submissionId = p_submission_id;
END;
$$;