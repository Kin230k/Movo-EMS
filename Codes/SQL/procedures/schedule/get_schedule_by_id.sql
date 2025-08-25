CREATE OR REPLACE FUNCTION get_schedule_by_id(p_auth_user_id UUID,p_schedule_id UUID)
RETURNS TABLE (
    scheduleId UUID,
    date DATE,
    startTime TIME,
    endTime TIME,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_schedule_by_id');

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.date,
        s.startTime,
        s.endTime,
        s.projectId,
        s.locationId
    FROM SCHEDULES s
    WHERE s.scheduleId = p_schedule_id;
END;
$$;