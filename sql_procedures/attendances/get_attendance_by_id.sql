
CREATE OR REPLACE FUNCTION get_attendance_by_id(p_attendance_id UUID)
RETURNS TABLE (
    attendance_id UUID,
    attendance_date DATE,
    attendance_time TIME,
    signed_with signed_with_type,
    signed_by UUID,
    user_id UUID,
    area_id UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.attendance_id,
        a.attendance_date,
        a.attendance_time,
        a.signed_with,
        a.signed_by,
        a.user_id,
        a.area_id
    FROM attendances a
    WHERE a.attendance_id = p_attendance_id;
END;
$$;
