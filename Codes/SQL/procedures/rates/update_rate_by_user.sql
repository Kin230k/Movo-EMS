CREATE OR REPLACE PROCEDURE update_rate_by_user(p_auth_user_id UUID,
 p_hourly_rate NUMERIC(10,2) DEFAULT NULL,
 p_user_id UUID DEFAULT NULL,
 p_project_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_rate_by_user');

UPDATE RATES
 SET
 hourlyRate = COALESCE(p_hourly_rate, hourlyRate),
 WHERE userId = p_user_id and projectId=p_project_id;
END;
$$;