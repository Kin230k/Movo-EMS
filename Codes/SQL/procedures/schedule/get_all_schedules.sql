CREATE OR REPLACE FUNCTION get_all_schedules()
RETURNS TABLE (
    scheduleId UUID,
    date DATE,
    startTime TIME,
    endTime TIME,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_schedules');

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.date,
        s.startTime,
        s.endTime,
        s.projectId,
        s.locationId
    FROM SCHEDULES s;
END;
$$;