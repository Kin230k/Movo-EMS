CREATE OR REPLACE PROCEDURE delete_submission(p_submission_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM SUBMISSIONS
    WHERE submissionId = p_submission_id;
END;
$$;