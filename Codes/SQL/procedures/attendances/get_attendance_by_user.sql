CREATE OR REPLACE FUNCTION get_attendance_by_user(p_user_id UUID)
RETURNS TABLE (
    attendanceId         UUID,
    attendanceTimestamp  TIMESTAMP,
    areaId               UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'get_attendance_by_user');

RETURN QUERY
    SELECT
        a.attendanceId,
        a.attendanceTimestamp,
        a.areaId
    FROM ATTENDANCES a
    WHERE a.userId = p_user_id;
END;
$$;