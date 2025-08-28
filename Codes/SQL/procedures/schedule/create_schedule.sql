CREATE OR REPLACE PROCEDURE create_schedule(p_auth_user_id UUID,
 p_date DATE,
 p_start_time TIME,
 p_end_time TIME,
 p_project_id UUID,
 p_location_id UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_schedule');

-- Validate time logic
 IF p_start_time >= p_end_time THEN
 RAISE EXCEPTION 'Start time (%) must be before end time (%)',
 p_start_time, p_end_time;
 END IF;

 INSERT INTO SCHEDULES (
 scheduleId,
 createdAt,
 startTime,
 endTime,
 projectId,
 locationId
 ) VALUES (
 gen_random_uuid(),
 p_date,
 p_start_time,
 p_end_time,
 p_project_id,
 p_location_id
 );
END;
$$;