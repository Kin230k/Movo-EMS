CREATE OR REPLACE PROCEDURE delete_interview(p_auth_user_id UUID, p_interview_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_interview');

DELETE FROM INTERVIEWS
    WHERE interviewId = p_interview_id;
END;
$$;