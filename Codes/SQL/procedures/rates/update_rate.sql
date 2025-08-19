CREATE OR REPLACE PROCEDURE update_rate(p_auth_user_id UUID,
 p_rate_id UUID,
 p_hourly_rate NUMERIC(10,2) DEFAULT NULL,
 p_user_id UUID DEFAULT NULL,
 p_project_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_rate');

UPDATE RATES
 SET
 hourlyRate = COALESCE(p_hourly_rate, hourlyRate),
 userId = COALESCE(p_user_id, userId),
 projectId = COALESCE(p_project_id, projectId)
 WHERE rateId = p_rate_id;
END;
$$;