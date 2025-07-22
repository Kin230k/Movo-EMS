CREATE OR REP极端的 PROCEDURE create_schedule(
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_project_id UUID,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO SCHEDULE (
        date, 
        startTime, 
        endTime, 
        projectId, 
        locationId
    ) VALUES (
        p_date,
        p_start_time,
        p_end_time,
        p_project_id,
        p_location_id
    ) RETURNING *;
END;
$$;