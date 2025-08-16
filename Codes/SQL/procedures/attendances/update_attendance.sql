CREATE OR REPLACE PROCEDURE update_attendance(p_auth_user_id UUID,
 p_attendance_id UUID,
 p_timestamp TIMESTAMP DEFAULT NULL,
 p_signed_with signed_with_type DEFAULT NULL,
 p_signed_by UUID DEFAULT NULL,
 p_user_id UUID DEFAULT NULL,
 p_area_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'update_attendance');

UPDATE ATTENDANCES
 SET
 attendanceTimestamp = COALESCE(p_timestamp, attendanceTimestamp),
 signedWith = COALESCE(p_signed_with, signedWith),
 signedBy = COALESCE(p_signed_by, signedBy),
 userId = COALESCE(p_user_id, userId),
 areaId = COALESCE(p_area_id, areaId)
 WHERE attendanceId = p_attendance_id;
END;
$$;