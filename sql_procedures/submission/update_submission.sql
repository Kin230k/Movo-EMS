CREATE OR REPLACE PROCEDURE update_submission(
    p_submission_id UUID,
    p_form_id UUID,
    p_user_id UUID,
    p_interview_id UUID,
    p_date_submitted TIMESTAMP,
    p_outcome submission_outcome,
    p_decision_notes TEXT
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE SUBMISSIONS
    SET 
        formId = p_form_id,
        userId = p_user_id,
        interviewId = p_interview_id,
        dateSubmitted = p_date_submitted,
        outcome = p_outcome,
        decisionNotes = p_decision_notes
    WHERE submissionId = p_submission_id;
END;
$$;