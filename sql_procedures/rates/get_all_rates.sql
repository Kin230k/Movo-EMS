CREATE OR REPLACE FUNCTION get_all_rates()
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
    FROM RATES r;
END;
$$;