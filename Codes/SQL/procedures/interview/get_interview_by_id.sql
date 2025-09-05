CREATE OR REPLACE FUNCTION get_interview_by_id(p_auth_user_id UUID,p_interview_id UUID)
RETURNS TABLE (interviewId UUID, projectId UUID,title TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_interview_by_id');

RETURN QUERY
 SELECT
 i.interviewId,
 i.projectId,
 i.title
 FROM INTERVIEWS i
 WHERE i.interviewId = p_interview_id;
END;
$$;