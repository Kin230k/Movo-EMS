CREATE OR REPLACE FUNCTION get_attendance_by_user(p_user_id UUID)
RETURNS TABLE (
  attendanceId UUID,
  attendanceDate         DATE,
  attendanceTime         TIME,
  areaId       UUID
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.attendanceId,
    a.date as attendanceDate,
    a.time as attendanceTime,
    a.areaId
  FROM ATTENDANCES a
  WHERE a.userId = p_user_id;
END;
$$;
