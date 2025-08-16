CREATE OR REPLACE FUNCTION get_all_attendances(p_auth_user_id UUID)
RETURNS TABLE (
 attendanceId UUID,
 attendanceTimestamp TIMESTAMP,
 signedWith signed_with_type,
 signedBy UUID,
 userId UUID,
 areaId UUID
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'get_all_attendances');
RETURN QUERY
 SELECT
 a.attendanceId,
 a.attendanceTimestamp,
 a.signedWith,
 a.signedBy,
 a.userId,
 a.areaId
 FROM ATTENDANCES a;
END;
$$;