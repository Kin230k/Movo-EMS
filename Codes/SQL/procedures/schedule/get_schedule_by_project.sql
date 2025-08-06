CREATE OR REPLACE FUNCTION get_schedule_by_project(p_project_id UUID)
RETURNS TABLE (
    scheduleId UUID,
    date DATE,
    startTime TIME,
    endTime TIME,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_schedule_by_project');

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.date,
        s.startTime,
        s.endTime,
        s.locationId
    FROM SCHEDULES s
    WHERE s.projectId = p_project_id;
END;
$$;