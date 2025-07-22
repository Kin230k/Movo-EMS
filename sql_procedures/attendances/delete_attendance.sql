CREATE OR REPLACE PROCEDURE delete_attendance(p_attendance_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM ATTENDANCES
    WHERE attendanceId = p_attendance_id;
END;
$$;