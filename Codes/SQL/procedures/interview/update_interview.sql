CREATE OR REPLACE PROCEDURE update_interview(p_auth_user_id UUID,
 p_interview_id UUID,
 p_project_id UUID DEFAULT NULL,
 p_title TEXT DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_interview');

UPDATE INTERVIEWS
 SET projectId = COALESCE(p_project_id, projectId),
 title = COALESCE(p_title, title)
 WHERE interviewId = p_interview_id;
END;
$$;