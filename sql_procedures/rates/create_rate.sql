CREATE OR REPLACE PROCEDURE create_rate(
    p_hourly_rate NUMERIC(10,2),
    p_user_id UUID,
    p_project_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO RATES (
        hourlyRate, 
        userId, 
        projectId
    ) VALUES (
        p_hourly_rate,
        p_user_id,
        p_project_id
    ) RETURNING *;
END;
$$;