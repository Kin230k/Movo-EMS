CREATE OR REPLACE FUNCTION get_rate_by_id(p_auth_user_id UUID,p_rate_id UUID)
RETURNS TABLE (
    rateId UUID,
    hourlyRate NUMERIC(10,2),
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_rate_by_id');

RETURN QUERY 
    SELECT 
        r.rateId,
        r.hourlyRate,
        r.userId,
        r.projectId
    FROM RATES r
    WHERE r.rateId = p_rate_id;
END;
$$;