CREATE OR REPLACE FUNCTION calculate_monthly_salary(
  p_year INT,
  p_month INT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  total_monthly NUMERIC := 0;
BEGIN
  WITH attended_days AS (
    SELECT 
      u.userId,
      l.projectId,
      a.attendanceTimestamp::date AS attendance_date,
      EXTRACT(EPOCH FROM (MAX(a.attendanceTimestamp) - MIN(a.attendanceTimestamp)))/3600.0 AS actual_hours,
      COUNT(*) AS attendance_count,
      l.locationId
    FROM ATTENDANCES a
    JOIN AREAS ar ON a.areaId = ar.areaId
    JOIN LOCATIONS l ON ar.locationId = l.locationId
    JOIN USERS u ON a.userId = u.userId
      AND EXTRACT(YEAR FROM a.attendanceTimestamp) = p_year
      AND EXTRACT(MONTH FROM a.attendanceTimestamp) = p_month
    GROUP BY u.userId, l.projectId, a.attendanceTimestamp::date, l.locationId
    HAVING COUNT(*) >= 2
  ),
  attended_shifts AS (
    SELECT
      ad.userId,
      ad.projectId,
      ad.attendance_date,
      ad.actual_hours,
      (EXTRACT(EPOCH FROM (s.endTime - s.startTime)) / 3600.0) AS scheduled_hours
    FROM attended_days ad
    JOIN SCHEDULES s
      ON s.createdAt = ad.attendance_date
     AND s.locationId = ad.locationId
  )
  SELECT COALESCE(SUM(
      LEAST(ash.actual_hours, ash.scheduled_hours) * r.hourlyRate
      + GREATEST(ash.actual_hours - ash.scheduled_hours, 0) * r.hourlyRate * 1.5
    ), 0)
  INTO total_monthly
  FROM attended_shifts ash
  JOIN RATES r
    ON ash.userId = r.userId
   AND ash.projectId = r.projectId;

  -- return as integer (casts/truncates toward zero)
  RETURN total_monthly::INTEGER;

  -- If you prefer rounding instead of truncation use:
  -- RETURN ROUND(total_monthly)::INTEGER;
END;
$$ STABLE;

