CREATE OR REPLACE PROCEDURE create_rate(p_auth_user_id UUID,
 p_hourly_rate NUMERIC(10,2),
 p_user_id UUID,
 p_project_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_rate');

INSERT INTO RATES (
 rateId,
 hourlyRate,
 userId,
 projectId
 ) VALUES (
 gen_random_uuid(),
 p_hourly_rate,
 p_user_id,
 p_project_id
 );
END;
$$;