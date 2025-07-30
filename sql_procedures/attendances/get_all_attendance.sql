CREATE OR REPLACE FUNCTION get_all_attendances()
RETURNS TABLE (
    attendanceId UUID,
    attendanceDate         DATE,
    attendanceTime         TIME,
    signedWith   signed_with_type,
    signedBy     UUID,
    userId       UUID,
    areaId       UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.attendanceId,
        a.date as attendanceDate,
        a.time as attendanceTime,
        a.signedWith,
        a.signedBy,
        a.userId,
        a.areaId
    FROM ATTENDANCES a;            -- ← use ATTENDANCES everywhere
END;
$$;