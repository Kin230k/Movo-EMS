DROP FUNCTION IF EXISTS get_user_attendances_by_project(p_auth_user_id UUID, p_project_id UUID);
CREATE OR REPLACE FUNCTION get_user_attendances_by_project(
    p_auth_user_id UUID,
    p_project_id UUID
)
RETURNS TABLE (
    userId UUID,
    name JSONB,
    role user_role,
    userStatus user_status,
    picture VARCHAR(512),
    attendanceTimestamp TIMESTAMP,
    attendanceStatus TEXT,
    attendanceId UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the caller has permission
    CALL check_user_permission(p_auth_user_id, 'get_user_attendances_by_project');

    -- Return attendances for the given project
    RETURN QUERY
    SELECT 
        v.userId,
        v.name,
        v.role::user_role,
        v.userStatus::user_status,
        v.picture,
        v.attendanceTimestamp,
        v.attendanceStatus,
        v.attendanceId
    FROM v_project_user_attendances v
    WHERE v.projectId = p_project_id;
END;
$$;