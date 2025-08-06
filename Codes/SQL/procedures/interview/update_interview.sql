CREATE OR REPLACE PROCEDURE update_interview(p_auth_user_id UUID, 
    p_interview_id UUID,
    p_project_id UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'update_interview');

UPDATE INTERVIEWS
    SET projectId = COALESCE(p_project_id, projectId)
    WHERE interviewId = p_interview_id;
END;
$$;