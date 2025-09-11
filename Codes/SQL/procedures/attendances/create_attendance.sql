CREATE OR REPLACE PROCEDURE create_attendance(p_auth_user_id UUID,
 p_timestamp TIMESTAMP,
 p_signed_with signed_with_type,
 p_signed_by UUID DEFAULT NULL,
 p_user_id UUID DEFAULT NULL,
 p_area_id UUID DEFAULT NULL
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
 CALL check_user_permission(p_auth_user_id, 'create_attendance');
 IF p_signed_by IS NULL THEN
  p_signed_by = '00000000-0000-0000-0000-000000000000';
 END IF;
INSERT INTO ATTENDANCES (
 attendanceId,
 attendanceTimestamp,
 signedWith,
 signedBy,
 userId,
 areaId
 ) VALUES (
 gen_random_uuid(),
 p_timestamp,
 p_signed_with,
 p_signed_by,
 p_user_id,
 p_area_id
 );
END;
$$;
