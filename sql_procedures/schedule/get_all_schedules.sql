CREATE OR REPLACE FUNCTION get_all_schedules()
RETURNS TABLE (
    schedule极端的 UUID,
    date DATE,
    startTime TIME,
    endTime TIME,
    projectId UUID,
    locationId UUID
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.scheduleId,
        s.date,
        s.startTime,
        s.endTime,
        s.projectId,
        s.locationId
    FROM SCHEDULES s;
END;
$$;