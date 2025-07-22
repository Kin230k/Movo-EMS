CREATE OR REPLACE FUNCTION get_attendance_by_user(p_user_id UUID)
RETURNS TABLE (
    attendanceId UUID,
    date DATE,
    time TIME,
    areaId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.attendanceId,
        a.date,
        a.time,
        a.areaId
    FROM ATTENDANCES a
    WHERE a.userId = p_user_id;
END;
$$;