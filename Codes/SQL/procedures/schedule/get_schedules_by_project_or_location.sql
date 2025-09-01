CREATE OR REPLACE FUNCTION get_schedules_by_project_or_location(
    p_auth_user_id UUID, 
    p_project_id UUID DEFAULT NULL, 
    p_location_id UUID DEFAULT NULL
)
RETURNS TABLE (
    scheduleId UUID,
    createdAt DATE,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_schedules_by_project_or_location');

    -- Validate that at least one parameter is provided
    IF p_project_id IS NULL AND p_location_id IS NULL THEN
        RAISE EXCEPTION 'Either project_id or location_id must be provided';
    END IF;

RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.createdAt,
        s.startTime,
        s.endTime,
        s.projectId,
        s.locationId
    FROM SCHEDULES s
    WHERE (p_project_id IS NOT NULL AND s.projectId = p_project_id)
       OR (p_location_id IS NOT NULL AND s.locationId = p_location_id);
END;
$$;
