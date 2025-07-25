CREATE OR REPLACE PROCEDURE create_schedule(
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_project_id UUID,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO SCHEDULES (
        scheduleId,
        date, 
        startTime, 
        endTime, 
        projectId, 
        locationId
    ) VALUES (
        gen_random_uuid(),
        p_date,
        p_start_time,
        p_end_time,
        p_project_id,
        p_location_id
    ) ;
END;
$$;