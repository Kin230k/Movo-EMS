CREATE OR REPLACE PROCEDURE delete_attendance(p_attendance_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ATTENDANCE
    WHERE attendanceId = p_attendance_id;
END;
$$;