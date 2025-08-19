CREATE OR REPLACE PROCEDURE create_interview(p_auth_user_id UUID, p_project_id UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_interview');

INSERT INTO INTERVIEWS (interviewId,projectId)
 VALUES (gen_random_uuid(),p_project_id)
;
END;
$$;