CREATE OR REPLACE FUNCTION get_all_schedules(p_auth_user_id UUID)
RETURNS TABLE (
    scheduleId UUID,
    createdAt DATE,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_all_schedules');

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.createdAt,
        s.startTime,
        s.endTime,
        s.projectId,
        s.locationId
    FROM SCHEDULES s;
END;
$$;
