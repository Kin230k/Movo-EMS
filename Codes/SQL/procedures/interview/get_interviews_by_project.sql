CREATE OR REPLACE FUNCTION get_interviews_by_project(p_auth_user_id UUID,p_projectId UUID)
RETURNS TABLE (interviewId UUID, projectId UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_interviews_by_project');

RETURN QUERY
 SELECT
 i.interviewId,
 i.projectId
 FROM INTERVIEWS i
 where i.projectId=p_projectId;
END;
$$;