CREATE OR REPLACE PROCEDURE delete_attendance(p_auth_user_id UUID, p_attendance_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    CALL check_user_permission(p_auth_user_id, 'delete_attendance');

DELETE FROM ATTENDANCES
    WHERE attendanceId = p_attendance_id;
END;
$$;