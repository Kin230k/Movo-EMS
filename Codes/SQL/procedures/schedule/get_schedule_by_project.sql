CREATE OR REPLACE FUNCTION get_schedule_by_project(p_auth_user_id UUID,p_project_id UUID)
RETURNS TABLE (
    scheduleId UUID,
    createdAt DATE,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_schedule_by_project');

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.createdAt,
        s.startTime,
        s.endTime,
        s.locationId
    FROM SCHEDULES s
    WHERE s.projectId = p_project_id;
END;
$$;
