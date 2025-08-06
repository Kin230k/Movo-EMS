CREATE OR REPLACE FUNCTION get_rate_by_id(p_rate_id UUID)
RETURNS TABLE (
    rateId UUID,
    hourlyRate NUMERIC(10,2),
    userId UUID,
    projectId UUID
) LANGUAGE plpgsql AS $$
BEGIN
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