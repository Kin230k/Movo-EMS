CREATE OR REPLACE FUNCTION get_interview_by_id(p_interview_id UUID)
RETURNS TABLE (interviewId UUID, projectId UUID)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        i.interviewId,
        i.projectId
    FROM INTERVIEW i
    WHERE i.interviewId = p_interview_id;
END;
$$;