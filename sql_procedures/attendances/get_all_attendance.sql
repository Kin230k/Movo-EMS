CREATE OR REPLACE FUNCTION get_all_attendances()
RETURNS TABLE (
    attendance_id UUID,  -- Changed from attendanceId (use snake_case convention)
    attendance_date DATE,  -- Avoid reserved word "date"
    attendance_time TIMESTAMP,  -- Avoid reserved word "time"
    signed_with signed_with_type,
    signed_by UUID,  -- Changed from signedBy
    user_id UUID,  -- Changed from userId
    area_id UUID  -- Changed from areaId
) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.attendance_id,  -- Match corrected column name
        a.attendance_date,
        a.attendance_time,
        a.signed_with,
        a.signed_by,
        a.user_id,
        a.area_id
    FROM attendances a;  -- Use lowercase table name
END;
$$;
