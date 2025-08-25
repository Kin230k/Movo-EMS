CREATE OR REPLACE FUNCTION get_attendances_by_project(
  p_auth_user_id UUID,
  p_projectId UUID
)
RETURNS TABLE (
  attendanceId UUID,
  attendancetimestamp TIMESTAMP,
  signedWith signed_with_type,
  signedBy UUID,
  userId UUID,
  areaId UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ensure caller is authorized (assumes procedure exists and will RAISE if not allowed)
  CALL check_user_permission(p_auth_user_id, 'get_all_attendances');

  RETURN QUERY
  SELECT
    a.attendanceId,
    a.attendancetimestamp,
    a.signedWith::signed_with_type,
    a.signedBy,
    a.userId,
    a.areaId
  FROM attendances a
  INNER JOIN areas ar ON a.areaId = ar.areaId
  INNER JOIN locations l ON ar.locationId = l.locationId
  WHERE l.projectId = p_projectId;
END;
$$;