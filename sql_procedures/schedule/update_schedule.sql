CREATE OR REPLACE PROCEDURE update_schedule(
    p_schedule_id UUID,  -- Added missing parameter
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_project_id UUID,
    p_location_id UUID
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Validate time logic
    IF p_start_time >= p_end_time THEN
        RAISE EXCEPTION 'Start time (%) must be before end time (%)', 
            p_start_time, p_end_time;
    END IF;

    UPDATE SCHEDULES
    SET 
        date = p_date,
        startTime = p_start_time,
        endTime = p_end_time,
        projectId = p_project_id,
        locationId = p_location_id
    WHERE scheduleId = p_schedule_id;  -- Corrected column name
END;
$$;