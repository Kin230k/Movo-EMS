CREATE OR REPLACE FUNCTION get_all_rates(p_auth_user_id UUID)
RETURNS TABLE (
    rateId UUID,
    hourlyRate NUMERIC(10,2),
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_rates');

RETURN QUERY 
    SELECT 
        r.rateId,
        r.hourlyRate,
        r.userId,
        r.projectId
    FROM RATES r;
END;
$$;