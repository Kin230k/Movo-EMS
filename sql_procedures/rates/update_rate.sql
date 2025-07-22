CREATE OR REPLACE PROCEDURE update_rate(
    p_rate_id UUID,
    p_hourly_rate NUMERIC(10,2),
    p_user_id UUID,
    p_project_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE RATES
    SET 
        hourlyRate = p_hourly_rate,
        userId = p_user_id,
        projectId = p_project_id
    WHERE rateId = p_rate_id;
END;
$$;