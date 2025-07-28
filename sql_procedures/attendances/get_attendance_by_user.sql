
CREATE OR REPLACE FUNCTION get_attendance_by_user(p_user_id UUID)
RETURNS TABLE (
    attendance_id UUID,
    attendance_date DATE,
    attendance_time TIME,
    area_id UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.attendance_id,
        a.attendance_date,
        a.attendance_time,
        a.area_id
    FROM attendances a
    WHERE a.user_id = p_user_id;
END;
$$;
