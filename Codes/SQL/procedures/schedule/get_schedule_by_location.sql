CREATE OR REPLACE FUNCTION get_schedule_by_location(p_auth_user_id UUID, p_location_id UUID)
RETURNS TABLE (
    scheduleId UUID,
    createdAt DATE,
    startTime TIME,
    endTime TIME,
    projectId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_schedule_by_location');

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.createdAt,
        s.startTime,
        s.endTime,
        s.projectId
    FROM SCHEDULES s
    WHERE s.locationId = p_location_id;
END;
$$;
