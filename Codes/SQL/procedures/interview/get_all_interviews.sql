CREATE OR REPLACE FUNCTION get_all_interviews(p_auth_user_id UUID)
RETURNS TABLE (interviewId UUID, projectId UUID)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_interviews');

RETURN QUERY
 SELECT
 i.interviewId,
 i.projectId
 FROM INTERVIEWS i;
END;
$$;