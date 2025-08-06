CREATE OR REPLACE PROCEDURE delete_submission(p_auth_user_id UUID, p_submission_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_submission');

DELETE FROM SUBMISSIONS
    WHERE submissionId = p_submission_id;
END;
$$;