CREATE OR REPLACE FUNCTION get_all_attendances()
RETURNS TABLE (
    attendanceId UUID,
    date DATE,
    time TIME,
    signedWith signed_with_type,
    signedBy UUID,
    userId UUID,
    areaId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        a.attendanceId,
        a.date,
        a.time,
        a.signedWith,
        a.signedBy,
        a.userId,
        a.areaId
    FROM ATTENDANCES a;
END;
$$;