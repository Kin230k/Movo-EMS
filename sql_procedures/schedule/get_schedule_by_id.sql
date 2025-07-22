CREATE OR REPLACE FUNCTION get_schedule_by_id(p_schedule_id UUID)
RETURNS TABLE (
    scheduleId UUID,
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
    FROM SCHEDULE s
    WHERE s.scheduleId = p_schedule_id;
END;
$$;