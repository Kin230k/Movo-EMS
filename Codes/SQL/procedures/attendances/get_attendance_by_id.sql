CREATE OR REPLACE FUNCTION get_attendance_by_id(p_attendance_id UUID)
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


RETURN QUERY
 SELECT
 a.attendanceId,
 a.attendanceTimestamp,
 a.signedWith::signed_with_type,
 a.signedBy,
 a.userId,
 a.areaId
 FROM ATTENDANCES a
 WHERE a.attendanceId = p_attendance_id;
END;
$$;